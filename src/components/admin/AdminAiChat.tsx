import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, X, Send, Loader2, Database, AlertTriangle, Trash2 } from 'lucide-react';

import { ColorOrb } from '@/components/ui/ai-input';
import { Button } from '@/components/ui/button';
import { post, get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ToolCallMeta = {
  name: string;
  input: unknown;
  result?: {
    rowCount?: number;
    durationMs?: number;
    warnings?: string[];
  };
  error?: string;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCallMeta[];
  warnings?: string[];
  totalDurationMs?: number;
};

const MAX_HISTORY = 20;

/** Admin chat renders plain text; strip common Markdown so answers stay readable. */
function formatAssistantMessage(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`{3}[\s\S]*?`{3}/g, (block) => block.replace(/^```\w*\n?/, '').replace(/\n?```$/, ''));
}

// Thresholds at which we escalate the "still working" hint shown to the admin
// while the backend is fetching data. These are purely UI feedback;
// the backend has no row cap or timeout.
const SLOW_HINT_MS = 4_000;
const VERY_SLOW_HINT_MS = 15_000;
const EXTREME_HINT_MS = 30_000;

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
  const [elapsedMs, setElapsedMs] = useState(0);

  // Lightweight config check on mount so the widget can gracefully hide
  // itself if the assistant hasn't been configured yet.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await get(ApiPaths.admin.aiConfig);
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

  const clearConversation = useCallback(() => {
    if (sending) return;
    setMessages([]);
    setDraft('');
    setTimeout(() => textareaRef.current?.focus(), 30);
  }, [sending]);

  const sendMessage = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending) return;
    const next: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setDraft('');
    setSending(true);
    setElapsedMs(0);
    const startedAt = Date.now();
    const tick = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 500);
    try {
      const history = next.slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content }));
      const res = await post(ApiPaths.admin.aiChat, { messages: history });
      if (res.success) {
        const reply: Message = {
          role: 'assistant',
          content: res.data.message || '(No response)',
          toolCalls: res.data.toolCalls,
          warnings: Array.isArray(res.data.warnings) ? res.data.warnings : undefined,
          totalDurationMs: typeof res.data.totalDurationMs === 'number'
            ? res.data.totalDurationMs
            : undefined,
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
      window.clearInterval(tick);
      setSending(false);
      setElapsedMs(0);
      setTimeout(() => textareaRef.current?.focus(), 30);
    }
  }, [draft, messages, sending]);

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      clearConversation();
      return;
    }
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
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={clearConversation}
                  disabled={sending || (messages.length === 0 && !draft.trim())}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Clear conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollerRef}
              className="flex-1 overflow-y-auto px-3 py-3 space-y-3 text-sm"
            >
              {messages.length === 0 && !sending && (
                <div className="text-center text-xs text-neutral-400 dark:text-neutral-500 py-6 space-y-2">
                  <p>Ask about users, bookings, revenue, audit events, and other operational data the assistant can access.</p>
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
              {sending && <ThinkingIndicator elapsedMs={elapsedMs} />}
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
              <p className="text-[10px] text-neutral-400 mt-1 px-2 leading-snug">
                Press Enter to send · Shift+Enter for newline
                <br />
                Ctrl+Shift+L or Cmd+Shift+L clears the conversation
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

function ThinkingIndicator({ elapsedMs }: { elapsedMs: number }) {
  const seconds = Math.floor(elapsedMs / 1000);
  const label = elapsedMs >= EXTREME_HINT_MS
    ? `Still working through a large amount of data (${seconds}s) — please hang on…`
    : elapsedMs >= VERY_SLOW_HINT_MS
      ? `Still fetching (${seconds}s) — gathering a lot of detail…`
      : elapsedMs >= SLOW_HINT_MS
        ? `Thinking (${seconds}s) — a bit longer for a large answer.`
        : 'Thinking…';

  const severe = elapsedMs >= VERY_SLOW_HINT_MS;

  return (
    <div
      className={cn(
        'flex items-start gap-2 text-xs rounded-xl px-3 py-2 border',
        severe
          ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900/40'
          : 'bg-neutral-50 text-neutral-500 border-neutral-100 dark:bg-neutral-800/50 dark:text-neutral-400 dark:border-neutral-800',
      )}
    >
      {severe ? (
        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      ) : (
        <Loader2 className="h-3 w-3 mt-0.5 shrink-0 animate-spin" />
      )}
      <span className="leading-snug">{label}</span>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const warnings = message.warnings ?? [];
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
        {isUser ? message.content : formatAssistantMessage(message.content)}

        {!isUser && warnings.length > 0 && (
          <div className="mt-2 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 p-2 space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide">
              <AlertTriangle className="h-3 w-3" />
              Warnings
            </div>
            <ul className="text-[11px] leading-snug list-disc pl-4">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/10 dark:border-black/10 space-y-1">
            {message.toolCalls.map((tc, i) => {
              const rowCount = tc.result?.rowCount;
              const durationMs = tc.result?.durationMs;
              return (
                <details key={i} className="text-[10px] opacity-80">
                  <summary className="cursor-pointer font-mono inline-flex items-center gap-1 flex-wrap">
                    <Database className="h-3 w-3" />
                    {tc.name === 'run_sql' ? 'Data lookup' : tc.name}
                    {tc.error
                      ? ' · error'
                      : (
                        <span className="opacity-70">
                          {typeof rowCount === 'number' ? ` · ${rowCount.toLocaleString()} records` : ''}
                          {typeof durationMs === 'number' ? ` · ${durationMs}ms` : ''}
                        </span>
                      )}
                  </summary>
                  {tc.name === 'run_sql' ? (
                    tc.error ? null : (
                      <p className="mt-1 text-[10px] opacity-75 leading-snug">
                        {typeof rowCount === 'number' && typeof durationMs === 'number'
                          ? `Retrieved ${rowCount.toLocaleString()} record${rowCount === 1 ? '' : 's'} in ${durationMs} ms.`
                          : 'Data lookup completed.'}
                      </p>
                    )
                  ) : (
                    <pre className="mt-1 whitespace-pre-wrap font-mono opacity-75 text-[10px]">
                      {JSON.stringify(tc.input, null, 2)}
                    </pre>
                  )}
                  {tc.error && <p className="text-red-300 font-mono">{tc.error}</p>}
                </details>
              );
            })}
          </div>
        )}

        {!isUser && typeof message.totalDurationMs === 'number' && message.totalDurationMs >= SLOW_HINT_MS && (
          <p className="mt-1.5 text-[10px] opacity-60">
            Took {(message.totalDurationMs / 1000).toFixed(1)}s
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminAiChat;
