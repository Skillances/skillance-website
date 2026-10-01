import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowUp, Check, CheckCheck, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { patch, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import { MkAvatar, MkButton, MkErrorState, MkSkeleton } from '@/components/marketplace/ui';
import { apiErrorMessage, unwrap } from '@/lib/marketplace/apiHelpers';
import { bookingKeys, fetchBooking, otherParty, roleInBooking } from '@/lib/marketplace/bookings';
import { chatKeys, fetchChats, fetchMessages, useChatRealtime, type ChatMessage } from '@/lib/marketplace/chatRealtime';
import { formatClock, formatDate } from '@/lib/marketplace/time';
import { mkMotion } from '@/lib/marketplace/theme';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

const PAGE = 30;

function mergeById(a: ChatMessage[], b: ChatMessage[]): ChatMessage[] {
  const map = new Map<string, ChatMessage>();
  for (const m of [...a, ...b]) map.set(m.id, { ...map.get(m.id), ...m });
  return [...map.values()].sort((x, y) => x.createdAt.localeCompare(y.createdAt));
}

export default function ChatThreadPage() {
  const { chatId = '' } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const reduced = usePrefersReducedMotion();

  const chats = useQuery({ queryKey: chatKeys.list, queryFn: fetchChats });
  const chat = chats.data?.find((c) => c.id === chatId);
  const booking = useQuery({
    queryKey: bookingKeys.detail(chat?.bookingId ?? ''),
    enabled: !!chat?.bookingId,
    queryFn: () => fetchBooking(chat!.bookingId!),
  });
  const role = booking.data ? roleInBooking(booking.data, user) : null;
  const who = booking.data ? otherParty(booking.data, role) : { name: 'Conversation', photo: null };

  const first = useQuery({ queryKey: chatKeys.messages(chatId), queryFn: () => fetchMessages(chatId, PAGE), refetchOnWindowFocus: false });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [seeded, setSeeded] = useState<typeof first.data | null>(null);
  const [text, setText] = useState('');

  // Seed from the first page whenever it (re)loads; adjusting state during render avoids an effect cascade.
  if (first.data && first.data !== seeded) {
    setSeeded(first.data);
    setMessages((cur) => mergeById(cur.filter((m) => m.pending || m.failed), first.data!.messages));
    setCursor(first.data.nextCursor);
    setHasMore(first.data.hasMore);
  }

  const scroller = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const prevHeight = useRef<number | null>(null);

  const markRead = useCallback(() => {
    void patch(ApiPaths.marketplace.chatRead(chatId), {})
      .then(() => qc.invalidateQueries({ queryKey: chatKeys.preview(chatId) }))
      .catch(() => {});
  }, [chatId, qc]);

  useEffect(() => {
    markRead();
  }, [markRead]);

  useChatRealtime(chatId, {
    onMessage: (m) => {
      setMessages((cur) => mergeById(cur.filter((x) => !(x.pending && x.senderId === m.senderId && x.content === m.content)), [m]));
      if (m.senderId !== user?.id) markRead();
    },
    onRead: (readBy) => {
      if (readBy !== user?.id) setMessages((cur) => cur.map((m) => (m.senderId === user?.id ? { ...m, isRead: true } : m)));
    },
  });

  // Keep the newest message in view unless the user scrolled up; keep position when older messages load.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (prevHeight.current != null) {
      el.scrollTop = el.scrollHeight - prevHeight.current;
      prevHeight.current = null;
    } else if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const loadOlder = async () => {
    if (!cursor || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const page = await fetchMessages(chatId, PAGE, cursor);
      prevHeight.current = scroller.current?.scrollHeight ?? null;
      setMessages((cur) => mergeById(page.messages, cur));
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not load earlier messages.'));
    } finally {
      setLoadingOlder(false);
    }
  };

  const send = async (content: string, retryId?: string) => {
    const tempId = retryId ?? `temp-${crypto.randomUUID()}`;
    const temp: ChatMessage = { id: tempId, senderId: user?.id ?? '', content, type: 'text', createdAt: new Date().toISOString(), pending: true };
    stickToBottom.current = true;
    setMessages((cur) => mergeById(cur.filter((m) => m.id !== tempId), [temp]));
    try {
      const res = await post(ApiPaths.marketplace.chatMessages(chatId), {
        content,
        type: 'text',
        ...(chat?.bookingId ? { bookingId: chat.bookingId } : {}),
      });
      const saved = unwrap<ChatMessage>(res);
      setMessages((cur) => mergeById(cur.filter((m) => m.id !== tempId), saved?.id ? [saved] : []));
      if (typeof res?.warning === 'string' && res.warning) toast.warning(res.warning);
      void qc.invalidateQueries({ queryKey: chatKeys.preview(chatId) });
    } catch (err) {
      setMessages((cur) => cur.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m)));
      toast.error(apiErrorMessage(err, 'Message not sent.'));
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setText('');
    void send(content.slice(0, 5000));
  };

  return (
    <div className="-mb-[calc(88px+env(safe-area-inset-bottom))] -mt-5 flex h-[calc(100dvh-56px-60px-env(safe-area-inset-bottom))] flex-col lg:-mb-12 lg:-mt-8 lg:h-[100dvh]">
      <header className="flex items-center gap-3 border-b border-mk-divider py-2.5">
        <Link to="/chats" aria-label="Back to chats" className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-mk-muted">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <MkAvatar src={who.photo} name={who.name} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-mk-display text-[15px] font-semibold">{who.name}</p>
          {chat?.bookingId && (
            <Link to={`/bookings/${chat.bookingId}`} className="text-[12px] text-mk-text-secondary underline-offset-2 hover:underline">
              View booking
            </Link>
          )}
        </div>
      </header>

      <div
        ref={scroller}
        className="mk-scroll flex-1 py-4"
        data-lenis-prevent
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        role="log"
        aria-live="polite"
        aria-label={`Messages with ${who.name}`}
      >
        {first.isPending ? (
          <div className="space-y-3" role="status" aria-label="Loading messages">
            <MkSkeleton className="h-10 w-2/3 rounded-2xl" />
            <MkSkeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
            <MkSkeleton className="h-10 w-3/5 rounded-2xl" />
          </div>
        ) : first.isError ? (
          <MkErrorState message={apiErrorMessage(first.error, 'Messages could not be loaded.')} onRetry={() => void first.refetch()} retrying={first.isRefetching} />
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-mk-text-secondary">No messages yet. Say hello and confirm the details of your booking.</p>
        ) : (
          <>
            {hasMore && (
              <div className="mb-3 flex justify-center">
                <MkButton variant="ghost" size="sm" loading={loadingOlder} onClick={() => void loadOlder()}>
                  Load earlier messages
                </MkButton>
              </div>
            )}
            <ul className="space-y-1.5">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => {
                  const mine = m.senderId === user?.id;
                  const day = m.createdAt.slice(0, 10);
                  const showDay = i === 0 || messages[i - 1].createdAt.slice(0, 10) !== day;
                  return (
                    <motion.li
                      key={m.id}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                      transition={{ duration: mkMotion.control, ease: mkMotion.ease }}
                    >
                      {showDay && <p className="my-3 text-center text-[12px] text-mk-text-tertiary">{formatDate(day)}</p>}
                      {m.type === 'system' ? (
                        <p className="mx-auto my-2 max-w-sm text-center text-[13px] text-mk-text-secondary">{m.content}</p>
                      ) : (
                        <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                          <div
                            className={cn(
                              'max-w-[78%] rounded-2xl px-3.5 py-2 text-[15px] leading-snug',
                              mine ? 'rounded-br-md bg-mk-primary text-mk-on-primary' : 'rounded-bl-md bg-mk-muted text-mk-text-primary',
                              m.pending && 'opacity-60',
                            )}
                          >
                            {m.type === 'image' && m.imageUrl ? (
                              <img src={m.imageUrl} alt="Shared photo" className="max-h-64 rounded-xl" loading="lazy" />
                            ) : (
                              <p className="whitespace-pre-wrap break-words">{m.content}</p>
                            )}
                            <p className={cn('mt-0.5 flex items-center justify-end gap-1 text-[11px]', mine ? 'opacity-70' : 'text-mk-text-tertiary')}>
                              {m.failed ? 'Not sent' : m.pending ? 'Sending' : formatClock(m.createdAt)}
                              {mine && !m.pending && !m.failed && (m.isRead ? <CheckCheck className="h-3 w-3" aria-label="Read" /> : <Check className="h-3 w-3" aria-label="Sent" />)}
                            </p>
                          </div>
                        </div>
                      )}
                      {m.failed && (
                        <div className="mt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => void send(m.content, m.id)}
                            className="inline-flex min-h-11 items-center gap-1 text-[12px] font-semibold text-mk-error"
                          >
                            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" /> Tap to retry
                          </button>
                        </div>
                      )}
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-mk-divider py-3">
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <textarea
          id="chat-input"
          rows={1}
          value={text}
          maxLength={5000}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
          placeholder="Type a message"
          className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-transparent bg-mk-muted px-4 py-2.5 text-[15px] placeholder:text-mk-text-tertiary focus:border-mk-primary focus:bg-mk-surface focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label="Send message"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mk-primary text-mk-on-primary transition-[opacity,transform] duration-150 active:scale-[0.94] disabled:opacity-40 motion-reduce:active:scale-100"
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
