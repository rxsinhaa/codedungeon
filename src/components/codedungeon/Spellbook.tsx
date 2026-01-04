'use client';

import { Wand2, Map, Loader, FileCode2, ScrollText } from 'lucide-react';
import MonacoEditor from './MonacoEditor';
import type { editor } from 'monaco-editor';
import { useRef } from 'react';
import type { Language } from '@/lib/languages';
import { languages } from '@/lib/languages';
import { useCodeSync } from '@/hooks/useCodeSync';
import type { Quest } from '@/ai/flows/generate-coding-quests';
import { cn } from '@/lib/utils';

type SpellbookProps = {
  onCastSpell: (code: string) => void;
  onToggleQuestBoard: () => void;
  isCasting: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  code: string;
  setCode: (code: string) => void;
  roomId: string;
  currentQuest: Quest | null;
  canCast: boolean;
};

export default function Spellbook({
  onCastSpell,
  onToggleQuestBoard,
  isCasting,
  language,
  setLanguage,
  code,
  setCode,
  roomId,
  currentQuest,
  canCast
}: SpellbookProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const { pushUpdate, setLanguage: syncLanguage } = useCodeSync(roomId, editorRef, setCode);

  const handleLanguageChange = (lang: Language) => {
    // No language change during a quest or if there's only one language
    if (currentQuest || languages.length <= 1) return;
    setLanguage(lang);
    syncLanguage(lang.alias);
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      pushUpdate(value);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative h-full">
      <div className="flex items-end px-4 gap-2">
        {languages.map(lang => (
          <div
            key={lang.alias}
            className={cn(`px-6 py-2 rounded-t-lg border-t-4 border-l-4 border-r-4 transition-all bg-card border-border relative -mb-1 z-10`)}
          >
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-foreground" />
              <span className="font-pixel text-xs font-bold text-foreground">
                spell.{lang.alias}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 bg-card border-[6px] border-border shadow-2xl relative flex flex-col overflow-hidden transition-colors duration-500">
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.1)] z-10"></div>

        <div className="bg-muted border-b-2 border-border p-2 flex justify-between items-center px-4 transition-colors duration-500">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400 border border-red-600"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600"></div>
            <div className="w-3 h-3 rounded-full bg-green-400 border border-green-600"></div>
          </div>
          <div className="font-retro text-muted-foreground text-lg flex items-center gap-2">
            {currentQuest ? <ScrollText className="w-5 h-5 text-yellow-600" /> : <Wand2 className="w-5 h-5" />}
            {currentQuest?.title || 'Free Play'}
          </div>
        </div>

        <MonacoEditor
          editorRef={editorRef}
          language={language.name}
          value={code}
          onChange={handleEditorChange}
        />

        <div className="absolute bottom-6 right-8 flex gap-4 z-20">
          <button onClick={onToggleQuestBoard} className="pixel-btn bg-secondary text-secondary-foreground px-6 py-3 text-xs gap-3 hover:scale-105">
            <Map className="w-5 h-5" /> QUESTS
          </button>

          <button
            onClick={() => onCastSpell(editorRef.current?.getValue() || '')}
            disabled={isCasting || !canCast}
            className="pixel-btn bg-accent text-accent-foreground px-6 py-3 text-xs gap-3 hover:scale-105 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
          >
            {isCasting ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
            {isCasting ? 'CASTING...' : currentQuest ? 'SUBMIT QUEST' : 'CAST SPELL'}
          </button>
        </div>
      </div>
    </div>
  );
}
