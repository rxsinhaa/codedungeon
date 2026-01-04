'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { editor } from 'monaco-editor';
import { useTheme } from 'next-themes';

const Editor = dynamic(
  () => import('@monaco-editor/react').then(mod => mod.Editor),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full bg-parchment-dark" />,
  }
);

interface MonacoEditorProps {
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
}

const defineParchmentTheme = (monaco: any) => {
  monaco.editor.defineTheme('parchment-scroll', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '9333ea', fontStyle: 'bold' },
      { token: 'identifier', foreground: '2563eb' },
      { token: 'string', foreground: '166534' },
      { token: 'number', foreground: 'dc2626' },
      { token: 'comment', foreground: '9ca3af', fontStyle: 'italic' },
      { token: 'operator', foreground: 'd97706', fontStyle: 'bold' },
    ],
    colors: {
      'editor.background': '#f4e7c3',
      'editor.foreground': '#4a280b',
      'editorCursor.foreground': '#3b82f6',
      'editor.selectionBackground': '#e5b08366',
      'editor.lineHighlightBackground': '#e0d2a8',
      'editorLineNumber.foreground': '#a3642e99',
      'editorLineNumber.activeForeground': '#a3642e',
    }
  });
};

export default function MonacoEditor({
  editorRef,
  language,
  value,
  onChange
}: MonacoEditorProps) {
  
  const handleEditorDidMount = (editorInstance: editor.IStandaloneCodeEditor, monaco: any) => {
    (editorRef as React.MutableRefObject<any>).current = editorInstance;
    defineParchmentTheme(monaco);
    monaco.editor.setTheme('parchment-scroll');
  };

  return (
    <div className="flex-1 relative">
      <Editor
        onMount={handleEditorDidMount}
        language={language}
        value={value}
        onChange={onChange}
        theme="parchment-scroll"
        options={{
          fontFamily: "'VT323', monospace",
          fontSize: 22,
          lineHeight: 32,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          wordWrap: 'on',
          overviewRulerLanes: 0,
          scrollbar: {
            verticalScrollbarSize: 18,
            horizontalScrollbarSize: 18,
          },
        }}
      />
    </div>
  );
}
