import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, X, Send, Loader2, Database, AlertTriangle } from 'lucide-react';

import { ColorOrb } from '@/components/ui/ai-input';
import { Button } from '@/components/ui/button';
import { post, get } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: Array<{ name: string; input: unknown; result?: unknown; error?: string }>;
};

const MAX_HISTORY = 20;

const AdminAiChat: React.FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);

  // Lightweight config check on mount so the widget can gracefully hide
  // itself if the assistant hasn't been configured yet.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await get('/admin/ai/config');
        if (!cancelled && res.success) {
          setEnabled(Boolean(res.data.enabled));
          setHasKey(Boolean(res.data.hasApiKey));
          setModel(res.data.model ?? null);
        } else if (!cancelled) {
          setEnabled(false);
        }
      } catch {
        if (!cancelled) setEnabled(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => textareaRef.current?.focus(), 30);
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages, sending]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending) return;
    const next: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setDraft('');
    setSending(true);
    try {
      const history = next.slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content }));
      const res = await post('/admin/ai/chat', { messages: history });
      if (res.success) {
        const reply: Message = {
          role: 'assistant',
          content: res.data.message || '(No response)',
          toolCalls: res.data.toolCalls,
        };
        setMessages((prev) => [...prev, reply]);
      } else {
        toast.error(res.message || 'AI request failed');
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `(error: ${res.message ?? 'unknown'})` },
        ]);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'AI request failed';
      toast.error(msg);
      setMessages((prev) => [...prev, { role: 'assistant', content: `(error: ${msg})` }]);
    } finally {
      setSending(false);
      setTimeout(() => textareaRef.current?.focus(), 30);
    }
  }, [draft, messages, sending]);

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  // Hide widget entirely if the admin hasn't turned it on yet.
  if (enabled === false) return null;
  if (enabled === null) return null;

  const disabled = !hasKey;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            ref={panelRef}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.7 }}
            className={cn(
              'pointer-events-auto w-[380px] max-w-[calc(100vw-2.5rem)] max-h-[70vh]',
              'bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800',
              'flex flex-col overflow-hidden',
            )}
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2 min-w-0">
                <ColorOrb dimension="22px" tones={{ base: 'oklch(22.64% 0 0)' }} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-black dark:text-white truncate">
                    Admin assistant
                  </p>
                  <p className="text-[10px] text-neutral-400 truncate flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    {model ?? 'claude'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollerRef}
              className="flex-1 overflow-y-auto px-3 py-3 space-y-3 text-sm"
            >
              {messages.length === 0 && !sending && (
                <div className="text-center text-xs text-neutral-400 dark:text-neutral-500 py-6 space-y-2">
                  <p>Ask about users, bookings, revenue, audit events — anything in the whitelisted tables.</p>
                  <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                    {[
                      'How many users signed up this week?',
                      'Top 5 freelancers by bookings',
                      'Recent contact messages',
                      'Unread admin audit events today',
                    ].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setDraft(q)}
                        className="px-2 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-[11px] text-neutral-500"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {disabled && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-[11px] p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  No Anthropic API key configured. Add one on the{' '}
                  <a href="/admin/ai" className="underline font-medium">AI assistant</a> page to enable chat.
                </div>
              )}

              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}
              {sending && (
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Thinking…
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="shrink-0 border-t border-neutral-100 dark:border-neutral-800 p-2">
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={disabled ? 'Configure an API key first…' : 'Ask the assistant…'}
                  disabled={disabled || sending}
                  className="flex-1 resize-none max-h-28 text-sm bg-transparent rounded-xl px-3 py-2 outline-none text-black dark:text-white placeholder:text-neutral-400 disabled:opacity-50"
                />
                <Button
                  size="sm"
                  className="rounded-full h-9 w-9 p-0 shrink-0"
                  onClick={sendMessage}
                  disabled={disabled || sending || !draft.trim()}
                  aria-label="Send"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-neutral-400 mt-1 px-2">
                Press Enter to send · Shift+Enter for newline
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'pointer-events-auto flex items-center gap-2 rounded-full shadow-xl border',
          'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white',
          'px-4 h-11 hover:scale-[1.02] active:scale-[0.98] transition-transform',
        )}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        animate={{ width: open ? 44 : 'auto' }}
        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
      >
        {open ? (
          <Sparkles className="h-4 w-4 shrink-0" />
        ) : (
          <>
            <ColorOrb dimension="22px" tones={{ base: 'oklch(22.64% 0 0)' }} />
            <span className="text-sm font-medium">Ask AI</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap break-words',
          isUser
            ? 'bg-black text-white dark:bg-white dark:text-black'
            : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100',
        )}
      >
        {message.content}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/10 dark:border-black/10 space-y-1">
            {message.toolCalls.map((tc, i) => (
              <details key={i} className="text-[10px] opacity-80">
                <summary className="cursor-pointer font-mono inline-flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  {tc.name}
                  {tc.error ? ' · error' : ''}
                </summary>
                <pre className="mt-1 whitespace-pre-wrap font-mono opacity-75 text-[10px]">
                  {JSON.stringify(tc.input, null, 2)}
                </pre>
                {tc.error && <p className="text-red-300 font-mono">{tc.error}</p>}
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAiChat;
