"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Crown, Medal, Users, Globe, ArrowLeft, Loader2, Swords, Flame, Target } from "lucide-react";
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
                return <Crown className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />;
            case 2:
                return <Medal className="w-6 h-6 text-stone-300" />;
            case 3:
                return <Medal className="w-6 h-6 text-amber-600" />;
            default:
                return <span className="w-6 h-6 flex items-center justify-center text-stone-500 font-mono text-sm">{rank}</span>;
        }
    };

    const getRankBorder = (rank: number) => {
        switch (rank) {
            case 1:
                return 'border-yellow-500/50 bg-yellow-900/10';
            case 2:
                return 'border-stone-400/50 bg-stone-800/20';
            case 3:
                return 'border-amber-600/50 bg-amber-900/10';
            default:
                return 'border-stone-700/50';
        }
    };

    const PlayerRow = ({ player, rank, showRoomIndicator = false }: { player: PlayerData, rank: number, showRoomIndicator?: boolean }) => (
        <div className={`flex items-center gap-4 p-4 rounded-lg border ${getRankBorder(rank)} transition-all hover:bg-stone-800/30`}>
            <div className="flex-shrink-0 w-10 flex justify-center">
                {getRankIcon(rank)}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={`font-pixel text-sm truncate ${rank <= 3 ? 'text-white' : 'text-stone-300'}`}>
                        {player.username}
                    </span>
                    {showRoomIndicator && player.currentRoom && (
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-900/50 text-purple-300 rounded-full border border-purple-700/50 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {player.currentRoom.replace('room-', '')}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-6 text-right">
                <div className="flex flex-col items-center min-w-[60px]">
                    <div className="flex items-center gap-1 text-green-400">
                        <Target className="w-4 h-4" />
                        <span className="font-mono text-sm">{player.questionsSolved}</span>
                    </div>
                    <span className="text-[10px] text-stone-500 uppercase">Solved</span>
                </div>

                <div className="flex flex-col items-center min-w-[60px]">
                    <div className="flex items-center gap-1 text-blue-400">
                        <Swords className="w-4 h-4" />
                        <span className="font-mono text-sm">{player.dungeonsCleared}</span>
                    </div>
                    <span className="text-[10px] text-stone-500 uppercase">Cleared</span>
                </div>

                <div className="flex flex-col items-center min-w-[60px]">
                    <div className="flex items-center gap-1 text-orange-400">
                        <Flame className="w-4 h-4" />
                        <span className="font-mono text-sm">{player.highestStreak}</span>
                    </div>
                    <span className="text-[10px] text-stone-500 uppercase">Streak</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black flex flex-col font-retro text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none"></div>

            {/* Header */}
            <div className="w-full p-6 flex justify-between items-center z-10 border-b border-stone-800">
                <Link href="/">
                    <Button variant="ghost" className="font-pixel text-stone-400 hover:text-white hover:bg-stone-800 gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        BACK
                    </Button>
                </Link>

                <div className="text-2xl font-pixel text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    LEADERBOARD
                </div>

                <div className="w-24"></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 z-10 max-w-4xl mx-auto w-full">
                <Tabs defaultValue="global" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-stone-900 border border-stone-700 mb-6">
                        <TabsTrigger value="global" className="font-pixel data-[state=active]:bg-purple-900/50 text-stone-400 data-[state=active]:text-white gap-2">
                            <Globe className="w-4 h-4" />
                            GLOBAL
                        </TabsTrigger>
                        <TabsTrigger value="party" className="font-pixel data-[state=active]:bg-blue-900/50 text-stone-400 data-[state=active]:text-white gap-2">
                            <Users className="w-4 h-4" />
                            PARTY
                        </TabsTrigger>
                    </TabsList>

                    {/* Global Leaderboard */}
                    <TabsContent value="global">
                        <Card className="bg-stone-900/50 border-2 border-stone-700">
                            <CardHeader className="border-b border-stone-700">
                                <CardTitle className="font-pixel text-purple-400 text-lg flex items-center gap-2">
                                    <Globe className="w-5 h-5" />
                                    TOP WIZARDS
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-12 text-red-400">{error}</div>
                                ) : globalPlayers.length === 0 ? (
                                    <div className="text-center py-12 text-stone-500">
                                        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                        <p>No adventurers yet. Be the first!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {globalPlayers.map((player, index) => (
                                            <PlayerRow key={player.odID} player={player} rank={index + 1} showRoomIndicator={true} />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Party Leaderboard */}
                    <TabsContent value="party">
                        <Card className="bg-stone-900/50 border-2 border-stone-700">
                            <CardHeader className="border-b border-stone-700">
                                <CardTitle className="font-pixel text-blue-400 text-lg flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    PARTY RANKINGS
                                    {activeRoom && (
                                        <span className="text-xs font-mono text-stone-400 ml-2">
                                            [{activeRoom.replace('room-', '')}]
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                {!activeRoom ? (
                                    <div className="space-y-4 py-4">
                                        <div className="text-center text-stone-400 mb-4">
                                            Enter a room ID to view party rankings
                                        </div>
                                        <div className="flex gap-2 max-w-sm mx-auto">
                                            <Input
                                                value={roomInput}
                                                onChange={(e) => setRoomInput(e.target.value)}
                                                placeholder="Room ID (e.g., 1234)"
                                                className="bg-black border-stone-700 text-white font-mono text-center"
                                                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                                            />
                                            <Button
                                                onClick={handleJoinRoom}
                                                className="bg-blue-600 hover:bg-blue-700 font-pixel"
                                            >
                                                VIEW
                                            </Button>
                                        </div>
                                    </div>
                                ) : partyLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    </div>
                                ) : partyPlayers.length === 0 ? (
                                    <div className="text-center py-12 text-stone-500">
                                        <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                        <p>No adventurers in this party.</p>
                                        <Button
                                            onClick={() => { setActiveRoom(''); setRoomId(''); }}
                                            variant="ghost"
                                            className="mt-4 text-stone-400 hover:text-white"
                                        >
                                            Try another room
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {partyPlayers.map((player, index) => (
                                            <PlayerRow key={player.odID} player={player} rank={index + 1} />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Footer */}
            <div className="text-center py-4 text-xs text-stone-600 font-mono">
                Rankings update in real-time • Top 50 wizards displayed
            </div>
        </div>
    );
}
