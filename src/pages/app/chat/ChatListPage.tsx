import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import type { ChatSummary } from '@/types/product';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function ChatListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const { data: chats = [], isPending } = useQuery({
    queryKey: queryKeys.chat.list(),
    queryFn: async () => {
      const res = await get(ApiPaths.chat.list);
      const data = res?.data?.chats ?? res?.data ?? [];
      return Array.isArray(data) ? (data as ChatSummary[]) : [];
    },
  });

  const { data: bookingChat, isFetching: resolvingBookingChat } = useQuery({
    queryKey: ['chat', 'byBooking', bookingId ?? ''],
    queryFn: async () => {
      const res = await get(ApiPaths.chat.byBookingId(bookingId!));
      return (res?.data?.chat ?? res?.data) as ChatSummary | null;
    },
    enabled: Boolean(bookingId),
  });

  useEffect(() => {
    if (!bookingId || resolvingBookingChat) return;

    const existing = chats.find((c) => c.bookingId === bookingId);
    if (existing) {
      setSearchParams({}, { replace: true });
      navigate(`/app/chat/${existing.id}`, { replace: true });
      return;
    }

    if (bookingChat?.id) {
      setSearchParams({}, { replace: true });
      navigate(`/app/chat/${bookingChat.id}`, { replace: true });
      return;
    }

    if (!resolvingBookingChat && bookingId && !existing && !bookingChat) {
      toast.error('Chat is not available for this booking yet');
      setSearchParams({}, { replace: true });
    }
  }, [bookingId, bookingChat, chats, navigate, resolvingBookingChat, setSearchParams]);

  if (bookingId && resolvingBookingChat) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Messages</h1>
        <p className="text-sm text-neutral-600 mt-1">Chat with freelancers about your bookings</p>
      </div>

      {isPending ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-neutral-200">
          <p className="text-neutral-600">No conversations yet.</p>
          <Link to="/app/bookings" className="text-sm underline mt-2 inline-block">
            View bookings
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              onClick={() => navigate(`/app/chat/${chat.id}`)}
              className="w-full text-left rounded-2xl border border-neutral-200 bg-white p-4 hover:border-neutral-300 transition-colors"
            >
              <div className="flex justify-between items-start gap-2">
                <p className="font-medium text-neutral-900">
                  {chat.otherPartyName ?? `Booking ${chat.bookingId.slice(0, 8)}`}
                </p>
                {(chat.unreadCount ?? 0) > 0 ? (
                  <span className="text-xs bg-neutral-900 text-white px-2 py-0.5 rounded-full">
                    {chat.unreadCount}
                  </span>
                ) : null}
              </div>
              {chat.lastMessage ? (
                <p className="text-sm text-neutral-500 mt-1 line-clamp-1">{chat.lastMessage}</p>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
