import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ChevronRight, MessageCircleQuestion, RotateCcw, X } from 'lucide-react';

import { ColorOrb } from '@/components/ui/ai-input';
import { cn } from '@/lib/utils';
import { PUBLIC_FAQ, findNodeById, type FaqNode } from '@/data/publicFaq';

type Turn =
  | { kind: 'choice'; nodeId: string; label: string }
  | { kind: 'answer'; nodeId: string; label: string; answer: string };

const PublicFaqBot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<string[]>(['root']);
  const [history, setHistory] = useState<Turn[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const currentId = path[path.length - 1];
  const current: FaqNode = (findNodeById(currentId) ?? PUBLIC_FAQ);

  useEffect(() => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [history, currentId]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const pickChild = useCallback((child: FaqNode) => {
    if (child.kind === 'leaf') {
      setHistory((prev) => [
        ...prev,
        { kind: 'choice', nodeId: child.id, label: child.label },
        { kind: 'answer', nodeId: child.id, label: child.label, answer: child.answer },
      ]);
    } else {
      setHistory((prev) => [...prev, { kind: 'choice', nodeId: child.id, label: child.label }]);
      setPath((prev) => [...prev, child.id]);
    }
  }, []);

  const goBack = useCallback(() => {
    if (path.length <= 1) return;
    setPath((prev) => prev.slice(0, -1));
  }, [path.length]);

  const reset = useCallback(() => {
    setPath(['root']);
    setHistory([]);
  }, []);

  const isAtRoot = path.length === 1;
  const choices: FaqNode[] = current.kind === 'branch' ? current.children.slice(0, 5) : [];

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
                    Guided FAQ — pick a topic below
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!isAtRoot && (
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
              {/* Intro */}
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
                  Hi! I can answer common questions about Skillance. Pick a topic and I\'ll guide you to the right answer.
                </div>
              </div>

              {history.map((turn, i) => (
                <div
                  key={`${turn.nodeId}-${i}`}
                  className={cn('flex', turn.kind === 'choice' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap break-words',
                      turn.kind === 'choice'
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100',
                    )}
                  >
                    {turn.kind === 'choice' ? turn.label : turn.answer}
                  </div>
                </div>
              ))}

              {current.kind === 'branch' && choices.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <p className="text-[11px] uppercase tracking-wider text-neutral-400 px-1 pb-1">
                    {current.label}
                  </p>
                  {choices.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => pickChild(child)}
                      className="group w-full flex items-center justify-between gap-2 text-left text-[13px] px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-black dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <span className="text-black dark:text-white">{child.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer nav */}
            <div className="shrink-0 border-t border-neutral-100 dark:border-neutral-800 px-3 py-2 flex items-center justify-between text-xs text-neutral-500">
              <button
                type="button"
                onClick={goBack}
                disabled={isAtRoot}
                className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <ArrowLeft className="h-3 w-3" />
                Back
              </button>
              <a
                href="/contact"
                className="px-2 py-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Still stuck? Contact us →
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

export default PublicFaqBot;
