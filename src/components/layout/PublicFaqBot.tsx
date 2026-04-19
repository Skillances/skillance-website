import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ChevronRight, MessageCircleQuestion, RotateCcw, X } from 'lucide-react';

import { ColorOrb } from '@/components/ui/ai-input';
import { cn } from '@/lib/utils';
import { PUBLIC_FAQ, findNodeById, type FaqNode } from '@/data/publicFaq';

// Each turn in the visible transcript is either the user picking something
// (shown as a right-aligned chip) or the bot replying (left-aligned bubble).
type Turn =
  | { kind: 'choice'; id: string; label: string }
  | { kind: 'reply'; id: string; text: string };

// Conversational glue so branch picks still feel like an answer, not a silent
// tree walk. One of these is chosen at random when the user descends into a
// branch (not a leaf).
const BRANCH_REPLIES = [
  'Got it — here are some questions I can answer about {label}:',
  'Happy to help with {label}. Which of these fits best?',
  'Sure. Here\u2019s what most people ask about {label}:',
  'Good choice. Pick one below and I\u2019ll give you the full answer.',
];

const EXHAUSTED_REPLY =
  'That\u2019s everything I have for this topic. Want to go back one step or start over?';

function randomReply(label: string): string {
  const template = BRANCH_REPLIES[Math.floor(Math.random() * BRANCH_REPLIES.length)];
  return template.replace('{label}', label);
}

// Simulated thinking window. Small enough to stay snappy, large enough to
// register as a real response rather than an instant flip.
function thinkingDelayMs() {
  return 420 + Math.random() * 380;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const PublicFaqBot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<string[]>(['root']);
  const [history, setHistory] = useState<Turn[]>([]);
  const [thinking, setThinking] = useState(false);
  const [pickedIds, setPickedIds] = useState<Set<string>>(new Set());
  const scrollerRef = useRef<HTMLDivElement>(null);
  // Freshest value inside async callbacks (avoids stale closures).
  const busyRef = useRef(false);

  const currentId = path[path.length - 1];
  const current: FaqNode = findNodeById(currentId) ?? PUBLIC_FAQ;

  // Auto-scroll to bottom whenever anything visible changes.
  useEffect(() => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [history, currentId, thinking, open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // ---------------------------------------------------------------------------
  // Core interaction: pick a question
  // ---------------------------------------------------------------------------
  const pickChild = useCallback(async (child: FaqNode) => {
    if (busyRef.current) return;
    busyRef.current = true;

    // 1. Show the user's chosen question immediately as a right-aligned chip.
    setHistory((prev) => [...prev, { kind: 'choice', id: child.id, label: child.label }]);
    setPickedIds((prev) => {
      const next = new Set(prev);
      next.add(child.id);
      return next;
    });

    // 2. Enter the "typing" state so the user sees the bot is responding.
    setThinking(true);
    await sleep(thinkingDelayMs());
    setThinking(false);

    // 3. Deliver the reply.
    if (child.kind === 'leaf') {
      setHistory((prev) => [
        ...prev,
        { kind: 'reply', id: `${child.id}-a`, text: child.answer },
      ]);
    } else {
      setHistory((prev) => [
        ...prev,
        { kind: 'reply', id: `${child.id}-intro`, text: randomReply(child.label) },
      ]);
      setPath((prev) => [...prev, child.id]);
    }

    busyRef.current = false;
  }, []);

  const goBack = useCallback(() => {
    if (busyRef.current) return;
    if (path.length <= 1) return;
    setPath((prev) => prev.slice(0, -1));
  }, [path.length]);

  const reset = useCallback(() => {
    if (busyRef.current) return;
    setPath(['root']);
    setHistory([]);
    setPickedIds(new Set());
  }, []);

  // Choices visible right now: children of the current branch, minus anything
  // the user already picked (at any level) so questions "fall away" once used.
  // Still enforces the "max 5 at a time" product rule.
  const choices: FaqNode[] = useMemo(() => {
    if (current.kind !== 'branch') return [];
    return current.children.filter((c) => !pickedIds.has(c.id)).slice(0, 5);
  }, [current, pickedIds]);

  const isAtRoot = path.length === 1;
  const exhausted = current.kind === 'branch' && choices.length === 0 && !thinking;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence>
        {open && (
          <motion.div
            key="faq-panel"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.7 }}
            className={cn(
              'pointer-events-auto w-[380px] max-w-[calc(100vw-2.5rem)] max-h-[72vh]',
              'bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800',
              'flex flex-col overflow-hidden',
            )}
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2 min-w-0">
                <ColorOrb
                  dimension="22px"
                  tones={{
                    base: 'oklch(22.64% 0 0)',
                    accent1: 'oklch(75% 0.18 25)',
                    accent2: 'oklch(80% 0.12 200)',
                    accent3: 'oklch(78% 0.14 280)',
                  }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-black dark:text-white truncate">
                    Skillance help
                  </p>
                  <p className="text-[10px] text-neutral-400 truncate">
                    {thinking ? 'typing\u2026' : 'Guided FAQ'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {(!isAtRoot || history.length > 0) && (
                  <button
                    type="button"
                    onClick={reset}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    aria-label="Start over"
                    title="Start over"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
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

            {/* Conversation */}
            <div ref={scrollerRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 text-sm">
              <BotBubble id="intro">
                Hi! I can answer common questions about Skillance. Pick a topic and
                I&rsquo;ll guide you to the right answer.
              </BotBubble>

              <AnimatePresence initial={false}>
                {history.map((turn) =>
                  turn.kind === 'choice' ? (
                    <UserBubble key={turn.id} id={turn.id}>
                      {turn.label}
                    </UserBubble>
                  ) : (
                    <BotBubble key={turn.id} id={turn.id}>
                      {turn.text}
                    </BotBubble>
                  ),
                )}
              </AnimatePresence>

              {thinking && <TypingBubble />}

              {!thinking && exhausted && (
                <BotBubble id="exhausted">{EXHAUSTED_REPLY}</BotBubble>
              )}

              {!thinking && choices.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-1.5 pt-1"
                >
                  {choices.map((child, i) => (
                    <motion.button
                      key={child.id}
                      type="button"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * i, duration: 0.2 }}
                      onClick={() => pickChild(child)}
                      className="group w-full flex items-center justify-between gap-2 text-left text-[13px] px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-black dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <span className="text-black dark:text-white">{child.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Footer nav */}
            <div className="shrink-0 border-t border-neutral-100 dark:border-neutral-800 px-3 py-2 flex items-center justify-between text-xs text-neutral-500">
              <button
                type="button"
                onClick={goBack}
                disabled={isAtRoot || thinking}
                className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <ArrowLeft className="h-3 w-3" />
                Back
              </button>
              <a
                href="/contact"
                className="px-2 py-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Still stuck? Contact us &rarr;
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'pointer-events-auto flex items-center gap-2 rounded-full shadow-xl border',
          'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white',
          'px-4 h-11 hover:scale-[1.02] active:scale-[0.98] transition-transform',
        )}
        aria-label={open ? 'Close help' : 'Open help'}
        animate={{ width: open ? 44 : 'auto' }}
        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
      >
        {open ? (
          <MessageCircleQuestion className="h-4 w-4 shrink-0" />
        ) : (
          <>
            <ColorOrb
              dimension="22px"
              tones={{
                base: 'oklch(22.64% 0 0)',
                accent1: 'oklch(75% 0.18 25)',
                accent2: 'oklch(80% 0.12 200)',
                accent3: 'oklch(78% 0.14 280)',
              }}
            />
            <span className="text-sm font-medium">Help</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

function BotBubble({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <motion.div
      key={id}
      layout
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 500, damping: 38, mass: 0.6 }}
      className="flex justify-start"
    >
      <div className="max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 whitespace-pre-wrap break-words">
        {children}
      </div>
    </motion.div>
  );
}

function UserBubble({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <motion.div
      key={id}
      layout
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 500, damping: 38, mass: 0.6 }}
      className="flex justify-end"
    >
      <div className="max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed bg-black text-white dark:bg-white dark:text-black whitespace-pre-wrap break-words">
        {children}
      </div>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <motion.div
      key="typing"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="flex justify-start"
      aria-live="polite"
      aria-label="Assistant is typing"
    >
      <div className="rounded-2xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500"
              animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.12,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default PublicFaqBot;
