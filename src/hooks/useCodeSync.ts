'use client';

import { useEffect, useRef } from 'react';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { db, auth, onAuthStateChanged } from '@/lib/firebase';
import type { editor } from 'monaco-editor';

type Editor = editor.IStandaloneCodeEditor;

export const useCodeSync = (roomId: string, editorRef: React.RefObject<Editor | null>, onCodeReceive?: (code: string) => void) => {
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    if (!roomId) return;

    if (!auth.currentUser) return;

    const codeRef = ref(db, `dungeon-sessions/${roomId}/players/${auth.currentUser.uid}/code`);

    const unsubscribe = onValue(codeRef, (snapshot) => {
      const remoteCode = snapshot.val();
      if (!editorRef.current || remoteCode === null) return;

      const currentCode = editorRef.current.getValue();

      if (remoteCode !== currentCode) {
        isRemoteUpdate.current = true;

        const cursorState = editorRef.current.getPosition();
        editorRef.current.setValue(remoteCode);
        if (cursorState) {
          editorRef.current.setPosition(cursorState);
        }

        if (onCodeReceive) {
          onCodeReceive(remoteCode);
        }

        isRemoteUpdate.current = false;
      }
    });

    return () => unsubscribe();
  }, [roomId, editorRef, onCodeReceive]);

  // Presence system
  useEffect(() => {
    let presenceRef: any;
    const authUnsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        presenceRef = ref(db, `dungeon-sessions/${roomId}/partyMembers/${user.uid}`);

        onDisconnect(presenceRef).remove();

        set(presenceRef, {
          name: `Wizard-${user.uid.substring(0, 4)}`,
          online: true,
          lastSeen: serverTimestamp()
        });
      }
    });

    return () => {
      authUnsubscribe();
      if (presenceRef) {
        onDisconnect(presenceRef).cancel();
      }
    };
  }, [roomId]);

  const pushUpdate = (newCode: string) => {
    if (!isRemoteUpdate.current && auth.currentUser) {
      set(ref(db, `dungeon-sessions/${roomId}/players/${auth.currentUser.uid}/code`), newCode);
      set(ref(db, `dungeon-sessions/${roomId}/players/${auth.currentUser.uid}/lastUpdated`), serverTimestamp());
    }
  };

  const setLanguage = (language: string) => {
    set(ref(db, `dungeon-sessions/${roomId}/language`), language);
  };

  return { pushUpdate, setLanguage };
};
