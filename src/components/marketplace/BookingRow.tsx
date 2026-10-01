import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { MkAvatar, MkPill } from '@/components/marketplace/ui';
import { categoryLabel, type CategoryNode } from '@/lib/marketplace/categories';
import { bookingTotalLabel, otherParty, type Booking } from '@/lib/marketplace/bookings';
import { statusLabel, statusTone } from '@/lib/marketplace/bookingStatus';
import { addMinutes, formatDate } from '@/lib/marketplace/time';

export default function BookingRow({
  booking: b,
  role,
  categories,
}: {
  booking: Booking;
  role: 'customer' | 'freelancer';
  categories?: CategoryNode[];
}) {
  const who = otherParty(b, role);
  return (
    <Link
      to={`/bookings/${b.id}`}
      className="flex items-center gap-3.5 rounded-2xl border border-mk-border bg-mk-surface p-4 transition-shadow duration-200 ease-out hover:shadow-mk-card"
    >
      <MkAvatar src={who.photo} name={who.name} size={48} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-mk-display text-[15px] font-semibold">{who.name}</p>
          <span className="shrink-0 font-mk-display text-[14px] font-semibold">{bookingTotalLabel(b)}</span>
        </div>
        {b.category && <p className="truncate text-[13px] text-mk-text-secondary">{categoryLabel(categories, b.category)}</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-mk-text-secondary">
            {formatDate(b.scheduledDate)}, {b.scheduledTime} to {addMinutes(b.scheduledTime, b.durationMinutes)}
          </span>
          <MkPill tone={statusTone(b.status)}>{statusLabel(b.status)}</MkPill>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-mk-text-tertiary" aria-hidden="true" />
    </Link>
  );
}
