import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MkAnimatedList, MkAvatar, MkEmpty, MkErrorState, MkLinkButton, MkListSkeleton, MkPageHeader, MkSkeleton, MkSwap } from '@/components/marketplace/ui';
import { apiErrorMessage } from '@/lib/marketplace/apiHelpers';
import { bookingKeys, fetchBooking, otherParty, roleInBooking } from '@/lib/marketplace/bookings';
import { chatKeys, fetchChats, fetchMessages, type Chat } from '@/lib/marketplace/chatRealtime';
import { formatClock, formatDate, sastNow } from '@/lib/marketplace/time';
import { activeView } from '@/lib/marketplace/session';

/** Row joins the chat with its booking (names, photo) and its latest messages (preview, unread), like the app. */
function ChatRow({ chat }: { chat: Chat }) {
  const { user } = useAuth();
  const booking = useQuery({
    queryKey: bookingKeys.detail(chat.bookingId ?? ''),
    enabled: !!chat.bookingId,
    queryFn: () => fetchBooking(chat.bookingId!),
    staleTime: 60_000,
  });
  const preview = useQuery({
    queryKey: chatKeys.preview(chat.id),
    queryFn: () => fetchMessages(chat.id, 30),
    staleTime: 15_000,
  });

  const role = booking.data ? roleInBooking(booking.data, user) : null;
  const who = booking.data ? otherParty(booking.data, role) : { name: 'Conversation', photo: null };
  const msgs = preview.data?.messages ?? [];
  const last = msgs[msgs.length - 1];
  const unread = msgs.filter((m) => m.senderId !== user?.id && !m.isRead).length;
  const lastDate = last?.createdAt ? last.createdAt.slice(0, 10) : null;
  const when = last ? (lastDate === sastNow().date ? formatClock(last.createdAt) : formatDate(lastDate, { weekday: false, year: false })) : '';

  return (
    <Link
      to={`/chats/${chat.id}`}
      className="flex items-center gap-3.5 rounded-2xl p-3 transition-colors duration-150 hover:bg-mk-muted"
    >
      {booking.isPending && chat.bookingId ? (
        <MkSkeleton className="h-12 w-12 rounded-full" />
      ) : (
        <MkAvatar src={who.photo} name={who.name} size={48} />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-mk-display text-[15px] font-semibold">{booking.isPending && chat.bookingId ? 'Loading' : who.name}</p>
          <span className="shrink-0 text-[12px] text-mk-text-tertiary">{when}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={unread ? 'truncate text-[14px] font-semibold text-mk-text-primary' : 'truncate text-[14px] text-mk-text-secondary'}>
            {preview.isPending ? ' ' : last ? (last.type === 'image' ? 'Photo' : last.content) : 'No messages yet'}
          </p>
          {unread > 0 && (
            <span className="min-w-5 shrink-0 rounded-full bg-mk-accent px-1.5 text-center text-[11px] font-semibold leading-5 text-mk-on-primary" aria-label={`${unread} unread`}>
              {unread}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ChatListPage() {
  const { user } = useAuth();
  const chats = useQuery({ queryKey: chatKeys.list, queryFn: fetchChats });
  const items = [...(chats.data ?? [])].sort((a, b) => String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? '')));
  const state = chats.isPending ? 'loading' : chats.isError ? 'error' : items.length === 0 ? 'empty' : 'list';
  const isFreelancer = activeView(user) === 'freelancer';

  return (
    <>
      <MkPageHeader title="Chat" subtitle="Messages with the people you have bookings with." />
      <MkSwap id={state}>
        {state === 'loading' && <MkListSkeleton rows={5} />}
        {state === 'error' && (
          <MkErrorState message={apiErrorMessage(chats.error, 'Chats could not be loaded.')} onRetry={() => void chats.refetch()} retrying={chats.isRefetching} />
        )}
        {state === 'empty' && (
          <MkEmpty
            icon={<MessageCircle className="h-6 w-6" aria-hidden="true" />}
            title="No conversations yet"
            body={isFreelancer ? 'A chat opens when you accept a booking.' : 'A chat opens once a freelancer accepts your booking.'}
            action={isFreelancer ? <MkLinkButton to="/work/jobs">View jobs</MkLinkButton> : <MkLinkButton to="/bookings">View bookings</MkLinkButton>}
          />
        )}
        {state === 'list' && <MkAnimatedList items={items} getKey={(c) => c.id} className="-mx-3 space-y-1" render={(c) => <ChatRow chat={c} />} />}
      </MkSwap>
    </>
  );
}
