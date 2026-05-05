import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { Button } from '@/components/ui/button';
import { MessageSquare, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  originalContent?: string;
  contentDetected?: boolean;
  detectedTypes?: string[];
  type: string;
  createdAt: string;
}

function adminVisibleText(m: ChatMessage): { primary: string; shownToUsers?: string; moderated: boolean; types?: string[] } {
  const orig = m.originalContent?.trim();
  if (m.contentDetected && orig) {
    return {
      primary: orig,
      shownToUsers: m.content !== orig ? m.content : undefined,
      moderated: true,
      types: m.detectedTypes?.length ? m.detectedTypes : undefined,
    };
  }
  return { primary: m.content, moderated: !!m.contentDetected, types: m.detectedTypes?.length ? m.detectedTypes : undefined };
}

interface AdminBookingChatPanelProps {
  bookingId: string;
  customerUserId: string;
  freelancerUserId: string | undefined;
  /** Override list max height (detail page gets more vertical space). */
  messagesScrollClassName?: string;
  /** Omit outer margin/border when nested inside another admin card. */
  embedded?: boolean;
}

const AdminBookingChatPanel: React.FC<AdminBookingChatPanelProps> = ({
  bookingId,
  customerUserId,
  freelancerUserId,
  messagesScrollClassName = 'max-h-64',
  embedded = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noChat, setNoChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSource, setChatSource] = useState<'live' | 'archived' | null>(null);
  const [migrationReason, setMigrationReason] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>('Customer');
  const [freelancerName, setFreelancerName] = useState<string>('Freelancer');
  const [resolvedCustomerUserId, setResolvedCustomerUserId] = useState<string | null>(null);
  const [resolvedFreelancerUserId, setResolvedFreelancerUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setNoChat(false);
      setChatSource(null);
      setMigrationReason(null);
      setCustomerName('Customer');
      setFreelancerName('Freelancer');
      setResolvedCustomerUserId(null);
      setResolvedFreelancerUserId(null);
      const response = await apiRequest(ApiPaths.admin.bookingChat(bookingId), { method: 'GET' });
      if (response.status === 404) {
        setNoChat(true);
        setMessages([]);
        return;
      }
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Failed to load chat' }));
        setError(err.message || 'Failed to load chat');
        return;
      }
      const res = await response.json();
      const c = res.data?.chat;
      const src = c?.source as 'live' | 'archived' | undefined;
      if (src === 'live' || src === 'archived') {
        setChatSource(src);
        setMigrationReason(
          src === 'archived' && typeof c?.migrationReason === 'string' ? c.migrationReason : null,
        );
      }
      const booking = res.data?.booking as
        | {
            customer?: { id?: string; fullName?: string | null };
            freelancer?: { user?: { id?: string; fullName?: string | null } };
          }
        | undefined;
      const cn = booking?.customer?.fullName?.trim();
      const fn = booking?.freelancer?.user?.fullName?.trim();
      if (cn) setCustomerName(cn);
      if (fn) setFreelancerName(fn);
      const custUid =
        (typeof c?.customerId === 'string' ? c.customerId : null) ||
        booking?.customer?.id ||
        customerUserId;
      const flUid = booking?.freelancer?.user?.id || freelancerUserId;
      setResolvedCustomerUserId(custUid || null);
      setResolvedFreelancerUserId(flUid || null);

      if (res.success && Array.isArray(res.data?.messages)) {
        setMessages(res.data.messages as ChatMessage[]);
      } else {
        setMessages([]);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load chat';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [bookingId, customerUserId, freelancerUserId]);

  useEffect(() => {
    void load();
  }, [load]);

  const senderLabel = (senderId: string) => {
    if (resolvedCustomerUserId && senderId === resolvedCustomerUserId) return customerName;
    if (resolvedFreelancerUserId && senderId === resolvedFreelancerUserId) return freelancerName;
    if (senderId === customerUserId) return customerName;
    if (freelancerUserId && senderId === freelancerUserId) return freelancerName;
    return 'User';
  };

  return (
    <div
      className={
        embedded
          ? 'space-y-3'
          : 'col-span-2 md:col-span-4 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-600/80'
      }
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 text-black dark:text-white font-medium text-sm flex-wrap">
            <MessageSquare className="h-4 w-4 shrink-0 text-neutral-400" />
            Booking chat
            {chatSource === 'archived' && (
              <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100">
                Archived
              </span>
            )}
          </div>
          {migrationReason ? (
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 pl-6" title={migrationReason}>
              {migrationReason}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-full text-xs border-neutral-200 dark:border-neutral-600"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Reload chat
        </Button>
      </div>
      {loading && messages.length === 0 && !noChat && !error && (
        <p className="text-xs text-neutral-400">Loading messages...</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {noChat && !error && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">No chat for this booking yet.</p>
      )}
      {!noChat && !error && messages.length === 0 && !loading && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">No messages.</p>
      )}
      {messages.length > 0 && (
        <ul className={`space-y-2 overflow-y-auto rounded-xl border border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-900/40 p-3 ${messagesScrollClassName}`}>
          {messages.map((m) => {
            const { primary, shownToUsers, moderated, types } = adminVisibleText(m);
            return (
              <li key={m.id} className="text-xs">
                <span className="font-semibold text-neutral-600 dark:text-neutral-300">
                  {senderLabel(m.senderId)}
                </span>
                <span className="text-neutral-400 dark:text-neutral-500 mx-1.5">
                  {new Date(m.createdAt).toLocaleString()}
                </span>
                {moderated && (
                  <span className="text-amber-700 dark:text-amber-300 text-[10px] font-medium ml-1">Moderated</span>
                )}
                {types && (
                  <span className="text-neutral-400 dark:text-neutral-500 text-[10px] ml-1" title={types.join(', ')}>
                    ({types.join(', ')})
                  </span>
                )}
                <p className="text-black dark:text-white mt-0.5 whitespace-pre-wrap break-words">{primary}</p>
                {shownToUsers ? (
                  <p className="text-neutral-400 dark:text-neutral-500 mt-0.5 text-[10px] whitespace-pre-wrap break-words">
                    Shown to users: {shownToUsers}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AdminBookingChatPanel;
