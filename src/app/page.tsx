'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CodeDungeon from "@/components/codedungeon/CodeDungeon";
import LandingPage from "@/components/codedungeon/LandingPage";

// 1. Move your main logic into a separate internal component
function HomeContent() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const storedName = localStorage.getItem('codedungeon_player_name');
    if (storedName) {
      setPlayerName(storedName);
    }
  }, []);

  // We removed the useEffect that auto-sets roomId from URL to ensure we start at LandingPage (Home) on reload.

  const handleStart = (name: string, existingRoomId?: string) => {
    setPlayerName(name);
    localStorage.setItem('codedungeon_player_name', name);
    const newRoomId = existingRoomId || `room-${Date.now()}`;
    setRoomId(newRoomId);
    router.push(`/?room=${newRoomId}`);
  };

  const handleExit = () => {
    setRoomId(null);
    setPlayerName("");
    localStorage.removeItem('codedungeon_player_name');
    router.push('/');
  };

  // If we have a roomId but no player name, we essentially want the user to "Join" this specific room.
  // We can pass the `roomId` to LandingPage as a "pending join" or just let LandingPage handle the "Start / Join" flow.
  // Actually, if `roomId` is set from URL, `CodeDungeon` renders.
  // We should prevent `CodeDungeon` from rendering if no name.

  if (!roomId || !playerName) {
    // If we have a roomId (from URL) but no name, we might want to automatically trigger the "Join" dialog in LandingPage?
    // For now, let's just make LandingPage capable of handling this.
    // We pass `initialRoomId` if we want to support direct link joining flow in the future.
    // For this task, the user emphasized "Join Code Dungeon" -> Name -> Move Forward.
    return (
      <LandingPage
        onJoin={(name, id) => handleStart(name, id)}
        initialRoomId={searchParams.get('room') || undefined}
      />
    );
  }

  return <CodeDungeon roomId={roomId} playerName={playerName} onExit={handleExit} />;
}

// 2. Wrap the content component in a Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-black text-white">Loading Dungeon...</div>}>
      <HomeContent />
    </Suspense>
  );
}