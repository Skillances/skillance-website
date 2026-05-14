import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import PageHeader from '@/components/admin/PageHeader';
import DetailCard, { type DetailField } from '@/components/admin/DetailCard';
import StatusBadge from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import AdminBookingChatPanel from '@/components/admin/AdminBookingChatPanel';
import { useAdminBackNavigation } from '@/hooks/useAdminBackNavigation';
import {
  advanceBookingSessionForDev,
  advanceCompletedBookingForDev,
  bookingDevAdvanceAllowedForStatus,
  bookingDevAdvanceCompletedAllowedForStatus,
  fetchBookingDevToolsStatus,
} from '@/lib/adminBookingDevTools';
import { formatBookingScheduledDisplay } from '@/lib/bookingScheduleDisplay';

const viteShowBookingDevTools = import.meta.env.VITE_SHOW_BOOKING_DEV_TOOLS === 'true';

const bookingStatusToneMap: Record<string, string> = {
  pending: 'pending',
  confirmed: 'info',
  inprogress: 'info',
  inProgress: 'info',
  completed: 'success',
  cancelled: 'error',
  rejected: 'rejected',
};

const formatDateTime = (input?: string | null) => {
  if (!input) return '--';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatMoney = (amount?: unknown) => {
  if (amount == null || amount === '') return '--';
  const n =
      typeof amount === 'number'
          ? amount
          : typeof amount === 'string'
              ? Number.parseFloat(amount)
              : Number(amount);
  if (!Number.isFinite(n)) return '--';
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 2,
  }).format(n);
};

type BookingCustomer = {
  id?: string;
  fullName?: string | null;
  customerProfileId?: string;
  profilePhotoUrl?: string | null;
};

type BookingFreelancer = {
  id?: string;
  user?: { id?: string; fullName?: string | null };
};

interface AdminBookingDetailRecord {
  id: string;
  status: string;
  scheduledDate: string;
  scheduledTime?: string | null;
  createdAt?: string;
  updatedAt?: string;
  totalPrice?: number;
  /** Stored category id or legacy label (unchanged). */
  category?: string | null;
  /** Resolved category name when `category` is a category UUID; else mirrored raw ref. */
  categoryDisplayName?: string | null;
  customer?: BookingCustomer | null;
  freelancer?: BookingFreelancer | null;
}

const AdminBookingDetail: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const goBack = useAdminBackNavigation();
  const [booking, setBooking] = useState<AdminBookingDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [devApiEnabled, setDevApiEnabled] = useState(false);

  const showDevAdvance = viteShowBookingDevTools || devApiEnabled;
  const canAdvanceSession = Boolean(booking && bookingDevAdvanceAllowedForStatus(booking.status));
  const canAdvanceCompleted = Boolean(booking && bookingDevAdvanceCompletedAllowedForStatus(booking.status));

  const loadBooking = useCallback(async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      const res = await get(ApiPaths.admin.booking(bookingId));
      if ((res as { success?: boolean }).success && (res as { data?: { booking?: AdminBookingDetailRecord } }).data?.booking) {
        setBooking((res as { data: { booking: AdminBookingDetailRecord } }).data.booking);
      } else {
        setBooking(null);
        toast.error('Booking not found');
      }
    } catch {
      setBooking(null);
      toast.error('Failed to load booking');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void loadBooking();
  }, [loadBooking]);

  useEffect(() => {
    let cancelled = false;
    void fetchBookingDevToolsStatus()
      .then((s) => {
        if (!cancelled) setDevApiEnabled(s.enabled);
      })
      .catch(() => {
        if (!cancelled) setDevApiEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdvanceDev = async () => {
    if (!bookingId || !booking) return;
    try {
      setAdvancing(true);
      const data = await advanceBookingSessionForDev(bookingId);
      toast.success(`Session advanced. PIN: ${data.sessionPin}`);
      await loadBooking();
    } catch (err: unknown) {
      const o = err && typeof err === 'object' ? (err as Record<string, unknown>) : {};
      const msg =
        typeof o.message === 'string'
          ? o.message
          : typeof o.error === 'string'
            ? o.error
            : 'Advance session failed';
      toast.error(msg);
    } finally {
      setAdvancing(false);
    }
  };

  const handleAdvanceCompletedDev = async () => {
    if (!bookingId || !booking) return;
    try {
      setAdvancing(true);
      const data = await advanceCompletedBookingForDev(bookingId);
      const deadline = new Date(data.feedbackDeadlineIso);
      const label = Number.isNaN(deadline.getTime())
        ? data.feedbackDeadlineIso
        : deadline.toLocaleString();
      toast.success(`Feedback window reset. Submit feedback by ${label}.`);
      await loadBooking();
    } catch (err: unknown) {
      const o = err && typeof err === 'object' ? (err as Record<string, unknown>) : {};
      const msg =
        typeof o.message === 'string'
          ? o.message
          : typeof o.error === 'string'
            ? o.error
            : 'Reset feedback failed';
      toast.error(msg);
    } finally {
      setAdvancing(false);
    }
  };

  const customerAdminId = booking?.customer?.customerProfileId ?? booking?.customer?.id;
  const freelancerRecordId = booking?.freelancer?.id;
  const customerUserId = booking?.customer?.id ?? '';
  const freelancerUserId = booking?.freelancer?.user?.id;

  const fields: DetailField[] = booking
    ? [
        {
          label: 'Status',
          value: (() => {
            const norm = (booking.status || '').toLowerCase().replace(/_/g, '');
            return (
              <StatusBadge
                status={bookingStatusToneMap[norm] || bookingStatusToneMap[booking.status] || 'info'}
                label={booking.status || 'unknown'}
              />
            );
          })(),
        },
        {
          label: 'Scheduled',
          value: formatBookingScheduledDisplay(booking.scheduledDate, booking.scheduledTime),
        },
        {
          label: 'Category',
          value: booking.categoryDisplayName?.trim() || booking.category || '--',
        },
        {
          label: 'Amount',
          value: formatMoney(booking.totalPrice),
        },
        {
          label: 'Created',
          value: formatDateTime(booking.createdAt),
        },
        {
          label: 'Updated',
          value: formatDateTime(booking.updatedAt),
        },
        {
          label: 'Booking ID',
          value: <code className="text-xs break-all">{booking.id}</code>,
          fullWidth: true,
        },
        {
          label: 'Client',
          value: booking.customer?.fullName ? (
            <div className="flex flex-wrap items-center gap-2">
              <span>{booking.customer.fullName}</span>
              {customerAdminId ? (
                <Link
                  to={`/admin/customers/${customerAdminId}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Customer profile
                  <ExternalLink className="h-3 w-3" />
                </Link>
              ) : null}
            </div>
          ) : (
            '--'
          ),
          fullWidth: true,
        },
        {
          label: 'Freelancer',
          value: booking.freelancer?.user?.fullName ? (
            <div className="flex flex-wrap items-center gap-2">
              <span>{booking.freelancer.user.fullName}</span>
              {freelancerRecordId ? (
                <Link
                  to={`/admin/freelancers/${freelancerRecordId}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Freelancer profile
                  <ExternalLink className="h-3 w-3" />
                </Link>
              ) : null}
            </div>
          ) : (
            '--'
          ),
          fullWidth: true,
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-0 text-neutral-500 hover:text-black dark:hover:text-white -ml-1"
            onClick={() => goBack('/admin/bookings')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <PageHeader
            title="Booking detail"
            description="Session context, related profiles, and booking-scoped chat (live or archived after completion)."
          />
        </div>
        {showDevAdvance && bookingId && (canAdvanceSession || canAdvanceCompleted) ? (
          <div className="flex flex-wrap gap-2 shrink-0 justify-end">
            {canAdvanceSession ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 h-9"
                disabled={advancing}
                title="Dev only: move confirmed booking to in-progress with PIN window (requires ALLOW_BOOKING_DEV_TOOLS on API)"
                onClick={() => void handleAdvanceDev()}
              >
                {advancing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                Advance session (dev)
              </Button>
            ) : null}
            {canAdvanceCompleted ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 h-9"
                disabled={advancing}
                title="Dev only: reset completedAt, clear ratings/review for this booking, reopen 24h feedback window"
                onClick={() => void handleAdvanceCompletedDev()}
              >
                {advancing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                Reset feedback (dev)
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      )}

      {!loading && booking && bookingId ? (
        <>
          <DetailCard title="Overview" fields={fields} />
          <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 pb-4 px-6">
              <CardTitle className="text-base font-serif text-black dark:text-white">
                Booking chat
              </CardTitle>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans font-normal mt-1">
                Live messages while the booking is active; after completion, migrated chat appears from archived history (the admin API loads history when live rows are cleared).
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <AdminBookingChatPanel
                bookingId={bookingId}
                customerUserId={customerUserId}
                freelancerUserId={freelancerUserId}
                messagesScrollClassName="max-h-[min(520px,60vh)]"
                embedded
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default AdminBookingDetail;
