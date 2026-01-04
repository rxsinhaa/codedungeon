'use client';
import { Scroll, Coins, Heart, Zap, Bug, LogOut } from 'lucide-react';
import Image from 'next/image';
import type { PartyMember } from './CodeDungeon';
import { auth } from '@/lib/firebase';

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type HeaderProps = {
  party: Record<string, PartyMember>;
  hp: number;
  mana: number;
  gold: number;
  roomId: string;
  currentRoomIndex: number;
  totalRooms: number;
  onDebugCompleteQuest: () => void;
  onExit: () => void;
};

export default function Header({ party, hp, mana, gold, roomId, currentRoomIndex, totalRooms, onDebugCompleteQuest, onExit }: HeaderProps) {
  const onlinePartyMembers = Object.values(party).filter(p => p.online);
  const currentUser = auth.currentUser;

  return (
    <header className="h-24 bg-primary border-b-4 border-border relative z-20 flex items-center justify-between px-6 shadow-xl transition-colors duration-500">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_var(--color-primary-dark)_1px,_transparent_1px)] bg-[length:4px_4px] pointer-events-none"></div>

      <div className="relative z-10 flex items-center gap-6">
        <div className="group relative">
          <div className="w-16 h-16 bg-secondary pixel-border border-border flex items-center justify-center transform group-hover:rotate-6 transition-transform cursor-pointer">
            <Scroll className="w-10 h-10 text-primary-foreground drop-shadow-md" />
          </div>
          <div className="absolute -bottom-10 left-0 bg-popover text-popover-foreground text-xs font-pixel p-2 hidden group-hover:block whitespace-nowrap border-2 border-border z-50">
            Grimoire v1.0
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="font-pixel text-primary-foreground text-lg md:text-xl tracking-wider drop-shadow-md">
            CODEDUNGEON
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            {/* Session ID / Copy with Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-sm border border-white/10 cursor-pointer hover:bg-black/40 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-primary-foreground font-pixel text-xs">
                    Session: {roomId.replace('room-', '').substring(0, 12)}
                  </span>
                  <div
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent popover trigger if possible, or just let it open.
                      navigator.clipboard.writeText(roomId.replace('room-', ''));
                    }}
                    className="ml-2 hover:text-yellow-400 transition-colors"
                    title="Copy ID"
                  >
                    <Scroll className="w-3 h-3" />
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-56 bg-stone-900 border-2 border-stone-600 p-3 shadow-xl">
                <div className="font-pixel text-yellow-500 text-xs mb-2 border-b border-stone-700 pb-1">
                  ADVENTURERS ({onlinePartyMembers.length})
                </div>
                <div className="space-y-1">
                  {onlinePartyMembers.map(p => (
                    <div key={p.name} className="text-xs font-mono text-stone-300 flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      {p.name}
                    </div>
                  ))}
                  {onlinePartyMembers.length === 0 && <span className="text-stone-500 text-xs">No one here...</span>}
                </div>
              </PopoverContent>
            </Popover>

            {/* Strata (Room) */}
            <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-sm border border-white/10">
              <span className="text-primary-foreground font-pixel text-xs text-yellow-300">Strata {currentRoomIndex + 1} / {totalRooms}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6 bg-black/50 p-2 md:p-3 rounded pixel-border-sm border-secondary">
        <div className="flex flex-col gap-1 w-24 md:w-40">
          <div className="flex justify-between items-center text-[10px] md:text-xs font-pixel text-red-300">
            <div className="hidden md:flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>HP</span>
            </div>
            <span className="md:hidden">HP</span>
            <span>{hp}/100</span>
          </div>
          <div className="h-2 md:h-4 bg-stone-900 border-2 border-secondary relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3)] transition-all duration-500" style={{ width: `${hp}%` }}></div>
            <div className="absolute top-0 left-0 w-full h-[1px] md:h-[2px] bg-red-400 opacity-50"></div>
          </div>
        </div>

        <div className="flex flex-col gap-1 w-24 md:w-40">
          <div className="flex justify-between items-center text-[10px] md:text-xs font-pixel text-blue-300">
            <div className="hidden md:flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>MP</span>
            </div>
            <span className="md:hidden">MP</span>
            <span>{mana}/100</span>
          </div>
          <div className="h-2 md:h-4 bg-stone-900 border-2 border-secondary relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3)] transition-all duration-500" style={{ width: `${mana}%` }}></div>
            <div className="absolute top-0 left-0 w-full h-[1px] md:h-[2px] bg-blue-400 opacity-50"></div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-4">
        <div className="flex items-center gap-2 bg-stone-800 px-3 py-2 border-2 border-gold rounded-sm shadow-md">
          <Coins className="w-4 h-4 text-gold" />
          <span className="font-pixel text-gold text-xs">{gold}g</span>
        </div>

        <button
          onClick={onExit}
          className="w-10 h-10 bg-red-900/80 border-2 border-red-500 flex items-center justify-center hover:bg-red-800 transition-colors rounded-sm ml-2"
          title="Leave Party"
        >
          <LogOut className="w-5 h-5 text-red-300" />
        </button>

        <div className="flex items-center gap-2">
          {Object.entries(party)
            .filter(([_, member]) => member.online)
            .map(([uid, member]) => {
              const isCurrentUser = currentUser && uid === currentUser.uid;
              return (
                <div key={uid} className="group w-12 h-12 bg-secondary pixel-border border-border overflow-hidden relative cursor-pointer hover:scale-105 transition-transform">
                  <Image src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${member.name}`} alt="Player" width={48} height={48} className="w-full h-full object-cover" unoptimized />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white"></div>
                  {isCurrentUser && (
                    <button onClick={onDebugCompleteQuest} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Bug className="w-6 h-6 text-yellow-300" />
                    </button>
                  )}
                </div>
              )
            })}
        </div>

      </div>
    </header>
  );
}
