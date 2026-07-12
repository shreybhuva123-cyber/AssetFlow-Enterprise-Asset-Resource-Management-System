'use client';

import { useState } from 'react';
import { Bot } from 'lucide-react';
import { AIAssistantModal } from './ai-assistant-modal';

export function AIFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}
      <AIAssistantModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
