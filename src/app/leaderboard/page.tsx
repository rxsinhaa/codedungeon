'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LeaderboardPage from '@/components/codedungeon/LeaderboardPage';

function LeaderboardContent() {
    const searchParams = useSearchParams();
    const roomId = searchParams.get('room') || undefined;

    return <LeaderboardPage initialRoomId={roomId} />;
}

export default function Leaderboard() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-black text-white font-pixel">Loading Leaderboard...</div>}>
            <LeaderboardContent />
        </Suspense>
    );
}
