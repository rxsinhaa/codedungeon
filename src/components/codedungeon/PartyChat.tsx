'use client';

import Image from 'next/image';
import type { PartyMember } from './CodeDungeon';
import { useState, useEffect, useRef } from 'react';
import { db, auth } from '@/lib/firebase';
import { ref, onValue, push, serverTimestamp, query, limitToLast, orderByChild } from 'firebase/database';

type PartyChatProps = {
  party: Record<string, PartyMember>;
  roomId: string;
};

type ChatMessage = {
  uid: string;
  name: string;
  message: string;
  timestamp: number;
};

export default function PartyChat({ party, roomId }: PartyChatProps) {
  const onlineCount = Object.values(party).filter(p => p.online).length;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatRef = query(ref(db, `dungeon-sessions/${roomId}/chatMessages`), orderByChild('timestamp'), limitToLast(50));

    const unsubscribe = onValue(chatRef, (snapshot) => {
      const messagesData: Record<string, ChatMessage> = snapshot.val();
      if (messagesData) {
        const messagesList = Object.values(messagesData);
        setMessages(messagesList);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !auth.currentUser) return;

    const chatRef = ref(db, `dungeon-sessions/${roomId}/chatMessages`);
    const user = auth.currentUser;
    const partyMember = party[user.uid];

    push(chatRef, {
      uid: user.uid,
      name: partyMember?.name || `Wizard-${user.uid.substring(0, 4)}`,
      message: newMessage,
      timestamp: serverTimestamp(),
    });

    setNewMessage('');
  };


  return (
    <div className="h-1/3 bg-card border-[4px] border-border shadow-xl flex flex-col transition-colors duration-500">
      <div className="bg-muted p-2 border-b-4 border-border text-foreground font-pixel text-xs flex justify-between items-center transition-colors duration-500">
        <span>PARTY CHAT</span>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-[10px] font-sans font-bold">{onlineCount} Online</span>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 p-3 overflow-y-auto space-y-3 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
        {messages.map((msg, index) => (
          <div key={index} className="flex gap-2 items-start">
            <Image src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${msg.name}`} width={32} height={32} alt={msg.name} className="w-8 h-8 border-2 border-border bg-stone-300" unoptimized />
            <div className={`border p-2 text-sm shadow-sm rounded-r-lg rounded-bl-lg ${auth.currentUser?.uid === msg.uid ? 'bg-blue-50 border-blue-200' : 'bg-white border-wood-300'}`}>
              <span className={`font-bold text-xs block font-pixel ${auth.currentUser?.uid === msg.uid ? 'text-blue-700' : 'text-purple-700'}`}>{msg.name}</span>
              <span className="text-wood-800 font-retro text-lg leading-4">{msg.message}</span>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground italic font-retro text-lg">The tavern is quiet... for now.</div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="p-2 bg-muted border-t-2 border-border transition-colors duration-500">
        <input
          type="text"
          placeholder="Say something..."
          className="w-full bg-background border-2 border-input px-2 py-1 font-retro text-lg outline-none focus:border-primary text-foreground placeholder-muted-foreground"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
      </form>
    </div>
  );
}
