import React, { useState } from 'react';
import { HelpCircle, X, Bug, Brain, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAiAssistance, type AssistanceType } from '@/app/actions/ai-helper';
import Markdown from 'react-markdown';
import type { Quest } from '@/ai/flows/generate-coding-quests';

type DungeonGuideProps = {
  currentQuest: Quest | null;
  code: string;
  gold: number;
  onDeductGold: (amount: number) => boolean;
};

type ViewState = 'MENU' | 'LOADING' | 'RESULT';

export default function DungeonGuide({ currentQuest, code, gold, onDeductGold }: DungeonGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewState, setViewState] = useState<ViewState>('MENU');
  const [resultContent, setResultContent] = useState('');
  const [resultTitle, setResultTitle] = useState('');

  const handleAssistance = async (type: AssistanceType, cost: number, title: string) => {
    if (!currentQuest) {
      alert("You must be on a quest to seek guidance!");
      return;
    }

    // Check cost
    if (!onDeductGold(cost)) {
      alert(`Not enough gold! You need ${cost}g.`);
      return;
    }

    setViewState('LOADING');
    setResultTitle(title);

    const inputs = {
      type,
      questTitle: currentQuest.title,
      questBriefing: currentQuest.mission_briefing,
      userCode: code
    };

    const response = await getAiAssistance(inputs);

    if (response.error) {
      setResultContent(`**The spirits are confused:** ${response.error}`);
    } else {
      setResultContent(response.content);
    }
    setViewState('RESULT');
  };

  const handleClose = () => {
    setIsOpen(false);
    setViewState('MENU');
    setResultContent('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9999] w-10 h-10 bg-black border-2 border-white flex items-center justify-center hover:bg-stone-900 transition-all rounded-sm shadow-[4px_4px_0_rgba(255,255,255,0.5)] active:translate-y-1 active:shadow-none"
        title="Dungeon Guide"
      >
        <HelpCircle className="w-5 h-5 text-white" />
      </button>
    );
  }

  // Common Dialog Container
  const DialogContainer = ({ children, title, onClose }: { children: React.ReactNode, title: string, onClose: () => void }) => (
    <div className="fixed bottom-4 left-4 z-[9999] bg-black border-4 border-white p-6 shadow-[8px_8px_0_rgba(255,255,255,0.3)] animate-in slide-in-from-bottom-2 duration-300 w-96 md:w-[32rem] font-pixel max-h-[85vh] flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b-2 border-stone-800 pb-3">
        <span className="text-white text-lg tracking-widest uppercase truncate pr-4 text-shadow-sm">{title}</span>
        <button onClick={onClose} className="hover:text-red-400 transition-colors p-1">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>
      {children}
    </div>
  );

  if (viewState === 'LOADING') {
    return (
      <DialogContainer title="CONSULTING SPIRITS..." onClose={handleClose}>
        <div className="flex flex-col items-center justify-center py-12 gap-6">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
          <p className="text-stone-300 text-sm text-center font-retro animate-pulse tracking-wide">
            The Oracle is deciphering your runes...
          </p>
        </div>
      </DialogContainer>
    )
  }

  if (viewState === 'RESULT') {
    return (
      <DialogContainer title={resultTitle} onClose={handleClose}>
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar font-retro text-base text-stone-300 space-y-4 leading-relaxed">
          <Markdown
            components={{
              code(props) {
                const { children, className, ...rest } = props
                return <code className={`bg-stone-900 px-1.5 py-0.5 rounded text-yellow-300 font-mono text-sm ${className}`} {...rest}>{children}</code>
              },
              pre(props) {
                return <pre className="bg-stone-900/80 p-4 rounded-sm overflow-x-auto border border-stone-700 my-4 text-sm font-mono shadow-inner" {...props} />
              },
              h1: ({ node, ...props }) => <h1 className="text-xl text-white font-bold mb-2 mt-4" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-lg text-white font-bold mb-2 mt-3" {...props} />,
              p: ({ node, ...props }) => <p className="mb-2" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
            }}
          >
            {resultContent}
          </Markdown>
        </div>
        <div className="mt-6 pt-4 border-t border-stone-800">
          <Button
            onClick={handleClose}
            className="w-full bg-white text-black hover:bg-stone-300 font-pixel text-lg py-6 rounded-none shadow-sm transition-all active:scale-[0.98]"
          >
            RETURN TO DUNGEON
          </Button>
        </div>
      </DialogContainer>
    )
  }

  // MENU State
  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-black border-4 border-white p-6 shadow-[8px_8px_0_rgba(255,255,255,0.3)] animate-in slide-in-from-bottom-2 duration-300 w-80 md:w-96 font-pixel">
      <div className="flex justify-between items-center mb-6 border-b-2 border-stone-800 pb-3">
        <span className="text-white text-lg tracking-widest text-shadow-sm">GUIDE.EXE</span>
        <button
          onClick={handleClose}
          className="hover:text-red-400 transition-colors p-1"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <Button
          variant="outline"
          className="justify-start gap-3 bg-black text-white border-2 border-white hover:bg-white hover:text-black transition-all font-retro text-sm h-auto py-4 px-4 rounded-none group relative overflow-hidden"
          onClick={() => handleAssistance('ERROR_CHECK', 100, "ERROR ANALYSIS")}
        >
          <div className="bg-red-900/50 p-2 group-hover:bg-red-500/20 rounded-sm transition-colors"><Bug className="w-5 h-5" /></div>
          <div className="flex flex-col items-start gap-1">
            <span className="font-bold tracking-wide">WHERE'S MY ERROR</span>
            <span className="text-xs text-stone-500 group-hover:text-stone-700 font-mono">Cost: 100g</span>
          </div>
        </Button>
        <Button
          variant="outline"
          className="justify-start gap-3 bg-black text-white border-2 border-white hover:bg-white hover:text-black transition-all font-retro text-sm h-auto py-4 px-4 rounded-none group relative overflow-hidden"
          onClick={() => handleAssistance('LOGIC_HINT', 300, "LOGIC & HINTS")}
        >
          <div className="bg-blue-900/50 p-2 group-hover:bg-blue-500/20 rounded-sm transition-colors"><Brain className="w-5 h-5" /></div>
          <div className="flex flex-col items-start gap-1">
            <span className="font-bold tracking-wide">WHAT'S THE LOGIC</span>
            <span className="text-xs text-stone-500 group-hover:text-stone-700 font-mono">Cost: 300g</span>
          </div>
        </Button>
        <Button
          variant="outline"
          className="justify-start gap-3 bg-black text-white border-2 border-white hover:bg-white hover:text-black transition-all font-retro text-sm h-auto py-4 px-4 rounded-none group relative overflow-hidden"
          onClick={() => handleAssistance('FULL_SOLUTION', 500, "ARCANE REVELATION")}
        >
          <div className="bg-purple-900/50 p-2 group-hover:bg-purple-500/20 rounded-sm transition-colors"><BookOpen className="w-5 h-5" /></div>
          <div className="flex flex-col items-start gap-1">
            <span className="font-bold tracking-wide">EXPLAIN EVERYTHING</span>
            <span className="text-xs text-stone-500 group-hover:text-stone-700 font-mono">Cost: 500g</span>
          </div>
        </Button>
      </div>

      <div className="mt-4 text-xs text-stone-500 text-center font-mono opacity-80">
        AI-POWERED ASSISTANT
      </div>
    </div>
  );
}
