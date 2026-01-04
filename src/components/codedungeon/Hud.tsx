'use client';

import CombatLog from './CombatLog';
import PartyChat from './PartyChat';
import type { LogMessage, PartyMember } from './CodeDungeon';
import { cn } from '@/lib/utils';

type HudProps = {
  logs: LogMessage[];
  party: Record<string, PartyMember>;
  isCombatLogExpanded: boolean;
  onToggleCombatLog: () => void;
  roomId: string;
};

export default function Hud({ logs, party, isCombatLogExpanded, onToggleCombatLog, roomId }: HudProps) {
  return (
    <div className={cn(
      "flex-col gap-4 hidden md:flex transition-all duration-300 ease-in-out",
      isCombatLogExpanded ? "flex-1" : "w-96"
    )}>
      <CombatLog 
        logs={logs} 
        isExpanded={isCombatLogExpanded}
        onToggleExpand={onToggleCombatLog}
      />
      <PartyChat party={party} roomId={roomId}/>
    </div>
  );
}
