'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import Header from './Header';
import Spellbook from './Spellbook';
import Hud from './Hud';
import QuestBoard from './QuestBoard';
import RoomTransition from './RoomTransition';
import VictoryScroll from './VictoryScroll';
import type { Language } from '@/lib/languages';
import { getLanguage } from '@/lib/languages';
import { executeCode, createQuests } from '@/app/actions/code';
import { useToast } from '@/hooks/use-toast';
import { onValue, ref } from 'firebase/database';
import { db, auth } from '@/lib/firebase';
import type { Quest } from '@/ai/flows/generate-coding-quests';
import { dungeons, type DungeonLevel } from '@/lib/dungeons';

export type LogMessage = {
  type: 'SYSTEM' | 'QUEST' | 'ERROR' | 'SUCCESS' | 'INFO' | 'DEBUG';
  message: string;
  timestamp: number;
};

export type PartyMember = {
  name: string;
  online: boolean;
};

interface CodeDungeonProps {
  roomId?: string;
  playerName: string;
  onExit: () => void;
}

export default function CodeDungeon({ roomId = 'tavern-room-alpha', playerName, onExit }: CodeDungeonProps) {
  const [isQuestBoardOpen, setQuestBoardOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);

  useEffect(() => {
    const checkFullscreen = () => setIsFullscreen(!!document.fullscreenElement);
    checkFullscreen();
    document.addEventListener('fullscreenchange', checkFullscreen);
    return () => document.removeEventListener('fullscreenchange', checkFullscreen);
  }, []);

  const requestFullscreen = () => {
    document.documentElement.requestFullscreen().catch(err => {
      console.error("Error attempting to enable fullscreen:", err);
    });
  };

  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [code, setCode] = useState<string>("// Welcome to the Guild, Adventurer!");
  const [language, setLanguage] = useState<Language>({ name: "c++", version: "10.2.0", alias: "cpp" });
  const [party, setParty] = useState<Record<string, PartyMember>>({});
  const [isCasting, setIsCasting] = useState(false);
  // roomId is now a prop
  const { toast } = useToast();
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);

  const handleExit = async () => {
    // Check if we are the last one
    const onlineCount = Object.values(party).filter(p => p.online).length;

    if (onlineCount <= 1) {
      // Terminate room
      const { remove, ref } = await import('firebase/database');
      // We remove the entire session
      await remove(ref(db, `dungeon-sessions/${roomId}`));
    } else {
      // Just mark myself offline (will be handled by effect cleanup mostly, but explicit good)
      const user = auth.currentUser;
      if (user) {
        const { update, ref } = await import('firebase/database');
        await update(ref(db, `dungeon-sessions/${roomId}/partyMembers/${user.uid}`), { online: false });
      }
    }

    onExit();
  };

  const [quests, setQuests] = useState<Quest[]>([]);
  const [questClaims, setQuestClaims] = useState<Record<number, { uid: string, name: string }>>({});
  const [isGeneratingQuests, setIsGeneratingQuests] = useState(false);
  const [hp, setHp] = useState(100);
  const [mana, setMana] = useState(100);
  const [gold, setGold] = useState(2500);
  const [isCombatLogExpanded, setIsCombatLogExpanded] = useState(false);
  const [completedQuestsCount, setCompletedQuestsCount] = useState(0);
  const [completedQuestTitles, setCompletedQuestTitles] = useState<string[]>([]);
  const [currentDungeon, setCurrentDungeon] = useState<DungeonLevel>(dungeons[0]);

  const logToConsole = useCallback((message: string, type: LogMessage['type']) => {
    setLogs(prevLogs => {
      const newLog = { message, type, timestamp: Date.now() };
      const newLogs = [...prevLogs, newLog];
      return newLogs.slice(-100); // Keep only last 100 logs to prevent memory leak
    });
  }, []);

  // Function to apply theme
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(currentDungeon.theme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [currentDungeon]);

  const getCommentedQuestBrief = (brief: string, langAlias: string) => {
    const lines = brief.split('\n');
    if (lines.length > 1) {
      return `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`;
    }
    return `// ${brief}`;
  }

  // --- Firebase Sync --

  // 1. Quests & Claims Sync
  useEffect(() => {
    const questsRef = ref(db, `dungeon-sessions/${roomId}/quests`);
    const claimsRef = ref(db, `dungeon-sessions/${roomId}/questClaims`);
    const completedRef = ref(db, `dungeon-sessions/${roomId}/completedQuests`);

    const unsubQuests = onValue(questsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setQuests(data);
      else setQuests([]);
      setIsGeneratingQuests(false);
    });

    const unsubClaims = onValue(claimsRef, (snapshot) => {
      const data = snapshot.val();
      setQuestClaims(data || {});
    });

    const unsubCompleted = onValue(completedRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const completedList = Object.values(data) as { title: string }[];
        setCompletedQuestTitles(completedList.map(q => q.title));
        setCompletedQuestsCount(completedList.length);
      } else {
        setCompletedQuestTitles([]);
        setCompletedQuestsCount(0);
      }
    });

    return () => {
      unsubQuests();
      unsubClaims();
      unsubCompleted();
    }
  }, [roomId]);


  // 2. Player Progress Sync (Load on entry)
  useEffect(() => {
    // We need to wait for Auth to be ready.
    // import onAuthStateChanged to listen.
    // Actually `auth` is exported from `@/lib/firebase`. We can use it.
    // But `onAuthStateChanged` needs to be imported from 'firebase/auth'.
    // Or we can dynamically import.

    let unsubscribeAuth: (() => void) | undefined;

    import('firebase/auth').then(({ onAuthStateChanged }) => {
      unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const { set, onDisconnect, ref } = await import('firebase/database');
          const partyRef = ref(db, `dungeon-sessions/${roomId}/partyMembers/${user.uid}`);

          // Write presence
          await set(partyRef, { name: `wizard-${playerName}`, online: true });
          onDisconnect(partyRef).update({ online: false });
        }
      });
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    }
  }, [roomId, playerName]);


  const getDifficultyForRoom = (roomIndex: number) => {
    if (roomIndex < 2) return 'Apprentice'; // Rooms 1 & 2
    if (roomIndex < 4) return 'Master';     // Rooms 3 & 4
    return 'Legendary';                     // Room 5 (Boss)
  }

  const handleGenerateQuests = useCallback(async (isAuto = false) => {
    // 1. Check Cost (if not auto)
    if (!isAuto) {
      if (gold < 500) {
        toast({ variant: "destructive", title: "Not enough gold!", description: "Refreshing quests requires 500 gold." });
        return;
      }
      setGold(prev => prev - 500);
      logToConsole(`You tossed 500g into the void to summon new challenges.`, 'SYSTEM');
    }

    setIsGeneratingQuests(true);
    // setQuests([]); // Don't clear locally, wait for firebase update
    // setCompletedQuestTitles([]); // This is local history for the dungeon logic (dungeon structure might need refactor for shared world but let's keep it simple)

    // Only the person clicking this needs to trigger the AI
    const message = isAuto ? 'The dungeon reveals new challenges...' : 'Summoning new quests from the ether...';
    logToConsole(message, 'SYSTEM');

    // Determine difficulty based on current dungeon index
    const currentRoomIndex = dungeons.findIndex(d => d.id === currentDungeon.id);
    const difficultyItem = getDifficultyForRoom(currentRoomIndex);

    // Ensure we ask for 4 quests
    const result = await createQuests({ count: 4, difficulty: difficultyItem });

    if (result.success && result.quests) {
      // Write to Firebase
      const { set } = await import('firebase/database');
      await set(ref(db, `dungeon-sessions/${roomId}/quests`), result.quests);
      await set(ref(db, `dungeon-sessions/${roomId}/questClaims`), null); // Reset claims

      logToConsole(`${result.quests.length} new quests have been posted to the Notice Board.`, 'SYSTEM');
    } else {
      // Only show toast if user manually requested it.
      // If auto-generation failed, it might be because someone else generated them or just a glitch, 
      // but showing a big red error on load is bad UX if quests might appear anyway.
      if (!isAuto) {
        toast({
          variant: "destructive",
          title: "Quest Generation Failed",
          description: result.error,
        });
      }
      logToConsole(result.error || 'Failed to generate quests.', 'ERROR');
      // If payment failed (error), maybe refund? But simple logic for now.
    }
    setIsGeneratingQuests(false);
  }, [toast, logToConsole, roomId, currentDungeon.id, gold]);

  const handleAcceptQuest = useCallback(async (quest: Quest) => {
    const user = auth.currentUser;
    if (!user) return;

    // Find quest index
    const questIndex = quests.findIndex(q => q.title === quest.title);
    if (questIndex === -1) return;

    // Atomic Claim
    const { set } = await import('firebase/database');
    const claimRef = ref(db, `dungeon-sessions/${roomId}/questClaims/${questIndex}`);

    // Check if claimed (Client side check first for speed)
    if (questClaims[questIndex]) {
      toast({ title: "Quest Taken", description: "Another adventurer has already claimed this quest!", variant: "destructive" });
      return;
    }

    // Write claim
    // Note: Use transaction for true safety, but set is okay for MVP
    await set(claimRef, { uid: user.uid, name: `wizard-${playerName}` });

    // Local updates
    const questLang = getLanguage(quest.language_alias);
    if (questLang) {
      setLanguage(questLang);
    }
    const questComment = getCommentedQuestBrief(quest.mission_briefing, quest.language_alias);
    const newCode = `${questComment}\n\n${quest.starter_code}`;
    setCode(newCode);
    setCurrentQuest(quest);

    // Sync Code to User's private persistence
    // We explicitly write to the new private path here to ensure starter code is saved
    const { ref: dbRef } = await import('firebase/database'); // re-import to be safe or use existing
    await set(ref(db, `dungeon-sessions/${roomId}/players/${user.uid}/code`), newCode);


    logToConsole(`Quest Accepted: "${quest.title}"`, 'QUEST');
    toast({
      title: "Quest Accepted!",
      description: "Your spellbook has been updated with the new challenge.",
    });
    setQuestBoardOpen(false);
  }, [logToConsole, toast, quests, roomId, questClaims, party, playerName]);


  // Auto-generate quests on room entry if empty
  useEffect(() => {
    // We wait a bit to ensure firebase sync has a chance to load existing quests
    const timer = setTimeout(() => {
      if (quests.length === 0 && !isGeneratingQuests) {
        // We can't easily distinguish between "loading from firebase" and "empty".
        // Ideally we need a "isLoaded" flag.
        // But for now, let's just assume if it's 0 after 2 seconds, we generate.
        // Or better: check if we are the first one ("host")? 
        // Simplest approach for this requests: Try to generate if empty.
        // But multiple clients might race.
        // Let's rely on the user manually refreshing if it's empty for now to be safe? 
        // NO, user explicitly asked for "automatically at the room start".
        // We'll trust the user wants this.
        handleGenerateQuests(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [roomId, currentDungeon.id]); // Re-run when room changes or ID changes

  useEffect(() => {
    logToConsole('Dungeon loaded successfully.', 'SYSTEM');
  }, []); // Run only once on mount

  useEffect(() => {
    const partyRef = ref(db, `dungeon-sessions/${roomId}/partyMembers`);
    const unsubscribeParty = onValue(partyRef, (snapshot) => {
      const partyData = snapshot.val();
      if (partyData) {
        setParty(partyData);
      }
    });

    const langRef = ref(db, `dungeon-sessions/${roomId}/language`);
    const unsubscribeLang = onValue(langRef, (snapshot) => {
      // With private coding, maybe language should also be private? 
      // User asked for "Code is Private". Usually language goes with code.
      // Let's keep language private (local state) OR synced per user. 
      // The current implementation syncs language globally. 
      // For "Independent Adventures", language should probably be independent too.
      // Refactoring `useCodeSync` will handle this.
    });

    return () => {
      unsubscribeParty();
      unsubscribeLang();
    };
  }, [roomId, language.alias]);

  const handleQuestSuccess = useCallback(async (quest: Quest) => {
    logToConsole(`Quest "${quest.title}" completed successfully! You've earned ${quest.gold_reward}g and ${quest.xp_reward} XP.`, 'QUEST');
    // Restore some HP/Mana on success
    setHp(prev => Math.min(100, prev + 10));
    setMana(prev => Math.min(100, prev + 20));
    setGold(prev => prev + quest.gold_reward);
    logToConsole('You feel invigorated! (+10 HP, +20 Mana)', 'SUCCESS');
    setCurrentQuest(null);

    // Sync to Firebase Shared Progression
    const { push, ref: dbRef } = await import('firebase/database');
    const user = auth.currentUser;
    await push(ref(db, `dungeon-sessions/${roomId}/completedQuests`), {
      title: quest.title,
      completedBy: user ? party[user.uid]?.name || 'Unknown' : 'Unknown',
      timestamp: Date.now()
    });

    // TODO: Add xp to player stats
  }, [logToConsole, roomId, party]);

  const handleCastSpell = async (currentCode: string) => {
    if (mana < 10) {
      logToConsole('Not enough mana to cast spell!', 'ERROR');
      return;
    }

    setIsCasting(true);
    setMana(prev => Math.max(0, prev - 10));
    logToConsole(`Casting ${language.name} spell... (-10 Mana)`, 'INFO');

    const result = await executeCode(language.name, language.version, currentCode, currentQuest);

    if ('error' in result) {
      logToConsole(`Execution failed: ${result.error}`, 'ERROR');
    } else {
      const { run, compile } = result;

      if (compile?.stderr) {
        logToConsole(`Compile Fizzle: ${compile.stderr}`, 'ERROR');
        logToConsole(`Output: ${compile.stdout}`, 'DEBUG');
      } else if (run.stderr) {
        logToConsole(`Runtime Fizzle: ${run.stderr}`, 'ERROR');
        if (run.stdout) {
          logToConsole(`Output: ${run.stdout}`, 'DEBUG');
        }
        if (currentQuest) {
          const newHp = hp - 20;
          setHp(newHp);
          logToConsole(`Quest "${currentQuest.title}" failed. The trial did not pass. You take 20 damage!`, 'QUEST');
          if (newHp <= 0) {
            logToConsole('You have fallen in battle! Your adventure ends here... for now.', 'ERROR');
            // TODO: Game over logic
          }
        }
      } else {
        logToConsole(run.stdout || 'Spell manifested without output.', 'SUCCESS');
        if (currentQuest && !run.stderr) {
          handleQuestSuccess(currentQuest);
        }
      }
    }
    setIsCasting(false);
  };

  // Dungeon progression
  useEffect(() => {
    // Determine which dungeon level we should be at based on completed quests.
    // Progression:
    // Room 1: 0-1 quests (Req 2)
    // Room 2: 2-3 quests (Req 2 -> Total 4)
    // Room 3: 4-6 quests (Req 3 -> Total 7)
    // Room 4: 7-9 quests (Req 3 -> Total 10)
    // Room 5: 10+ quests (Req 4 -> Total 14)

    let expectedDungeonIndex = 0;
    if (completedQuestsCount >= 10) expectedDungeonIndex = 4;
    else if (completedQuestsCount >= 7) expectedDungeonIndex = 3;
    else if (completedQuestsCount >= 4) expectedDungeonIndex = 2;
    else if (completedQuestsCount >= 2) expectedDungeonIndex = 1;
    else expectedDungeonIndex = 0;

    const currentDungeonIndex = dungeons.findIndex(d => d.id === currentDungeon.id);

    // Only update if we are not in the correct dungeon
    if (expectedDungeonIndex !== currentDungeonIndex) {
      // Cap at max dungeon level
      if (expectedDungeonIndex < dungeons.length) {
        const nextDungeon = dungeons[expectedDungeonIndex];
        setCurrentDungeon(nextDungeon);
        setIsTransitionOpen(true);
        logToConsole(`You have advanced to the next room: ${nextDungeon.name}!`, 'SYSTEM');
      }
    }
  }, [completedQuestsCount, currentDungeon.id]); // Removed handleGenerateQuests dependency

  const handleDebugCompleteQuest = () => {
    if (currentQuest) {
      logToConsole(`[DEBUG] Force completing quest: "${currentQuest.title}"`, 'DEBUG');
      handleQuestSuccess(currentQuest);
    } else {
      logToConsole('[DEBUG] No active quest to complete.', 'DEBUG');
    }
  };

  const isGameWon = completedQuestsCount >= 14;

  if (isGameWon) {
    return (
      <VictoryScroll
        playerName={party[auth.currentUser?.uid || '']?.name?.replace('wizard-', '') || playerName}
        onNewAdventure={handleExit}
      />
    );
  }

  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden font-retro text-xl leading-none select-none text-foreground relative transition-colors duration-500">
      <div className="absolute inset-0 bg-stone-pattern opacity-30 pointer-events-none z-0"></div>

      {!isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
          <div className="max-w-xl border-4 border-red-600 bg-stone-900/50 p-8 shadow-[0_0_50px_rgba(220,38,38,0.3)]">
            <h2 className="text-3xl md:text-5xl font-pixel text-red-500 mb-6 tracking-widest drop-shadow-md">REALM FOCUS REQUIRED</h2>
            <p className="text-stone-300 mb-8 font-retro text-xl leading-relaxed">
              The Dungeon's magic is too unstable for the windowed world.
              <br />
              You must fully immerse yourself to cast code.
            </p>
            <button
              onClick={requestFullscreen}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-pixel text-xl border-b-4 border-red-900 hover:border-red-800 hover:translate-y-1 transition-all shadow-lg animate-pulse"
            >
              ENTER FULLSCREEN
            </button>
          </div>
        </div>
      )}

      <Header
        party={party}
        hp={hp}
        mana={mana}
        gold={gold}
        roomId={roomId}
        currentRoomIndex={dungeons.findIndex(d => d.id === currentDungeon.id)}
        totalRooms={dungeons.length}
        onDebugCompleteQuest={handleDebugCompleteQuest}
        onExit={handleExit}
      />
      <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden relative z-10">
        <div className={`transition-all duration-300 ${isCombatLogExpanded ? "h-1/2 md:h-full md:w-1/2" : "flex-1"}`}>
          <Spellbook
            onCastSpell={handleCastSpell}
            onToggleQuestBoard={() => setQuestBoardOpen(true)}
            isCasting={isCasting}
            language={language}
            setLanguage={setLanguage}
            code={code}
            setCode={setCode}
            roomId={roomId}
            currentQuest={currentQuest}
            canCast={mana >= 10 && hp > 0}
          />
        </div>
        <Hud
          logs={logs}
          party={party}
          isCombatLogExpanded={isCombatLogExpanded}
          onToggleCombatLog={() => setIsCombatLogExpanded(!isCombatLogExpanded)}
          roomId={roomId}
        />
      </main>
      <RoomTransition
        isOpen={isTransitionOpen}
        dungeonName={currentDungeon.name}
        onComplete={() => setIsTransitionOpen(false)}
      />
      <QuestBoard
        isOpen={isQuestBoardOpen}
        onClose={() => setQuestBoardOpen(false)}
        onGenerateQuests={handleGenerateQuests}
        onAcceptQuest={handleAcceptQuest}
        quests={quests}
        isGenerating={isGeneratingQuests}
        currentQuest={currentQuest}
        completedQuestTitles={completedQuestTitles}
        questClaims={questClaims}
        currentRoomIndex={dungeons.findIndex(d => d.id === currentDungeon.id)}
      />

      {/* Waiting Room Overlay */}
      {Object.values(party).filter(p => p.online).length < 2 && (
        <div className="absolute inset-0 z-50 backdrop-blur-md bg-black/60 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
          <div className="bg-stone-900 border-4 border-purple-500 p-8 shadow-[0_0_50px_rgba(168,85,247,0.4)] max-w-lg relative">
            <button
              onClick={handleExit}
              className="absolute top-2 right-2 p-1 text-stone-500 hover:text-red-500 transition-colors rounded-sm hover:bg-white/5"
              title="Return to Home"
            >
              <X className="w-5 h-5" />
            </button>
            <blockquote className="text-2xl font-pixel text-purple-300 mb-6 animate-pulse">
              "It's dangerous to code alone..."
            </blockquote>

            {roomId.includes('public') ? (
              <>
                <p className="text-stone-300 mb-6 font-retro text-lg">
                  Waiting for competitor wizards to join the arena.
                </p>
                <p className="text-stone-500 text-sm font-mono">
                  The public dungeon will open when at least 2 players are present.
                </p>
              </>
            ) : (
              <>
                <p className="text-stone-300 mb-6 font-retro text-lg">
                  Waiting for another adventurer to join the party.
                </p>
                <p className="text-stone-500 text-sm font-mono">
                  The dungeon will open once at least 2 wizards are present.
                  <br />
                  (Share the Session ID: <span className="text-white font-bold select-all">{roomId.replace('room-', '')}</span>)
                </p>
              </>
            )}

            <div className="flex items-center justify-center gap-2 mb-4 mt-6">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
