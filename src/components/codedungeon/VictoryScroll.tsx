'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import Image from 'next/image';

interface VictoryScrollProps {
    playerName: string;
    onNewAdventure: () => void;
}

const RUNES = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";

export default function VictoryScroll({ playerName, onNewAdventure }: VictoryScrollProps) {
    const [stage, setStage] = useState<'closed' | 'opening' | 'script' | 'fading' | 'final'>('closed');
    const [displayedText, setDisplayedText] = useState({
        title: "",
        body1: "",
        body2: "",
        body3: "",
        sign: ""
    });

    const finalContent = {
        title: "VICTORY ACHIEVED!\nDUNGEON TAMED!",
        body1: `TO MIGHTY WIZARD ${playerName.toUpperCase()} - LIGHT OF THE DUNGEON:`,
        body2: "YOUR MIGHTY SPELLS HAVE TAMED THE DRAGONS IN OUR DUNGEON, YOU MIGHTY WIZARD.",
        body3: "CLAIM YOUR REWARD AND PREPARE FOR THE NEXT STRATA.",
        sign: "Signed,\nThe Code-Dungeon Guild."
    };

    // Background Music Effect
    useEffect(() => {
        const audio = new Audio('/music.mp4');
        audio.currentTime = 7; // Start at 7s
        audio.volume = 0.5; // Reasonable volume

        const playAudio = async () => {
            try {
                await audio.play();
            } catch (err) {
                console.error("Audio playback failed (autoplay policy?):", err);
            }
        };

        const handleTimeUpdate = () => {
            // Loop from 32s back to 7s
            if (audio.currentTime >= 32) {
                audio.currentTime = 7;
                audio.play();
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        playAudio();

        return () => {
            audio.pause();
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.src = ""; // Cleanup
        };
    }, []);

    // Capture and Download Screenshot
    const handleShare = async () => {
        const element = document.getElementById('victory-capture-area');
        if (element) {
            try {
                const canvas = await html2canvas(element, {
                    backgroundColor: '#000',
                    scale: 2,
                    useCORS: true,
                });
                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `codedungeon-victory-${new Date().getTime()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error("Screenshot capture failed:", error);
            }
        }
    };

    // Animation Sequence
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        // 1. Start Opening
        timeout = setTimeout(() => setStage('opening'), 500);
        // 2. Start Script
        setTimeout(() => setStage('script'), 2500);
        // 3. Fade to English
        setTimeout(() => setStage('fading'), 5000);
        // 4. Final Text
        setTimeout(() => setStage('final'), 8000);

        return () => clearTimeout(timeout);
    }, []);

    // Rune/Script Effect
    useEffect(() => {
        if (stage !== 'script' && stage !== 'fading') return;

        const interval = setInterval(() => {
            setDisplayedText({
                title: generateObfuscatedText(finalContent.title),
                body1: generateObfuscatedText(finalContent.body1),
                body2: generateObfuscatedText(finalContent.body2),
                body3: generateObfuscatedText(finalContent.body3),
                sign: generateObfuscatedText(finalContent.sign),
            });
        }, 120);

        return () => clearInterval(interval);
    }, [stage, playerName]);

    const generateObfuscatedText = (text: string) => {
        return text.split('').map(char => {
            if (/\s/.test(char)) return char; // Preserve whitespace/newlines
            return RUNES[Math.floor(Math.random() * RUNES.length)];
        }).join('');
    };

    return (
        <div
            id="victory-capture-area"
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center overflow-hidden"
        >
            <div
                className={cn(
                    "relative transition-all ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col items-center justify-center overflow-hidden",
                    stage === 'closed' ? "w-0 h-[10vh] opacity-0 transition-all duration-1000" : "w-[99vw] max-w-[2000px] h-[98vh] opacity-100 transition-all duration-[4000ms]"
                )}
                style={{ transitionDuration: stage === 'closed' ? '1000ms' : '4000ms' }}
            >
                {/* Background Image - Scaled to 115% with 3px shift */}
                <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
                    <div className="relative w-full h-full transform scale-[1.15] translate-y-[3px]">
                        <Image
                            src="/scroll-bg.png"
                            alt="Ancient Scroll"
                            fill
                            priority
                            sizes="100vw"
                            className="object-fill"
                            style={{ filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.8))" }}
                        />
                    </div>
                </div>

                {/* Content Container - 16vw padding, 5px shift */}
                <div className="relative z-10 w-full h-full flex items-center pt-[16vh] pb-[16vh] px-[16vw] gap-8 md:gap-16 translate-y-[5px]">

                    {/* LEFT COLUMN: Image - 45% */}
                    <div className="w-[45%] h-full flex items-center justify-center">
                        <div className={cn(
                            "relative w-full aspect-[4/3] shadow-2xl overflow-hidden rounded-lg border-[4px] border-[#5e3a22] transition-all duration-1000 bg-black/20",
                            stage === 'closed' ? "opacity-0 scale-95" : "opacity-100 scale-100"
                        )}>
                            <Image
                                src="/victory-scene.png"
                                alt="Victory Scene"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                                className="object-cover transition-transform duration-1000 hover:scale-105"
                            />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Text & Actions - 55% */}
                    <div className="w-[55%] h-full flex flex-col justify-center text-left space-y-3 md:space-y-4">

                        {/* Title */}
                        <div>
                            <h1 className={cn(
                                "text-xl md:text-2xl lg:text-3xl font-bold font-pixel text-[#3a2214] tracking-wide leading-tight transition-all duration-1000 uppercase",
                                stage === 'closed' ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
                            )}>
                                {stage === 'final' ? finalContent.title : displayedText.title}
                            </h1>
                            <div className="h-1 w-16 bg-[#5e3a22]/30 mt-2 rounded-full"></div>
                        </div>

                        {/* Body Text */}
                        <div className="space-y-2 md:space-y-3">
                            <p className={cn(
                                "font-pixel text-xs md:text-sm text-[#4a2e20] leading-snug transition-all duration-700 break-words",
                                stage === 'fading' ? "text-blue-800 blur-[1px]" : ""
                            )}>
                                {stage === 'final' ? finalContent.body1 : displayedText.body1}
                            </p>

                            <p className={cn(
                                "font-pixel text-xs md:text-sm text-[#5e3a22] leading-snug transition-all duration-700 break-words",
                                stage === 'fading' ? "text-blue-800 blur-[1px]" : ""
                            )}>
                                {stage === 'final' ? finalContent.body2 : displayedText.body2}
                            </p>

                            <p className={cn(
                                "font-pixel text-xs md:text-sm font-bold text-[#2c1810] transition-all duration-700 break-words",
                                stage === 'fading' ? "text-blue-900 blur-[1px]" : ""
                            )}>
                                {stage === 'final' ? finalContent.body3 : displayedText.body3}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 flex gap-4 w-full max-w-md" style={{ opacity: stage === 'final' ? 1 : 0, transition: 'opacity 1s ease-in' }}>
                            <Button
                                onClick={handleShare}
                                className="flex-1 bg-transparent hover:bg-[#5e3a22]/10 text-[#3a2214] border-[3px] border-black font-pixel h-12 text-xs md:text-sm rounded-none shadow-none transition-all uppercase leading-tight"
                            >
                                Share<br className="md:hidden" />
                                <span className="ml-1 md:block">Achievement</span>
                            </Button>
                            <Button
                                onClick={onNewAdventure}
                                className="flex-1 bg-transparent hover:bg-[#5e3a22]/10 text-[#3a2214] border-[3px] border-black font-pixel h-12 text-xs md:text-sm rounded-none shadow-none transition-all uppercase leading-tight"
                            >
                                New<br className="md:hidden" />
                                <span className="ml-1 md:block">Adventure</span>
                            </Button>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
