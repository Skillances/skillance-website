import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowUp, Check, CheckCheck, FileText, Loader2, Paperclip, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { patch, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import { MkAvatar, MkButton, MkErrorState, MkSkeleton } from '@/components/marketplace/ui';
import UserSafetyActions from '@/components/marketplace/UserSafetyActions';
import { apiErrorMessage, fileToDataUrl, unwrap } from '@/lib/marketplace/apiHelpers';
import { bookingKeys, fetchBooking, otherParty, otherPartyUserId, roleInBooking } from '@/lib/marketplace/bookings';
import { chatKeys, fetchChats, fetchMessages, useChatRealtime, type ChatMessage } from '@/lib/marketplace/chatRealtime';
import { formatClock, formatDate } from '@/lib/marketplace/time';
import { mkMotion } from '@/lib/marketplace/theme';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

const PAGE = 30;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_PDF_BYTES = 30 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function formatBytes(n?: number | null): string {
  if (!n || n <= 0) return '';
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function mergeById(a: ChatMessage[], b: ChatMessage[]): ChatMessage[] {
  const map = new Map<string, ChatMessage>();
  for (const m of [...a, ...b]) map.set(m.id, { ...map.get(m.id), ...m });
  return [...map.values()].sort((x, y) => x.createdAt.localeCompare(y.createdAt));
}

function FileChip({ m, mine }: { m: ChatMessage; mine: boolean }) {
  const name = m.attachmentName || m.content || 'Attachment';
  const size = formatBytes(m.attachmentSize);
  const body = (
    <>
      {m.pending ? <Loader2 className="h-5 w-5 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <FileText className="h-5 w-5 shrink-0" aria-hidden="true" />}
      <span className="min-w-0">
        <span className="block max-w-[200px] truncate font-semibold">{name}</span>
        <span className="block text-[12px] opacity-70">{m.pending ? 'Uploading' : [size, 'Download'].filter(Boolean).join(' · ')}</span>
      </span>
    </>
  );
  const cls = cn('flex items-center gap-2.5 rounded-xl border px-3 py-2', mine ? 'border-white/30' : 'border-mk-border');
  if (!m.attachmentUrl || m.pending) return <div className={cls}>{body}</div>;
  return (
    <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer" download={name} className={cls}>
      {body}
    </a>
  );
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
  const whoUserId = booking.data ? otherPartyUserId(booking.data, role) : null;
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

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
    onRead: (readBy, readAt) => {
      if (readBy === user?.id) return;
      const at = readAt ?? new Date().toISOString();
      setMessages((cur) => cur.map((m) => (m.senderId === user?.id && !m.isRead && !m.pending ? { ...m, isRead: true, readAt: m.readAt ?? at } : m)));
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

  const sendAttachment = async (file: File) => {
    const isPdf = file.type === 'application/pdf';
    const isImage = IMAGE_TYPES.includes(file.type);
    if (!isPdf && !isImage) {
      toast.error('Attach an image (JPG, PNG, WebP, GIF) or a PDF.');
      return;
    }
    if (isImage && file.size > MAX_IMAGE_BYTES) {
      toast.error('Images must be 10 MB or smaller.');
      return;
    }
    if (isPdf && file.size > MAX_PDF_BYTES) {
      toast.error('PDFs must be 30 MB or smaller.');
      return;
    }
    const tempId = `temp-${crypto.randomUUID()}`;
    const temp: ChatMessage = {
      id: tempId,
      senderId: user?.id ?? '',
      content: file.name,
      type: isImage ? 'image' : 'file',
      attachmentName: file.name,
      attachmentMime: file.type,
      attachmentSize: file.size,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    stickToBottom.current = true;
    setMessages((cur) => mergeById(cur, [temp]));
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await post(ApiPaths.marketplace.chatAttachments(chatId), {
        file: dataUrl,
        fileName: file.name,
        ...(chat?.bookingId ? { bookingId: chat.bookingId } : {}),
      });
      const saved = unwrap<ChatMessage>(res);
      setMessages((cur) => mergeById(cur.filter((m) => m.id !== tempId), saved?.id ? [saved] : []));
      void qc.invalidateQueries({ queryKey: chatKeys.preview(chatId) });
    } catch (err) {
      setMessages((cur) => cur.filter((m) => m.id !== tempId));
      toast.error(apiErrorMessage(err, 'Attachment not sent.'));
    }
  };

  const uploading = messages.some((m) => m.pending && (m.type === 'image' || m.type === 'file'));

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
        <div className="flex shrink-0 items-center">
          <UserSafetyActions userId={whoUserId} name={who.name} bookingId={chat?.bookingId} iconOnly onBlocked={() => navigate('/chats')} />
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
                            {m.type === 'image' && (m.imageUrl ?? m.attachmentUrl) ? (
                              <img src={(m.imageUrl ?? m.attachmentUrl)!} alt={m.attachmentName || 'Shared photo'} className="max-h-64 rounded-xl" loading="lazy" />
                            ) : m.type === 'image' && m.pending ? (
                              <p className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Uploading {m.attachmentName}
                              </p>
                            ) : m.type === 'file' ? (
                              <FileChip m={m} mine={mine} />
                            ) : (
                              <p className="whitespace-pre-wrap break-words">{m.content}</p>
                            )}
                            <p className={cn('mt-0.5 flex items-center justify-end gap-1 text-[11px]', mine ? 'opacity-70' : 'text-mk-text-tertiary')}>
                              {m.failed ? 'Not sent' : m.pending ? 'Sending' : formatClock(m.createdAt)}
                              {mine && !m.pending && !m.failed &&
                                (m.isRead || m.readAt ? (
                                  <span title={m.readAt ? `Read ${formatDate(m.readAt.slice(0, 10))} ${formatClock(m.readAt)}` : 'Read'}>
                                    <CheckCheck className="h-3 w-3" aria-label={m.readAt ? `Read at ${formatClock(m.readAt)}` : 'Read'} />
                                  </span>
                                ) : (
                                  <span title="Sent">
                                    <Check className="h-3 w-3" aria-label="Sent" />
                                  </span>
                                ))}
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
        <input
          ref={fileInput}
          type="file"
          className="sr-only"
          tabIndex={-1}
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) void sendAttachment(f);
          }}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          aria-label="Attach an image or PDF"
          title="Attach an image (up to 10 MB) or PDF (up to 30 MB)"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-mk-text-secondary transition-[background-color,transform] duration-150 hover:bg-mk-muted active:scale-[0.94] disabled:opacity-40 motion-reduce:active:scale-100"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Paperclip className="h-5 w-5" aria-hidden="true" />}
        </button>
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
