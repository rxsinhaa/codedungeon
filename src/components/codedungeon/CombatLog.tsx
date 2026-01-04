'use client';

import { Terminal, Bug, ChevronsRight, ChevronsLeft } from 'lucide-react';
import type { LogMessage } from './CodeDungeon';
import { useRef, useEffect } from 'react';

type CombatLogProps = {
  logs: LogMessage[];
  isExpanded: boolean;
  onToggleExpand: () => void;
};

export default function CombatLog({ logs, isExpanded, onToggleExpand }: CombatLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogStyle = (type: LogMessage['type']) => {
    switch (type) {
      case 'SUCCESS': return { color: 'hsl(var(--terminal-success))', borderColor: 'hsl(var(--terminal-success))' };
      case 'ERROR': return { color: 'hsl(var(--terminal-error))', borderColor: 'hsl(var(--terminal-error))' };
      case 'QUEST': return { color: 'hsl(var(--terminal-quest))', borderColor: 'hsl(var(--terminal-quest))' };
      case 'SYSTEM': return { color: 'hsl(var(--terminal-system))', borderColor: 'hsl(var(--terminal-system))' };
      case 'DEBUG': return { color: 'hsl(var(--terminal-debug))', borderColor: 'hsl(var(--terminal-debug))' };
      default: return { color: 'hsl(var(--terminal-text))' };
    }
  };

  const getLogTitle = (type: LogMessage['type']) => {
    switch (type) {
      case 'SUCCESS': return 'MANIFESTATION';
      case 'ERROR': return 'FIZZLE';
      case 'DEBUG': return 'DEBUG';
      default: return type;
    }
  }

  const getLogIcon = (type: LogMessage['type']) => {
    switch (type) {
      case 'DEBUG': return <Bug className="w-3 h-3 inline-block mr-1" />;
      default: return null;
    }
  }

  return (
    <div
      className="flex-1 border-[4px] shadow-xl flex flex-col relative overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: 'hsl(var(--terminal-bg))', borderColor: 'hsl(var(--terminal-border))' }}
    >
      <div
        className="p-2 border-b-4 flex justify-between items-center transition-colors duration-500"
        style={{ backgroundColor: 'hsl(var(--terminal-bg))', borderColor: 'hsl(var(--terminal-border))' }}
      >
        <button onClick={onToggleExpand} className="p-1 hover:bg-black/10 rounded-sm" style={{ color: 'hsl(var(--terminal-debug))' }}>
          {isExpanded ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
        <span className="font-pixel text-xs" style={{ color: 'hsl(var(--terminal-text))' }}>COMBAT LOG</span>
        <Terminal className="w-4 h-4" style={{ color: 'hsl(var(--terminal-debug))' }} />
      </div>

      <div className="p-4 font-retro text-xl overflow-y-auto flex-1 space-y-2 relative" ref={scrollRef}>
        <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />
        {logs.map((log, index) => (
          <div key={`${log.timestamp}-${index}`} className="p-2 border-l-4 bg-black/5" style={getLogStyle(log.type)}>
            {log.type !== 'INFO' && (
              <span className="block text-xs font-pixel mb-1 opacity-70">{getLogIcon(log.type)}{getLogTitle(log.type)}</span>
            )}
            <pre className="whitespace-pre-wrap font-retro text-xl leading-5">{log.type === 'INFO' ? `> ${log.message}` : log.message}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
