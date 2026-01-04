'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Loader, RefreshCw } from "lucide-react";
import type { Quest } from "@/ai/flows/generate-coding-quests";
import { Badge } from "../ui/badge";

type QuestBoardProps = {
  isOpen: boolean;
  onClose: () => void;
  onGenerateQuests: () => Promise<void>;
  onAcceptQuest: (quest: Quest) => void;
  quests: Quest[];
  isGenerating: boolean;
  currentQuest: Quest | null;
  completedQuestTitles: string[];
  questClaims?: Record<number, { uid: string, name: string }>;
  currentRoomIndex: number;
};

export default function QuestBoard({ isOpen, onClose, onGenerateQuests, onAcceptQuest, quests, isGenerating, currentQuest, completedQuestTitles, questClaims = {}, currentRoomIndex }: QuestBoardProps) {

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'apprentice': return 'bg-green-100 text-green-700';
      case 'journeyman': return 'bg-blue-100 text-blue-700';
      case 'master': return 'bg-purple-100 text-purple-700';
      case 'legendary': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-stone-100 text-stone-700';
    }
  }

  // Calculate progress
  const completedCount = completedQuestTitles.length;
  let nextThreshold = 2;
  if (currentRoomIndex === 0) nextThreshold = 2;
  else if (currentRoomIndex === 1) nextThreshold = 4;
  else if (currentRoomIndex === 2) nextThreshold = 7;
  else if (currentRoomIndex === 3) nextThreshold = 10;
  else nextThreshold = 14;

  const progress = Math.min(100, (completedCount / nextThreshold) * 100);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] bg-primary border-[8px] border-border shadow-[0_0_50px_rgba(0,0,0,0.8)] p-8 text-primary-foreground font-retro flex flex-col transition-colors duration-500">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none"></div>
        <button onClick={onClose} className="absolute -top-4 -right-4 bg-destructive text-destructive-foreground w-10 h-10 border-4 border-border font-pixel hover:scale-110 transition-transform shadow-xl flex items-center justify-center z-50">X</button>

        <DialogHeader className="relative z-10 text-center mb-4 flex-shrink-0">
          <DialogTitle className="font-pixel text-primary-foreground text-2xl md:text-3xl drop-shadow-[4px_4px_0_rgba(0,0,0,0.2)] mb-2 text-center">
            NOTICE BOARD
          </DialogTitle>

          <div className="flex flex-col items-center justify-center mb-4 w-full max-w-md mx-auto">
            <div className="flex justify-between w-full text-xs font-pixel mb-1 text-muted-foreground">
              <span>Room {currentRoomIndex + 1} Progress</span>
              <span>{completedCount} / {nextThreshold} Quests</span>
            </div>
            <div className="h-4 w-full bg-black/40 border-2 border-border/50 relative rounded-full overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {completedCount >= nextThreshold && (
              <div className="mt-2 text-green-400 font-pixel text-sm animate-bounce">
                GATE UNLOCKED! COMPLETE TO ADVANCE
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button onClick={() => onGenerateQuests()} disabled={isGenerating} className="pixel-btn bg-accent text-accent-foreground px-4 py-2 text-xs">
              {isGenerating ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {isGenerating ? 'Summoning...' : 'Refresh Quests'}
            </Button>
          </div>
        </DialogHeader>

        <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-y-auto pr-4 -mr-4">
          {isGenerating && quests.length === 0 ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-card p-4 shadow-lg relative animate-pulse" style={{ transform: `rotate(${Math.random() * 4 - 2}deg)` }}>
                <div className="border-2 border-border border-dashed p-4 h-full flex flex-col">
                  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-5/6 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full mb-auto"></div>
                  <div className="h-8 bg-secondary rounded mt-4"></div>
                </div>
              </div>
            ))
          ) : quests.map((quest, index) => {
            const isCompleted = completedQuestTitles.includes(quest.title);
            const isActive = currentQuest?.title === quest.title;
            const claim = questClaims[index];

            return (
              <div
                key={index}
                className={`bg-card p-2 shadow-lg relative group transition-all duration-300 ${isActive ? 'scale-105 z-20 border-4 border-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.3)]' : ''} ${isCompleted ? 'opacity-80 grayscale-[0.5]' : ''}`}
                style={{ transform: isActive ? 'none' : `rotate(${index % 2 === 0 ? -1.5 + Math.random() : 1.5 + Math.random()}deg)` }}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-700/80 border-2 border-red-900 shadow-sm z-20"></div>

                {isCompleted && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-80 drop-shadow-md">
                      <line x1="10" y1="10" x2="90" y2="90" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
                      <line x1="90" y1="10" x2="10" y2="90" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
                    </svg>
                  </div>
                )}

                <div className={`border-2 border-dashed p-4 h-full flex flex-col text-card-foreground ${isActive ? 'border-yellow-500/50 bg-yellow-50/5' : 'border-border'}`}>
                  <h3 className="font-pixel text-base text-foreground mb-3 leading-tight">
                    {quest.title}
                    {isActive && <span className="ml-2 text-yellow-500 animate-pulse text-[10px] tracking-widest">[ACTIVE]</span>}
                  </h3>
                  <p className="font-retro text-xl text-foreground leading-5 mb-4 flex-1">
                    {quest.mission_briefing}
                  </p>
                  <div className="flex justify-between items-end border-t-2 border-border border-dashed pt-2">
                    <Badge className={`text-xs font-bold px-2 py-1 rounded ${getDifficultyColor(quest.difficulty)}`}>{quest.difficulty}</Badge>
                    <div className="flex items-center gap-1 text-gold font-pixel text-sm drop-shadow-sm">
                      <Coins className="w-4 h-4" /> {quest.gold_reward}g
                    </div>
                  </div>
                  <Button
                    onClick={() => onAcceptQuest(quest)}
                    disabled={isCompleted || isActive || !!claim}
                    className={`mt-4 w-full font-pixel text-xs py-3 h-auto transition-colors ${isCompleted
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : isActive
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : claim
                          ? 'bg-orange-800 text-orange-200 cursor-not-allowed'
                          : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
                      }`}
                  >
                    {isCompleted ? 'COMPLETED' : isActive ? 'IN PROGRESS' : claim ? `TAKEN BY ${claim.name.split('-')[0]}` : 'ACCEPT'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
