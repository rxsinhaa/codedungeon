"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Globe, Lock, BookOpen, Zap, Cpu, Gem, Loader2, LogOut, Swords, Key, User, Trophy } from "lucide-react";
import VillagerCrying from './Villager_Crying.webp';
import Image from 'next/image';
import { useAuth } from "@/context/AuthContext";
import { signUpWithUsername, loginWithUsername } from "@/lib/firebase";
import { joinPublicQueue, leavePublicQueue, subscribeToQueue, subscribeToMatchStatus, tryMatchmaking, MAX_PARTY_SIZE } from '@/lib/matchmaking';
import { AnimatePresence, motion } from "framer-motion";

interface LandingPageProps {
    onJoin: (name: string, roomId?: string) => void;
    initialRoomId?: string;
    savedName?: string;
}

export default function LandingPage({ onJoin, initialRoomId }: LandingPageProps) {
    const { user, loading: authLoading, signOut } = useAuth();

    // Form State
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Dialog State
    const [isAuthDialogOpen, setAuthDialogOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [isRoomSelectionOpen, setRoomSelectionOpen] = useState(false);
    const [isJoinDialogOpen, setJoinDialogOpen] = useState(false);
    const [roomIdInput, setRoomIdInput] = useState("");
    const [joinError, setJoinError] = useState("");
    const [isSessionNotFoundOpen, setSessionNotFoundOpen] = useState(false);
    const [invalidRoomId, setInvalidRoomId] = useState("");
    const [isHandbookOpen, setIsHandbookOpen] = useState(false);

    // Matchmaking State
    const [isSearching, setIsSearching] = useState(false);
    const [queueTime, setQueueTime] = useState(0);
    const [playersFound, setPlayersFound] = useState(0);
    const [matchStatus, setMatchStatus] = useState("Searching for wizards...");
    const [countdown, setCountdown] = useState<number | null>(null); // 15s countdown when 2+ found

    // Matchmaking Logic
    useEffect(() => {
        let timerInterval: NodeJS.Timeout;
        let queueUnsub: (() => void) | undefined;
        let matchUnsub: (() => void) | undefined;

        if (isSearching && user) {
            // 1. Join Queue
            joinPublicQueue(user).catch(console.error);

            // 2. Start Timer
            setQueueTime(0);
            setCountdown(null);

            timerInterval = setInterval(() => {
                setQueueTime(prev => prev + 1);

                // Countdown logic
                setCountdown(prevCountdown => {
                    if (prevCountdown !== null && prevCountdown > 0) {
                        const newCountdown = prevCountdown - 1;
                        if (newCountdown === 0) {
                            // Countdown finished - trigger match!
                            tryMatchmaking(true);
                        }
                        return newCountdown;
                    }
                    return prevCountdown;
                });

                // Fallback: 60s total timeout (solo with bots)
                setQueueTime(prev => {
                    if (prev >= 60 && countdown === null) {
                        tryMatchmaking(true);
                    }
                    return prev;
                });
            }, 1000);

            // 3. Listen to Queue Count
            queueUnsub = subscribeToQueue((count: number, entries: any[]) => {
                const waitingCount = entries.filter(e => !e.roomId).length;
                setPlayersFound(waitingCount);

                // Start countdown when 2+ players found
                if (waitingCount >= 2) {
                    setCountdown(prev => prev === null ? 15 : prev); // Start 15s countdown once
                    setMatchStatus("Match Found!");
                }

                // Instant match if 4 players
                if (waitingCount >= MAX_PARTY_SIZE) {
                    tryMatchmaking(false);
                }
            });

            // 4. Listen for MY Match
            matchUnsub = subscribeToMatchStatus(user.uid, (roomId: string) => {
                setMatchStatus("Entering Portal...");
                setTimeout(() => {
                    onJoin(user.displayName || 'Wizard', roomId);
                }, 500);
            });

        } else {
            setQueueTime(0);
            setPlayersFound(0);
            setCountdown(null);
        }

        return () => {
            if (timerInterval) clearInterval(timerInterval);
            if (queueUnsub) queueUnsub();
            if (matchUnsub) matchUnsub();
            if (isSearching && user) {
                leavePublicQueue(user.uid).catch(console.error);
            }
        };
    }, [isSearching, user, onJoin]);

    const handleQuickPlay = () => {
        if (!user) {
            setAuthDialogOpen(true);
            return;
        }
        setIsSearching(true);
    };

    const handleCancelSearch = () => {
        setIsSearching(false);
    };

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleAuth = async () => {
        if (!username.trim() || !password.trim()) {
            setError("Please fill in all fields");
            return;
        }
        setIsLoading(true);
        setError("");

        // Admin Portal Intercept
        if (username.toLowerCase() === 'admin') {
            try {
                const res = await fetch('/api/admin-auth', {
                    method: 'POST',
                    body: JSON.stringify({ loginId: username.toLowerCase(), password }),
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await res.json();

                if (data.success) {
                    sessionStorage.setItem('adminPortalUnlocked', 'true');
                    window.location.href = '/admin';
                } else {
                    setError("Invalid admin credentials");
                    setIsLoading(false);
                }
            } catch (e) {
                setError("Error authenticating admin.");
                setIsLoading(false);
            }
            return;
        }

        try {
            if (authMode === 'signup') {
                await signUpWithUsername(username, password);
            } else {
                await loginWithUsername(username, password);
            }
            setAuthDialogOpen(false);
            if (initialRoomId) {
                onJoin(username, initialRoomId);
            }
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/operation-not-allowed') {
                setError("Config Error: Enable Email/Password in Firebase Console");
            } else if (err.code === 'auth/email-already-in-use') {
                setError("Username already taken");
            } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError("Invalid username or password");
            } else if (err.code === 'auth/weak-password') {
                setError("Password should be at least 6 characters");
            } else {
                setError("Authentication failed. Try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        setUsername("");
        setPassword("");
        setIsSearching(false);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-stone-pattern opacity-20 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>

            {/* Top Left: Handbook Button */}
            <Button
                onClick={() => setIsHandbookOpen(true)}
                variant="ghost"
                className="absolute top-4 left-4 z-20 font-pixel text-blue-400 hover:text-blue-300 hover:bg-stone-800/50 border border-stone-700 gap-2 h-12"
            >
                <BookOpen className="w-4 h-4" />
                HANDBOOK
            </Button>

            {/* Top Right Controls */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
                {/* Leaderboard Button */}
                <Link href="/leaderboard">
                    <Button variant="ghost" className="font-pixel text-yellow-500 hover:text-yellow-400 hover:bg-stone-800/50 border border-stone-700 gap-2 h-12">
                        <Trophy className="w-4 h-4" />
                        LEADERBOARD
                    </Button>
                </Link>

                {/* User Token */}
                {user && (
                    <div className="bg-stone-900/80 border-2 border-stone-600 rounded-lg p-2 pr-4 flex items-center gap-3 shadow-lg h-12">
                        <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center border-2 border-green-500 shrink-0">
                            <span className="font-pixel text-lg text-green-200 leading-none mt-1">{user.displayName ? user.displayName[0].toUpperCase() : 'W'}</span>
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="text-stone-400 text-[10px] uppercase font-bold leading-tight">Logged in as</div>
                            <div className="text-white font-pixel text-sm tracking-wide leading-tight">{user.displayName}</div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleLogout} className="w-6 h-6 ml-1 hover:bg-red-900/30 hover:text-red-400 shrink-0">
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            <Dialog open={isAuthDialogOpen} onOpenChange={setAuthDialogOpen}>
                <DialogContent className="bg-stone-900 border-4 border-stone-600 sm:max-w-md p-0 overflow-hidden text-white">
                    <Tabs value={authMode} onValueChange={(v: string) => setAuthMode(v as 'login' | 'signup')} className="w-full">
                        <TabsList className="w-full grid grid-cols-2 rounded-none bg-stone-800 p-0 h-14">
                            <TabsTrigger
                                value="login"
                                className="font-pixel text-lg rounded-none data-[state=active]:bg-stone-900 data-[state=active]:text-yellow-500 transition-all h-full"
                            >
                                LOGIN
                            </TabsTrigger>
                            <TabsTrigger
                                value="signup"
                                className="font-pixel text-lg rounded-none data-[state=active]:bg-stone-900 data-[state=active]:text-green-500 transition-all h-full"
                            >
                                SIGN UP
                            </TabsTrigger>
                        </TabsList>
                        <div className="p-6 font-retro">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={authMode}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h2 className="text-2xl text-center text-white mb-6">
                                        {authMode === 'login' ? 'Resume Your Quest' : 'Join the Guild'}
                                    </h2>

                                    {error && (
                                        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 text-sm rounded flex items-center gap-2">
                                            <span className="text-xl">!</span> {error}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Wizard Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-stone-500" />
                                                <Input
                                                    id="username"
                                                    placeholder="Merlin"
                                                    className="pl-10 bg-stone-950 border-stone-700 font-mono text-white"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Secret Scroll (Password)</Label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-3 h-4 w-4 text-stone-500" />
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="pl-10 bg-stone-950 border-stone-700 font-mono text-white"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleAuth}
                                            className={`w-full h-12 mt-4 font-pixel text-lg
                                                ${authMode === 'login'
                                                    ? 'bg-yellow-600 hover:bg-yellow-700 text-black border-b-4 border-yellow-800'
                                                    : 'bg-green-600 hover:bg-green-700 text-white border-b-4 border-green-800'
                                                }`}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Casting...' : (authMode === 'login' ? 'ENTER REALM' : 'BEGIN ADVENTURE')}
                                        </Button>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </Tabs>
                </DialogContent>
            </Dialog>


            <div className={`relative z-10 text-center space-y-8 p-4 max-w-4xl w-full transition-opacity duration-500 ${isSearching ? 'opacity-0 pointer-events-none hidden' : 'opacity-100'}`}>

                {/* Logo - Unchanged */}
                <div className="mb-8">
                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-600 drop-shadow-[0_4px_0_rgba(0,0,0,1)] font-pixel mb-4 tracking-wider">
                        CODE<br />DUNGEON
                    </h1>
                    <p className="text-stone-400 text-xl md:text-2xl font-retro tracking-widest uppercase">
                        Master the Code. Conquer the Realm.
                    </p>
                </div>

                {/* Action Buttons */}
                {!user && (
                    <Button
                        onClick={() => setAuthDialogOpen(true)}
                        className="w-full max-w-md mx-auto h-20 text-3xl font-pixel bg-green-600 hover:bg-green-700 text-white border-b-8 border-green-800 active:border-b-0 active:translate-y-2 transition-all shadow-[0_10px_20px_rgba(22,163,74,0.3)]"
                    >
                        ENTER DUNGEON
                    </Button>
                )}

                {user && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mx-auto">

                        {/* BOX 1: Play Randomly */}
                        <div className="bg-stone-900/60 border-2 border-stone-700 rounded-xl p-6 flex flex-col items-center text-center">
                            <h3 className="text-xl font-pixel text-yellow-500 mb-4">PLAY RANDOMLY</h3>
                            <Button
                                onClick={handleQuickPlay}
                                className="group relative w-full h-24 overflow-hidden bg-stone-800 hover:bg-stone-700 border-4 border-yellow-600/50 hover:border-yellow-500 transition-all hover:scale-105 active:scale-95 rounded-lg"
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                                    <Swords className="w-8 h-8 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
                                    <span className="text-lg text-yellow-500 font-pixel group-hover:text-yellow-400">QUICK PLAY</span>
                                    <span className="text-xs text-stone-400 font-retro">Match with random wizards</span>
                                </div>
                            </Button>
                        </div>

                        {/* BOX 2: Private Realm */}
                        <div className="bg-stone-900/60 border-2 border-stone-700 rounded-xl p-6 flex flex-col items-center text-center">
                            <h3 className="text-xl font-pixel text-purple-400 mb-4">PLAY WITH FRIENDS</h3>
                            <div className="flex flex-col gap-3 w-full">
                                {/* Create Realm */}
                                <Button
                                    onClick={() => onJoin(user.displayName || 'GrandWizard')}
                                    className="w-full h-14 bg-purple-900/50 hover:bg-purple-900/70 border-2 border-purple-700 hover:border-purple-500 text-purple-200 transition-all font-pixel text-base rounded-lg"
                                >
                                    CREATE REALM
                                </Button>

                                {/* Join Room */}
                                <Dialog open={isJoinDialogOpen} onOpenChange={(open) => { setJoinDialogOpen(open); setJoinError(""); }}>
                                    <DialogTrigger asChild>
                                        <Button className="w-full h-14 bg-blue-900/50 hover:bg-blue-800/60 border-2 border-blue-700 hover:border-blue-500 text-blue-200 transition-all font-pixel text-base rounded-lg">
                                            <Users className="w-5 h-5 mr-2" />
                                            JOIN REALM
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-stone-900 border-4 border-blue-500 text-white">
                                        <DialogHeader>
                                            <DialogTitle className="font-pixel text-blue-400 text-2xl text-center">Planar Coordinate</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex flex-col gap-4 py-4">
                                            <Input
                                                placeholder="e.g. 1234"
                                                maxLength={4}
                                                className="bg-black border-blue-900 text-center font-mono text-xl h-14 text-white placeholder-stone-600"
                                                value={roomIdInput}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, ''); // Allow only numbers
                                                    setRoomIdInput(val);
                                                    setJoinError("");
                                                }}
                                            />
                                            {joinError && <div className="text-red-500 text-center font-pixel text-sm">{joinError}</div>}
                                            <Button
                                                onClick={async () => {
                                                    if (!roomIdInput || roomIdInput.length !== 4 || isNaN(Number(roomIdInput))) {
                                                        setJoinError("Room ID must be a 4-digit number.");
                                                        return;
                                                    }
                                                    const { get, db, ref, child } = await import('@/lib/firebase');
                                                    const roomSnapshot = await get(child(ref(db), `dungeon-sessions/${roomIdInput}`));
                                                    if (!roomSnapshot.exists()) {
                                                        setInvalidRoomId(roomIdInput);
                                                        setJoinDialogOpen(false);
                                                        setSessionNotFoundOpen(true);
                                                        return;
                                                    }
                                                    onJoin(user.displayName || 'Wizard', roomIdInput);
                                                }}
                                                className="h-14 bg-blue-600 hover:bg-blue-500 font-pixel text-xl"
                                            >
                                                WARP
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Session Not Found Dialog */}
            <Dialog open={isSessionNotFoundOpen} onOpenChange={setSessionNotFoundOpen}>
                <DialogContent className="bg-stone-900 border-4 border-red-500 p-0 text-white font-pixel w-full max-w-[400px] overflow-hidden rounded-xl">
                    <div className="flex flex-col items-center pt-8 pb-6 px-6">
                        <div className="w-32 h-32 mb-6">
                            <Image src={VillagerCrying} alt="Crying Villager" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-3xl text-red-500 text-center uppercase leading-tight mb-4 drop-shadow-md">
                            SESSION NOT<br />FOUND
                        </h2>
                        <p className="text-stone-400 font-retro text-center mb-2 leading-relaxed tracking-wide text-sm">
                            The realm ID <span className="text-yellow-500 font-bold">{invalidRoomId}</span> does not exist in the archives.
                        </p>
                        <p className="text-stone-400 font-retro text-center mb-8 leading-relaxed tracking-wide text-sm">
                            Did the goblins steal a digit?
                        </p>

                        <Button
                            onClick={() => {
                                setSessionNotFoundOpen(false);
                                onJoin(user?.displayName || 'Wizard');
                            }}
                            className="w-full h-14 bg-[#9b51e0] hover:bg-[#8b41d0] border-2 border-[#b873ff] text-white font-pixel text-lg rounded-lg shadow-[0_0_15px_rgba(155,81,224,0.5)] transition-all uppercase tracking-wider mb-4"
                        >
                            CREATE NEW REALM
                        </Button>
                        <button
                            onClick={() => {
                                setSessionNotFoundOpen(false);
                                setJoinDialogOpen(true);
                            }}
                            className="text-stone-400 font-retro text-sm hover:text-white transition-colors uppercase tracking-widest"
                        >
                            Try Again
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Handbook Dialog */}
            <Dialog open={isHandbookOpen} onOpenChange={setIsHandbookOpen}>
                <DialogContent className="bg-stone-900 border-4 border-blue-500 text-white max-w-2xl max-h-[80vh] overflow-y-auto font-retro p-0">
                    <DialogHeader className="bg-stone-950 p-6 border-b-4 border-stone-800 sticky top-0 z-10">
                        <DialogTitle className="font-pixel text-blue-400 text-2xl flex items-center gap-3">
                            <BookOpen className="w-6 h-6" />
                            ADVENTURER'S HANDBOOK
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-8 space-y-6 text-stone-300 leading-relaxed tracking-wide">
                        <section>
                            <h3 className="text-xl font-pixel text-yellow-500 mb-3 border-b-2 border-stone-700 pb-1">1. The Realm</h3>
                            <p>Welcome to CodeDungeon, an arena where your programming logic dictates your survival. You will traverse through interconnected rooms, facing algorithmic trials and arcane bugs.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-pixel text-green-500 mb-3 border-b-2 border-stone-700 pb-1">2. Magic & Resources</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>HP (Health):</strong> Drops if you fail a trial or encounter a critical trap.</li>
                                <li><strong>MP (Mana):</strong> Required to summon your <span className="text-blue-400 italic">Dungeon Guide</span> ai-companion when you are stuck. MP regenerates slowly but can be depleted rapidly by heavy spell-casting (debugging).</li>
                                <li><strong>Gold:</strong> Earned by swiftly conquering rooms. Spent to request deep analysis from the <span className="text-gold italic">Dungeon Guide</span>.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-pixel text-purple-400 mb-3 border-b-2 border-stone-700 pb-1">3. Party Dynamics</h3>
                            <p>You may venture alone or form a party of up to 4 wizards. In a party, coordinates (Code) are shared, but only the sharpest mind will secure the completion honors for the room.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-pixel text-red-500 mb-3 border-b-2 border-stone-700 pb-1">4. The Dungeon Guide</h3>
                            <p>Should the logic fail you, summon the Guide. Choose your requests wisely:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li><strong>Where's the error?:</strong> A quick pointer to your syntax faults.</li>
                                <li><strong>What's the logic?:</strong> A gentle nudge in the right algorithmic direction.</li>
                                <li><strong>Explain everything:</strong> A costly (Gold) but comprehensive breakdown of the trial.</li>
                            </ul>
                        </section>
                    </div>
                </DialogContent>
            </Dialog>

            {isSearching && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="max-w-md w-full p-8 text-center space-y-8">
                        <div className="relative">
                            <div className={`w-32 h-32 mx-auto bg-stone-900 border-4 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.2)] ${countdown !== null ? 'border-green-500 animate-none' : 'border-yellow-600 animate-pulse'}`}>
                                {countdown !== null ? (
                                    <span className="text-5xl font-pixel text-green-400">{countdown}</span>
                                ) : (
                                    <Swords className="w-16 h-16 text-yellow-500 animate-spin-slow" />
                                )}
                            </div>
                        </div>

                        <div>
                            {countdown !== null ? (
                                <>
                                    <h2 className="text-3xl font-pixel text-green-400 mb-2">Starting in {countdown}s</h2>
                                    <p className="text-stone-300 font-retro text-lg">
                                        {playersFound} Wizard{playersFound !== 1 ? 's' : ''} ready!
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-3xl font-pixel text-yellow-500 mb-2">{matchStatus}</h2>
                                    <p className="text-stone-400 font-retro text-lg">
                                        Found {playersFound} / 4 Wizards
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="w-full h-4 bg-stone-800 rounded-full overflow-hidden border border-stone-600">
                            <div
                                className={`h-full transition-all duration-500 ${countdown !== null ? 'bg-green-500' : 'bg-yellow-600'}`}
                                style={{ width: `${(playersFound / 4) * 100}%` }}
                            ></div>
                        </div>

                        <Button
                            onClick={handleCancelSearch}
                            variant="outline"
                            className="mt-8 border-red-800 text-red-500 hover:bg-red-900/20 font-pixel tracking-widest"
                        >
                            RETREAT
                        </Button>
                    </div>
                </div>
            )}

            <div className="absolute bottom-4 text-stone-600 text-xs font-mono">
                CodeDungeon Alpha v0.3 • Establish connection to override reality
            </div>
        </div>
    );
}
