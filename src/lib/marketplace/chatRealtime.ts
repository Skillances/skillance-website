import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { listFrom } from '@/lib/marketplace/apiHelpers';
import { parseAblyData, useAblyChannel } from '@/lib/marketplace/realtime';

/** Chat row from `GET /chats` (no names or previews; those come from the booking and messages). */
export type Chat = {
  id: string;
  bookingId?: string | null;
  customerId?: string;
  freelancerId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ChatMessage = {
  id: string;
  chatId?: string;
  bookingId?: string | null;
  senderId: string;
  content: string;
  type?: 'text' | 'image' | 'voice' | 'system' | string;
  imageUrl?: string | null;
  isRead?: boolean;
  createdAt: string;
  /** Client-only: optimistic send state. */
  pending?: boolean;
  failed?: boolean;
};

export type MessagePage = { messages: ChatMessage[]; nextCursor: string | null; hasMore: boolean };

export const chatKeys = {
  list: ['marketplace', 'chats'] as const,
  messages: (chatId: string) => ['marketplace', 'chats', chatId, 'messages'] as const,
  preview: (chatId: string) => ['marketplace', 'chats', chatId, 'preview'] as const,
};

export async function fetchChats(): Promise<Chat[]> {
  return listFrom<Chat>(await get(ApiPaths.marketplace.chats), 'chats');
}

/** One page of messages, oldest first. Pass the oldest loaded id as [cursor] for earlier messages. */
export async function fetchMessages(chatId: string, limit = 30, cursor?: string | null): Promise<MessagePage> {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (cursor) qs.set('cursor', cursor);
  const res = (await get(`${ApiPaths.marketplace.chatMessages(chatId)}?${qs}`)) as {
    data?: ChatMessage[];
    nextCursor?: string | null;
    hasMore?: boolean;
  };
  return { messages: Array.isArray(res?.data) ? res.data : [], nextCursor: res?.nextCursor ?? null, hasMore: res?.hasMore === true };
}

/**
 * Live chat events on `private-chat:${chatId}` (same channel and event names as the app):
 * `new_message` carries `{ message }`, `messages_read` carries `{ readByUserId }`.
 * Unsubscribes when the thread unmounts.
 */
export function useChatRealtime(
  chatId: string | null,
  handlers: { onMessage: (m: ChatMessage) => void; onRead: (readByUserId: string) => void },
): void {
  useAblyChannel(chatId ? `private-chat:${chatId}` : null, (msg) => {
    const data = parseAblyData<{ message?: ChatMessage; readByUserId?: string }>(msg.data);
    if (msg.name === 'new_message' && data?.message?.id) handlers.onMessage(data.message);
    else if (msg.name === 'messages_read' && data?.readByUserId) handlers.onRead(data.readByUserId);
  });
}
