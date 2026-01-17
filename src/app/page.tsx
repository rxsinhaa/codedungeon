'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CodeDungeon from "@/components/codedungeon/CodeDungeon";
import LandingPage from "@/components/codedungeon/LandingPage";
import { useAuth } from "@/context/AuthContext";

// 1. Move your main logic into a separate internal component
function HomeContent() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle URL params for room
  useEffect(() => {
    const roomFromUrl = searchParams.get('room');
    if (roomFromUrl) {
      setRoomId(roomFromUrl);
    }
  }, [searchParams]);

  const handleStart = (name: string, existingRoomId?: string) => {
    // Name is unused here as we use auth user's name, but keeping signature for now
    const newRoomId = existingRoomId || `room-${Date.now()}`;
    setRoomId(newRoomId);
    router.push(`/?room=${newRoomId}`);
  };

  const handleExit = () => {
    setRoomId(null);
    router.push('/');
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-black text-white font-pixel">Loading Realm...</div>;
  }

  // If not logged in, OR if logged in but no room selected -> Show Landing Page
  // Note: user can be logged in and still be on Landing Page to choose "New Adventure" vs "Join".
  // If user is logged in AND has roomId -> Enter Dungeon.

  if (!user || !roomId) {
    return (
      <LandingPage
        onJoin={(name, id) => handleStart(name, id)}
        initialRoomId={searchParams.get('room') || undefined}
      />
    );
  }

  return (
    <CodeDungeon
      roomId={roomId}
      playerName={user.displayName || "Unknown_Wizard"}
      onExit={handleExit}
    />
  );
}

// 2. Wrap the content component in a Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-black text-white">Loading Dungeon...</div>}>
      <HomeContent />
    </Suspense>
  );
}