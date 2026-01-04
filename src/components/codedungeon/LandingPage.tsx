'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Users, Globe, Lock, BookOpen, Zap, Cpu, Gem } from "lucide-react";
import VillagerCrying from './Villager_Crying.webp';

interface LandingPageProps {
    onJoin: (name: string, roomId?: string) => void;
    initialRoomId?: string;
    savedName?: string;
}

export default function LandingPage({ onJoin, initialRoomId, savedName }: LandingPageProps) {
    const [name, setName] = useState(savedName || "");
    const [tempName, setTempName] = useState("");
    const [joinInput, setJoinInput] = useState("");
    const [isNameDialogOpen, setNameDialogOpen] = useState(false);
    const [isRoomSelectionOpen, setRoomSelectionOpen] = useState(false);
    const [isJoinDialogOpen, setJoinDialogOpen] = useState(false);

    // If we have an initialRoomId, we want to prompt for name and then immediately join
    // This effect runs once to open the dialog if needed
    // But we'll rely on user interaction for now to be less intrusive, or strictly enforce it?
    // User said "enter name, and then only we can move forward".
    // If they came via link, they are "moving forward" to a specific room.
    // Let's assume manual click for now for "New Adventure".
    // For "Join Link", we might want to auto-open. 
    // Let's handle generic flow first.

    const handleNameSubmit = () => {
        if (!tempName.trim()) return;
        setName(tempName);
        setNameDialogOpen(false);
        // If we had a pending "Start" action (like initialRoomId), we could trigger it here.
        if (initialRoomId) {
            onJoin(tempName, initialRoomId);
        }
    };

    const handlePrivateRealm = () => {
        // Generate a random 4-digit private room ID
        const privateRoomId = 'room-' + Math.floor(1000 + Math.random() * 9000).toString();
        // User wants short IDs.
        onJoin(name, privateRoomId);
    };

    const handleRandomRealm = () => {
        onJoin(name, 'room-public-alpha');
    };

    return (
        <div className="min-h-screen bg-black flex flex-col font-retro text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 animate-pulse pointer-events-none"></div>

            {/* Header / Navbar */}
            <div className="w-full p-6 flex justify-between items-center z-10">
                <div className="text-2xl font-pixel text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    CODE DUNGEON
                </div>

                {!name ? (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="font-pixel text-stone-300 hover:text-white hover:bg-stone-800 border-2 border-stone-700 bg-stone-900/50 backdrop-blur-sm">
                                <BookOpen className="w-5 h-5 mr-2" />
                                HOW IT WORKS
                            </Button>
                        </DialogTrigger>
                        <HowItWorksDialogContent />
                    </Dialog>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-stone-900 border border-stone-700 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-pixel text-sm text-yellow-500">Wizard-{name}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 z-10 text-center space-y-8">

                <h1 className="text-6xl md:text-8xl font-pixel text-white drop-shadow-[4px_4px_0_rgba(168,85,247,0.5)] mb-4">
                    CODE DUNGEON
                </h1>
                <p className="text-xl md:text-2xl text-stone-400 max-w-2xl leading-relaxed">
                    Embark on a legendary quest to master the arcane arts of C++.
                    Solve algorithmic puzzles, defeat bugs, and claim glory.
                </p>

                <div className="pt-2 flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {!name ? (
                        <Dialog open={isNameDialogOpen} onOpenChange={setNameDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="px-16 py-10 text-3xl font-pixel bg-green-600 hover:bg-green-700 text-white border-4 border-green-800 shadow-[0_8px_0_rgb(22,101,52)] hover:shadow-[0_4px_0_rgb(22,101,52)] hover:translate-y-1 transition-all min-w-[350px]"
                                >
                                    START ADVENTURE
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-stone-900 border-4 border-stone-600 font-retro text-white sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-xl text-yellow-500 font-pixel">Identify Yourself</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label className="text-stone-400">Adventurer Name</Label>
                                        <Input
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            placeholder="Ex: Kevin Parker"
                                            className="bg-black border-stone-700 text-white font-mono"
                                            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleNameSubmit} disabled={!tempName.trim()} className="w-full bg-green-600 hover:bg-green-700 font-pixel">
                                        ENTER THE REALM
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <>
                            {/* New Adventure Button */}
                            <Dialog open={isRoomSelectionOpen} onOpenChange={setRoomSelectionOpen}>
                                <DialogTrigger asChild>
                                    <Button className="px-10 py-8 text-xl md:text-2xl font-pixel bg-purple-600 hover:bg-purple-700 text-white border-4 border-purple-800 shadow-[0_8px_0_rgb(107,33,168)] hover:shadow-[0_4px_0_rgb(107,33,168)] hover:translate-y-1 transition-all w-full md:w-auto md:min-w-[300px]">
                                        NEW ADVENTURE
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-stone-900 border-4 border-stone-600 font-retro text-white sm:max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl text-center text-yellow-500 font-pixel mb-8">CHOOSE YOUR PATH</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                                        <Card
                                            className="bg-black/50 border-2 border-stone-700 hover:border-blue-500 hover:bg-black/70 cursor-pointer transition-all group"
                                            onClick={handlePrivateRealm}
                                        >
                                            <CardHeader className="text-center">
                                                <div className="mx-auto bg-blue-900/20 p-4 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                                    <Lock className="w-8 h-8 text-blue-400" />
                                                </div>
                                                <CardTitle className="font-pixel text-blue-400">PRIVATE REALM</CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-center text-stone-400 text-sm">
                                                Start the grind with your friends. A secluded instance just for your party.
                                            </CardContent>
                                        </Card>

                                        <Card
                                            className="bg-black/50 border-2 border-stone-700 hover:border-red-500 hover:bg-black/70 cursor-pointer transition-all group"
                                            onClick={handleRandomRealm}
                                        >
                                            <CardHeader className="text-center">
                                                <div className="mx-auto bg-red-900/20 p-4 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                                    <Globe className="w-8 h-8 text-red-500" />
                                                </div>
                                                <CardTitle className="font-pixel text-red-500">RANDOM REALM</CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-center text-stone-400 text-sm">
                                                Time for solo grind. Join a chaotic world with strangers.
                                            </CardContent>
                                        </Card>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* Join Realm Button */}
                            <Dialog open={isJoinDialogOpen} onOpenChange={setJoinDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="px-10 py-8 text-xl md:text-2xl font-pixel bg-blue-600 hover:bg-blue-700 text-white border-4 border-blue-800 shadow-[0_8px_0_rgb(29,78,216)] hover:shadow-[0_4px_0_rgb(29,78,216)] hover:translate-y-1 transition-all w-full md:w-auto md:min-w-[300px]">
                                        JOIN REALM
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-stone-900 border-4 border-stone-600 font-retro text-white sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl text-center text-blue-400 font-pixel mb-2">ACCESS TERMINAL</DialogTitle>
                                    </DialogHeader>
                                    <JoinSessionForm name={name} onJoin={onJoin} />
                                </DialogContent>
                            </Dialog>
                        </>
                    )}
                </div>

                <div className="text-xs text-white/20 mt-16 font-mono absolute bottom-4">
                    v1.2.0 • The Code-Dungeon Guild                </div>
            </div>
        </div>
    );
}

function JoinSessionForm({ name, onJoin }: { name: string, onJoin: (name: string, roomId: string) => void }) {
    const [joinInput, setJoinInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);

    const handleJoin = async () => {
        if (!joinInput.trim()) return;
        setLoading(true);
        const roomId = `room-${joinInput.trim()}`;

        try {
            const { get, ref } = await import('firebase/database');
            const { db } = await import('@/lib/firebase');

            const snapshot = await get(ref(db, `dungeon-sessions/${roomId}`));

            if (snapshot.exists()) {
                onJoin(name, roomId);
            } else {
                // Invalid Session -> Show Error Dialog
                setErrorDialogOpen(true);
                setLoading(false);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to verify session.");
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        const newId = 'room-' + Math.floor(1000 + Math.random() * 9000).toString();
        onJoin(name, newId);
    };

    return (
        <>
            <div className="flex flex-col gap-6 py-4">
                <div className="space-y-2">
                    <Label className="text-stone-400 font-pixel text-sm uppercase">Enter 4-Digit ID</Label>
                    <Input
                        value={joinInput}
                        onChange={(e) => setJoinInput(e.target.value)}
                        placeholder="0000"
                        className="bg-black border-stone-700 text-white font-mono text-4xl text-center py-8 focus:border-blue-500 uppercase tracking-[0.5em] placeholder:tracking-normal"
                        onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                        maxLength={4}
                        autoFocus
                    />
                </div>

                <Button
                    onClick={handleJoin}
                    disabled={!joinInput.trim() || loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-pixel text-xl py-6 border-b-4 border-blue-900 shadow-lg active:translate-y-1 active:shadow-none transition-all w-full leading-none"
                >
                    {loading ? "SEARCHING..." : "CONNECT TO REALM"}
                </Button>
            </div>

            <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
                <DialogContent className="bg-stone-900/95 backdrop-blur-sm border-4 border-red-500 text-white sm:max-w-md p-0 overflow-hidden">
                    <div className="relative w-full h-64 bg-red-900/20 flex items-center justify-center p-4">
                        <img
                            src={VillagerCrying.src}
                            alt="Confused Villager"
                            className="object-contain h-full w-full drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>

                    <div className="p-6 space-y-4 text-center">
                        <DialogHeader>
                            <DialogTitle className="text-2xl text-red-500 font-pixel text-center">SESSION NOT FOUND</DialogTitle>
                        </DialogHeader>
                        <p className="text-stone-300 font-retro">
                            The realm ID <span className="text-yellow-500 font-bold">{joinInput}</span> does not exist in the archives.
                            <br />
                            Did the goblins steal a digit?
                        </p>

                        <div className="flex flex-col gap-3 pt-2">
                            <Button onClick={handleCreateNew} className="bg-purple-600 hover:bg-purple-700 font-pixel text-lg py-6 border-b-4 border-purple-800 shadow-md active:translate-y-1 active:shadow-none transition-all">
                                CREATE NEW REALM
                            </Button>
                            <Button onClick={() => setErrorDialogOpen(false)} variant="ghost" className="text-stone-400 hover:text-white font-mono hover:bg-stone-800">
                                Try Again
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function HowItWorksDialogContent() {
    return (
        <DialogContent className="bg-stone-900 border-4 border-stone-600 text-white max-w-4xl max-h-[85vh] overflow-y-auto font-retro p-0">
            <div className="sticky top-0 z-10 bg-stone-900 border-b-4 border-stone-700 p-6 flex justify-between items-center">
                <DialogTitle className="text-3xl font-pixel text-yellow-500">ADVENTURER'S HANDBOOK</DialogTitle>
                <div className="text-xs font-mono text-stone-500">v1.2.0</div>
            </div>

            <div className="p-8 space-y-12">
                {/* Intro */}
                <section className="text-center space-y-4">
                    <h3 className="text-2xl font-pixel text-purple-400">WELCOME TO THE DIGITAL DOJO</h3>
                    <p className="text-stone-300 text-lg leading-relaxed max-w-2xl mx-auto">
                        A collaborative, real-time coding platform where you and your friends can solve C++ programming challenges together, wrapped in a retro RPG aesthetic.
                    </p>
                </section>

                {/* Core Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-black/40 p-6 rounded border-2 border-stone-800 flex flex-col items-center text-center gap-3">
                        <Users className="w-10 h-10 text-blue-400" />
                        <h4 className="font-pixel text-blue-400">Real-Time Collaboration</h4>
                        <p className="text-sm text-stone-400">Code together in the same editor, instantly. See your party's cursors and edits live.</p>
                    </div>
                    <div className="bg-black/40 p-6 rounded border-2 border-stone-800 flex flex-col items-center text-center gap-3">
                        <Zap className="w-10 h-10 text-yellow-400" />
                        <h4 className="font-pixel text-yellow-400">Instant Execution</h4>
                        <p className="text-sm text-stone-400">Run your C++ "spells" in a secure sandbox via Piston API and see immediate results.</p>
                    </div>
                    <div className="bg-black/40 p-6 rounded border-2 border-stone-800 flex flex-col items-center text-center gap-3">
                        <Cpu className="w-10 h-10 text-purple-400" />
                        <h4 className="font-pixel text-purple-400">AI Quest Giver</h4>
                        <p className="text-sm text-stone-400">Face unique, fantasy-themed challenges generated by Google's Gemini AI.</p>
                    </div>
                    <div className="bg-black/40 p-6 rounded border-2 border-stone-800 flex flex-col items-center text-center gap-3">
                        <Gem className="w-10 h-10 text-green-400" />
                        <h4 className="font-pixel text-green-400">RPG Progression</h4>
                        <p className="text-sm text-stone-400">Earn Gold and XP, level up, and unlock tougher dungeon strata.</p>
                    </div>
                </div>

                {/* Process Flow */}
                <section className="space-y-6">
                    <h3 className="text-2xl font-pixel text-center text-orange-400">YOUR JOURNEY</h3>
                    <div className="space-y-4 relative pl-8 border-l-4 border-stone-700 ml-4">
                        <div className="relative">
                            <div className="absolute -left-[42px] top-1 bg-stone-900 p-2 rounded-full border-2 border-stone-600 text-stone-400 flex items-center justify-center w-8 h-8 font-mono">1</div>
                            <h4 className="font-bold text-white">Enter the Dungeon</h4>
                            <p className="text-stone-400 text-sm">Create a new room or join your party with a code.</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[42px] top-1 bg-stone-900 p-2 rounded-full border-2 border-stone-600 text-stone-400 flex items-center justify-center w-8 h-8 font-mono">2</div>
                            <h4 className="font-bold text-white">Consult the Quest Board</h4>
                            <p className="text-stone-400 text-sm">The AI Quest Giver generates a unique C++ challenge.</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[42px] top-1 bg-stone-900 p-2 rounded-full border-2 border-stone-600 text-stone-400 flex items-center justify-center w-8 h-8 font-mono">3</div>
                            <h4 className="font-bold text-white">Forge Your Spell</h4>
                            <p className="text-stone-400 text-sm">Write your solution in the collaborative Monaco editor.</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[42px] top-1 bg-stone-900 p-2 rounded-full border-2 border-stone-600 text-stone-400 flex items-center justify-center w-8 h-8 font-mono">4</div>
                            <h4 className="font-bold text-white">Cast & Conquer</h4>
                            <p className="text-stone-400 text-sm">Execute code, pass tests, and earn Gold/XP!</p>
                        </div>
                    </div>
                </section>

                {/* Tech Stack Footer */}
                <div className="pt-8 border-t border-stone-800 text-center">
                    <p className="text-stone-500 font-mono text-xs uppercase tracking-widest mb-4">Powered By</p>
                    <div className="flex justify-center gap-6 opacity-70 grayscale hover:grayscale-0 transition-all text-xs font-mono text-stone-400">
                        <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> Next.js 15</div>
                        <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Firebase</div>
                        <div className="flex items-center gap-2"><Cpu className="w-4 h-4" /> Gemini API</div>
                    </div>
                </div>
            </div>
        </DialogContent>
    );
}
