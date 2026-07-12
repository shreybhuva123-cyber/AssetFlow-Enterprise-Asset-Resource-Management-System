'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { notify } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';

export function AIAssistantModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Hi! I am the AssetFlow AI Assistant. How can I help you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!query.trim()) return;
    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg })
      });
      if (!res.ok) throw new Error('Failed to get response');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch {
      notify.error('AI Assistant is currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 shadow-2xl rounded-2xl overflow-hidden bg-background border border-border flex flex-col h-[500px] max-h-[80vh]">
      <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <button onClick={onClose} className="hover:bg-primary-foreground/20 p-1 rounded-md transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
              m.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"
            )}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex gap-1">
              <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce delay-75" />
              <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 bg-background border-t">
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask about assets..."
            className="flex-1 rounded-full"
          />
          <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={loading || !query.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
