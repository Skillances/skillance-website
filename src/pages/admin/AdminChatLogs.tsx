import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/admin/PageHeader';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { toast } from 'sonner';

interface ChatRow {
  id: string;
  bookingId: string;
  updatedAt: string;
  source?: 'live' | 'archived';
  migrationReason?: string | null;
  booking?: {
    id: string;
    scheduledDate: string;
    status: string;
    category: string;
    customer?: { id: string; fullName?: string | null };
    freelancer?: { id: string; user?: { fullName?: string | null } };
  };
  _count?: { messages: number };
}

const AdminChatLogs: React.FC = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * pageSize;
      const res = await get(`${ApiPaths.admin.chats}?limit=${pageSize}&offset=${offset}`);
      if (res.success && res.data) {
        setChats(res.data.chats || []);
        setTotal(res.data.total ?? 0);
      }
    } catch {
      toast.error('Failed to load chat logs');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchChats();
  }, [fetchChats]);

  const columns: Column<ChatRow>[] = [
    {
      key: 'updated',
      header: 'Last activity',
      render: (row) => (
        <span className="text-neutral-600 dark:text-neutral-300 text-xs">
          {new Date(row.updatedAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (row) =>
        row.source === 'archived' ? (
          <span
            className="inline-flex text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100"
            title={row.migrationReason || undefined}
          >
            Archived
          </span>
        ) : (
          <span className="text-xs text-neutral-400 dark:text-neutral-500">Live</span>
        ),
    },
    {
      key: 'booking',
      header: 'Booking',
      render: (row) => (
        <span className="text-xs text-black dark:text-white">
          {row.booking
            ? new Date(row.booking.scheduledDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '--'}
          <span className="text-neutral-400 ml-1">({row.booking?.status || '--'})</span>
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <button
          type="button"
          className="text-left text-sm text-black dark:text-white hover:underline truncate max-w-[140px]"
          onClick={(e) => {
            e.stopPropagation();
            const id = row.booking?.customer?.id;
            if (id) navigate(`/admin/customers/${id}`);
          }}
        >
          {row.booking?.customer?.fullName || '--'}
        </button>
      ),
    },
    {
      key: 'freelancer',
      header: 'Freelancer',
      render: (row) => (
        <button
          type="button"
          className="text-left text-sm text-black dark:text-white hover:underline truncate max-w-[140px]"
          onClick={(e) => {
            e.stopPropagation();
            const id = row.booking?.freelancer?.id;
            if (id) navigate(`/admin/freelancers/${id}`);
          }}
        >
          {row.booking?.freelancer?.user?.fullName || '--'}
        </button>
      ),
    },
    {
      key: 'messages',
      header: 'Messages',
      render: (row) => (
        <span className="tabular-nums text-xs text-neutral-500">{row._count?.messages ?? 0}</span>
      ),
    },
  ];

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-8">
      <PageHeader title="Chat logs" description="Booking chats linked to customers and freelancers">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-neutral-200 dark:border-neutral-600"
          onClick={() => void fetchChats()}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </PageHeader>
      <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <MessageSquare className="h-4 w-4" />
        {total} chat{total !== 1 ? 's' : ''} total
      </div>
      <DataTable
        columns={columns}
        data={chats}
        isLoading={loading}
        emptyTitle="No booking chats"
        emptyDescription="Live chats appear after bookings are accepted. Completed bookings may show as archived history."
        onRowClick={(row) => {
          const customerUserId = row.booking?.customer?.id;
          if (customerUserId) {
            navigate(`/admin/customers/${customerUserId}?expandBooking=${row.bookingId}`);
          }
        }}
      />
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-neutral-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminChatLogs;
