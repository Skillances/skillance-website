import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/context/AuthContext';
import { getAppAblyClient, subscribeChannel } from '@/hooks/useAppAbly';
import type { ChatMessage } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatThreadPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const id = chatId ?? '';
  const { isAuthenticated, user } = useAuth();
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isPending } = useQuery({
    queryKey: queryKeys.chat.thread(id),
    queryFn: async () => {
      const res = await get(ApiPaths.chat.messages(id));
      const data = res?.data?.messages ?? res?.data ?? [];
      return Array.isArray(data) ? (data as ChatMessage[]) : [];
    },
    enabled: Boolean(id),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    const client = getAppAblyClient(true);
    if (!client) return;
    return subscribeChannel(client, `private-chat:${id}`, 'message', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.thread(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.list() });
    });
  }, [id, isAuthenticated, queryClient]);

  useEffect(() => {
    if (id) {
      patch(ApiPaths.chat.markRead(id), {}).catch(() => {});
    }
  }, [id]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      await post(ApiPaths.chat.messages(id), { content });
    },
    onSuccess: () => {
      setDraft('');
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.thread(id) });
    },
  });

  if (isPending) return <Skeleton className="h-64 rounded-2xl" />;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] max-w-2xl mx-auto">
      <div className="mb-4">
        <Link to="/app/chat" className="text-sm text-neutral-500">
          Messages
        </Link>
        <h1 className="text-lg font-semibold mt-1">Conversation</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
        {messages.length === 0 && (
          <p className="text-center text-neutral-400 text-sm py-8">No messages yet. Say hello.</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  mine ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-900'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex gap-2 mt-3"
        onSubmit={(e) => {
          e.preventDefault();
          const text = draft.trim();
          if (!text) return;
          sendMutation.mutate(text);
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          className="rounded-full"
        />
        <Button type="submit" className="rounded-full shrink-0" disabled={sendMutation.isPending}>
          Send
        </Button>
      </form>
    </div>
  );
}
