'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Trophy } from 'lucide-react';

type RoomTransitionProps = {
    isOpen: boolean;
    dungeonName: string;
    onComplete: () => void;
};

export default function RoomTransition({ isOpen, dungeonName, onComplete }: RoomTransitionProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onComplete, 500); // Wait for fade out
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onComplete]);

    if (!isOpen && !visible) return null;

    return (
        <div className={`fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-center animate-in zoom-in duration-500">
                <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] animate-bounce" />
                <h1 className="font-pixel text-6xl text-white mb-2 tracking-widest text-shadow-glow">ROOM CLEARED!</h1>
                <p className="font-retro text-2xl text-stone-300 mb-12">The party is victorious.</p>

                <div className="flex items-center justify-center gap-4 text-4xl text-yellow-400 font-pixel">
                    <span>ENTERING</span>
                    <ArrowRight className="w-8 h-8 animate-pulse" />
                    <span className="text-white drop-shadow-md">{dungeonName}</span>
                </div>
            </div>

            <div className="absolute bottom-10 left-0 right-0 text-center text-stone-500 font-retro animate-pulse">
                Preparing next challenge...
            </div>
        </div>
    );
}
