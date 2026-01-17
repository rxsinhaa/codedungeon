"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Trophy, Crown, Medal, Users, Globe, ArrowLeft, Loader2, Swords, Flame, Target, Sparkles } from "lucide-react";
import { db, ref, get, child } from "@/lib/firebase";
import { onValue } from "firebase/database";

interface LeaderboardPageProps {
    initialRoomId?: string;
}

interface PlayerData {
    odID: string;
    username: string;
    questionsSolved: number;
    dungeonsCleared: number;
    highestStreak: number;
    currentRoom?: string | null;
}

interface PartyMember {
    name: string;
    online: boolean;
}

export default function LeaderboardPage({ initialRoomId }: LeaderboardPageProps) {
    const [globalPlayers, setGlobalPlayers] = useState<PlayerData[]>([]);
    const [partyPlayers, setPartyPlayers] = useState<PlayerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [partyLoading, setPartyLoading] = useState(false);
    const [roomId, setRoomId] = useState(initialRoomId || '');
    const [activeRoom, setActiveRoom] = useState(initialRoomId || '');
    const [roomInput, setRoomInput] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Fetch global leaderboard
    useEffect(() => {
        const fetchGlobalLeaderboard = async () => {
            setLoading(true);
            try {
                const dbRef = ref(db);
                const usersSnapshot = await get(child(dbRef, 'users'));

                if (usersSnapshot.exists()) {
                    const usersData = usersSnapshot.val();
                    const players: PlayerData[] = [];

                    for (const [odID, userData] of Object.entries(usersData)) {
                        const user = userData as { profile?: { username?: string }, progress?: { questionsSolved?: number, dungeonsCleared?: Record<string, boolean>, highestStreak?: number, currentDungeon?: string | null } };
                        const profile = user.profile || {};
                        const progress = user.progress || {};

                        players.push({
                            odID,
                            username: profile.username || `Wizard-${odID.substring(0, 4)}`,
                            questionsSolved: progress.questionsSolved || 0,
                            dungeonsCleared: progress.dungeonsCleared ? Object.keys(progress.dungeonsCleared).length : 0,
                            highestStreak: progress.highestStreak || 0,
                            currentRoom: progress.currentDungeon || null,
                        });
                    }

                    // Sort by questionsSolved (desc), then dungeonsCleared (desc), then highestStreak (desc)
                    players.sort((a, b) => {
                        if (b.questionsSolved !== a.questionsSolved) return b.questionsSolved - a.questionsSolved;
                        if (b.dungeonsCleared !== a.dungeonsCleared) return b.dungeonsCleared - a.dungeonsCleared;
                        return b.highestStreak - a.highestStreak;
                    });

                    setGlobalPlayers(players.slice(0, 50)); // Top 50
                }
            } catch (err) {
                console.error('Failed to fetch global leaderboard:', err);
                setError('Failed to load leaderboard');
            } finally {
                setLoading(false);
            }
        };

        fetchGlobalLeaderboard();
    }, []);

    // Fetch party leaderboard when room changes
    useEffect(() => {
        if (!activeRoom) {
            setPartyPlayers([]);
            return;
        }

        setPartyLoading(true);
        const partyRef = ref(db, `dungeon-sessions/${activeRoom}/partyMembers`);

        const unsubscribe = onValue(partyRef, async (snapshot) => {
            if (snapshot.exists()) {
                const partyData = snapshot.val() as Record<string, PartyMember>;
                const players: PlayerData[] = [];

                // Fetch progress for each party member
                for (const [odID, member] of Object.entries(partyData)) {
                    try {
                        const progressSnapshot = await get(child(ref(db), `users/${odID}/progress`));
                        const progress = progressSnapshot.exists() ? progressSnapshot.val() : {};

                        players.push({
                            odID,
                            username: member.name || `Wizard-${odID.substring(0, 4)}`,
                            questionsSolved: progress.questionsSolved || 0,
                            dungeonsCleared: progress.dungeonsCleared ? Object.keys(progress.dungeonsCleared).length : 0,
                            highestStreak: progress.highestStreak || 0,
                            currentRoom: activeRoom,
                        });
                    } catch (err) {
                        console.error(`Failed to fetch progress for ${odID}:`, err);
                    }
                }

                // Sort by questionsSolved
                players.sort((a, b) => {
                    if (b.questionsSolved !== a.questionsSolved) return b.questionsSolved - a.questionsSolved;
                    if (b.dungeonsCleared !== a.dungeonsCleared) return b.dungeonsCleared - a.dungeonsCleared;
                    return b.highestStreak - a.highestStreak;
                });

                setPartyPlayers(players);
            } else {
                setPartyPlayers([]);
            }
            setPartyLoading(false);
        }, (err) => {
            console.error('Failed to fetch party leaderboard:', err);
            setPartyLoading(false);
        });

        return () => unsubscribe();
    }, [activeRoom]);

    const handleJoinRoom = () => {
        if (roomInput.trim()) {
            const formattedRoom = roomInput.startsWith('room-') ? roomInput : `room-${roomInput}`;
            setActiveRoom(formattedRoom);
            setRoomId(formattedRoom);
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return (
                    <div className="relative">
                        <Crown className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]" />
                        <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
                    </div>
                );
            case 2:
                return <Medal className="w-6 h-6 text-stone-300 drop-shadow-[0_0_6px_rgba(200,200,200,0.4)]" />;
            case 3:
                return <Medal className="w-6 h-6 text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />;
            default:
                return (
                    <div className="w-8 h-8 flex items-center justify-center bg-stone-800 rounded-full border border-stone-600">
                        <span className="text-stone-400 font-mono text-sm font-bold">{rank}</span>
                    </div>
                );
        }
    };

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-900/30 via-yellow-800/20 to-transparent border-l-4 border-yellow-500';
            case 2:
                return 'bg-gradient-to-r from-stone-700/30 via-stone-800/20 to-transparent border-l-4 border-stone-400';
            case 3:
                return 'bg-gradient-to-r from-amber-900/30 via-amber-800/20 to-transparent border-l-4 border-amber-500';
            default:
                return 'bg-stone-900/40 border-l-4 border-stone-700/50 hover:border-stone-600';
        }
    };

    const PlayerRow = ({ player, rank, showRoomIndicator = false }: { player: PlayerData, rank: number, showRoomIndicator?: boolean }) => (
        <div className={`flex items-center gap-4 p-4 rounded-r-lg ${getRankStyle(rank)} transition-all hover:bg-stone-800/50 group`}>
            <div className="flex-shrink-0 w-12 flex justify-center">
                {getRankIcon(rank)}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center border-2 border-stone-600 group-hover:border-stone-500 transition-colors">
                        <span className="font-pixel text-sm text-stone-300">
                            {player.username.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className={`font-pixel text-sm truncate ${rank <= 3 ? 'text-white' : 'text-stone-300'}`}>
                            {player.username}
                        </span>
                        {showRoomIndicator && player.currentRoom && (
                            <span className="text-[10px] font-mono text-purple-400 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                In realm: {player.currentRoom.replace('room-', '')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-8">
                <div className="flex flex-col items-center min-w-[50px]">
                    <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-green-500" />
                        <span className="font-mono text-lg font-bold text-green-400">{player.questionsSolved}</span>
                    </div>
                    <span className="text-[9px] text-stone-500 uppercase tracking-wide">Solved</span>
                </div>

                <div className="flex flex-col items-center min-w-[50px]">
                    <div className="flex items-center gap-1">
                        <Swords className="w-4 h-4 text-blue-500" />
                        <span className="font-mono text-lg font-bold text-blue-400">{player.dungeonsCleared}</span>
                    </div>
                    <span className="text-[9px] text-stone-500 uppercase tracking-wide">Cleared</span>
                </div>

                <div className="flex flex-col items-center min-w-[50px]">
                    <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="font-mono text-lg font-bold text-orange-400">{player.highestStreak}</span>
                    </div>
                    <span className="text-[9px] text-stone-500 uppercase tracking-wide">Streak</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-stone-950 flex flex-col font-retro text-white relative overflow-hidden">
            {/* Background effects matching landing page */}
            <div className="absolute inset-0 bg-stone-pattern opacity-20 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-10 w-full p-4 md:p-6 flex justify-between items-center border-b border-stone-800/50">
                <Link href="/">
                    <Button variant="ghost" className="font-pixel text-stone-400 hover:text-white hover:bg-stone-800/50 gap-2 border border-stone-700">
                        <ArrowLeft className="w-4 h-4" />
                        HOME
                    </Button>
                </Link>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Trophy className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-pixel text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-600">
                        LEADERBOARD
                    </h1>
                </div>

                <div className="w-24"></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-8 z-10 max-w-5xl mx-auto w-full">
                <Tabs defaultValue="global" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-stone-900/80 border-2 border-stone-700 mb-8 p-1 rounded-lg h-14">
                        <TabsTrigger
                            value="global"
                            className="font-pixel text-lg rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-900/80 data-[state=active]:to-purple-800/50 text-stone-400 data-[state=active]:text-white gap-2 h-full transition-all"
                        >
                            <Globe className="w-5 h-5" />
                            GLOBAL
                        </TabsTrigger>
                        <TabsTrigger
                            value="party"
                            className="font-pixel text-lg rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-900/80 data-[state=active]:to-blue-800/50 text-stone-400 data-[state=active]:text-white gap-2 h-full transition-all"
                        >
                            <Users className="w-5 h-5" />
                            PARTY
                        </TabsTrigger>
                    </TabsList>

                    {/* Global Leaderboard */}
                    <TabsContent value="global" className="mt-0">
                        <div className="bg-stone-900/60 border-2 border-stone-700 rounded-xl overflow-hidden">
                            <div className="p-4 md:p-6 border-b border-stone-700/50 bg-gradient-to-r from-purple-900/30 to-transparent">
                                <h2 className="font-pixel text-xl text-purple-400 flex items-center gap-3">
                                    <Globe className="w-6 h-6" />
                                    TOP WIZARDS OF THE REALM
                                </h2>
                                <p className="text-stone-500 text-sm mt-1 font-retro">The greatest code sorcerers across all dimensions</p>
                            </div>
                            <div className="p-4 md:p-6">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
                                        <p className="text-stone-500 font-retro">Summoning rankings...</p>
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-16 text-red-400">
                                        <p className="font-pixel text-xl mb-2">PORTAL COLLAPSED</p>
                                        <p className="text-stone-500 font-retro">{error}</p>
                                    </div>
                                ) : globalPlayers.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Trophy className="w-16 h-16 mx-auto mb-4 text-stone-700" />
                                        <p className="font-pixel text-xl text-stone-500 mb-2">NO WIZARDS FOUND</p>
                                        <p className="text-stone-600 font-retro">Be the first to claim glory!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {globalPlayers.map((player, index) => (
                                            <PlayerRow key={player.odID} player={player} rank={index + 1} showRoomIndicator={true} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Party Leaderboard */}
                    <TabsContent value="party" className="mt-0">
                        <div className="bg-stone-900/60 border-2 border-stone-700 rounded-xl overflow-hidden">
                            <div className="p-4 md:p-6 border-b border-stone-700/50 bg-gradient-to-r from-blue-900/30 to-transparent">
                                <h2 className="font-pixel text-xl text-blue-400 flex items-center gap-3">
                                    <Users className="w-6 h-6" />
                                    PARTY RANKINGS
                                    {activeRoom && (
                                        <span className="text-sm font-mono text-stone-400 bg-stone-800 px-3 py-1 rounded-full">
                                            {activeRoom.replace('room-', '')}
                                        </span>
                                    )}
                                </h2>
                                <p className="text-stone-500 text-sm mt-1 font-retro">Compare your prowess with fellow adventurers</p>
                            </div>
                            <div className="p-4 md:p-6">
                                {!activeRoom ? (
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 mx-auto mb-4 text-stone-700" />
                                        <p className="font-pixel text-lg text-stone-400 mb-6">ENTER A REALM CODE</p>
                                        <div className="flex gap-3 max-w-md mx-auto">
                                            <Input
                                                value={roomInput}
                                                onChange={(e) => setRoomInput(e.target.value)}
                                                placeholder="e.g., 1234 or room-1234"
                                                className="bg-stone-950 border-2 border-stone-700 text-white font-mono text-center h-12 focus:border-blue-500"
                                                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                                            />
                                            <Button
                                                onClick={handleJoinRoom}
                                                className="bg-blue-600 hover:bg-blue-500 font-pixel px-6 h-12 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
                                            >
                                                VIEW
                                            </Button>
                                        </div>
                                    </div>
                                ) : partyLoading ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                                        <p className="text-stone-500 font-retro">Opening portal...</p>
                                    </div>
                                ) : partyPlayers.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Users className="w-16 h-16 mx-auto mb-4 text-stone-700" />
                                        <p className="font-pixel text-xl text-stone-500 mb-2">REALM IS EMPTY</p>
                                        <p className="text-stone-600 font-retro mb-6">No adventurers found in this dimension</p>
                                        <Button
                                            onClick={() => { setActiveRoom(''); setRoomId(''); }}
                                            variant="outline"
                                            className="font-pixel text-stone-400 border-stone-600 hover:bg-stone-800"
                                        >
                                            TRY ANOTHER REALM
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {partyPlayers.map((player, index) => (
                                            <PlayerRow key={player.odID} player={player} rank={index + 1} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Footer */}
            <div className="relative z-10 text-center py-6 border-t border-stone-800/50">
                <p className="text-stone-600 text-xs font-mono">
                    Rankings update in real-time • Top 50 wizards displayed
                </p>
            </div>
        </div>
    );
}
