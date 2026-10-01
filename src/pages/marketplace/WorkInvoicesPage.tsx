import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Receipt } from 'lucide-react';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import WorkGate from '@/components/marketplace/WorkGate';
import type { Invoice } from '@/components/marketplace/InvoicePanel';
import { MkAnimatedList, MkAvatar, MkEmpty, MkErrorState, MkListSkeleton, MkPageHeader, MkPill, MkSkeleton, MkSwap, type MkTone } from '@/components/marketplace/ui';
import { apiErrorMessage, unwrap } from '@/lib/marketplace/apiHelpers';
import { bookingKeys, fetchFreelancerBookings, otherParty, type Booking } from '@/lib/marketplace/bookings';
import { categoryLabel, useCategories } from '@/lib/marketplace/categories';
import { money } from '@/lib/marketplace/pricing';
import { formatZar } from '@/lib/marketplace/theme';
import { formatDate } from '@/lib/marketplace/time';

const STATUS: Record<string, { label: string; tone: MkTone }> = {
  none: { label: 'Needs invoice', tone: 'warning' },
  draft: { label: 'Draft', tone: 'neutral' },
  sent: { label: 'Sent', tone: 'info' },
  accepted: { label: 'Accepted', tone: 'success' },
  declined: { label: 'Declined', tone: 'error' },
  paid: { label: 'Paid', tone: 'success' },
  voided: { label: 'Voided', tone: 'neutral' },
};

function InvoiceRow({ b }: { b: Booking }) {
  const categories = useCategories();
  const inv = useQuery({
    queryKey: ['marketplace', 'invoice', b.id],
    queryFn: async () => unwrap<Invoice | null>(await get(ApiPaths.marketplace.invoiceByBooking(b.id))),
  });
  const who = otherParty(b, 'freelancer');
  const st = STATUS[inv.data?.status ?? 'none'] ?? { label: inv.data?.status ?? '', tone: 'neutral' as MkTone };
  return (
    <Link to={`/bookings/${b.id}`} className="flex items-center gap-3.5 rounded-2xl border border-mk-border p-4 hover:bg-mk-muted">
      <MkAvatar src={who.photo} name={who.name} size={44} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-mk-display text-[15px] font-semibold">{who.name}</p>
          <span className="shrink-0 font-mk-display text-[14px] font-semibold">{inv.data ? formatZar(money(inv.data.totalDue)) : 'On invoice'}</span>
        </div>
        <p className="truncate text-[13px] text-mk-text-secondary">
          {b.category ? `${categoryLabel(categories.data, b.category)} · ` : ''}
          {formatDate(b.scheduledDate)}
        </p>
        <div className="mt-1.5">{inv.isPending ? <MkSkeleton className="h-6 w-24 rounded-full" /> : <MkPill tone={st.tone}>{st.label}</MkPill>}</div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-mk-text-tertiary" aria-hidden="true" />
    </Link>
  );
}

function Invoices({ freelancerId }: { freelancerId: string }) {
  const q = useQuery({ queryKey: bookingKeys.freelancer(freelancerId), queryFn: () => fetchFreelancerBookings(freelancerId) });
  const items = (q.data?.items ?? []).filter((b) => b.pricingMode === 'invoice' && !['cancelled', 'rejected'].includes(String(b.status).toLowerCase())).reverse();
  const state = q.isPending ? 'loading' : q.isError ? 'error' : items.length === 0 ? 'empty' : 'list';
  return (
    <>
      <MkPageHeader back="/work" title="Invoices" subtitle="Bookings for services you price on invoice. Open one to draft, review, and send its invoice." />
      <MkSwap id={state}>
        {state === 'loading' && <MkListSkeleton rows={3} />}
        {state === 'error' && <MkErrorState message={apiErrorMessage(q.error)} onRetry={() => void q.refetch()} retrying={q.isRefetching} />}
        {state === 'empty' && (
          <MkEmpty
            icon={<Receipt className="h-6 w-6" aria-hidden="true" />}
            title="No invoice bookings"
            body="When a customer books a service you price on invoice, it shows here so you can send the invoice."
          />
        )}
        {state === 'list' && <MkAnimatedList items={items} getKey={(b) => b.id} className="space-y-3" render={(b) => <InvoiceRow b={b} />} />}
      </MkSwap>
    </>
  );
}

export default function WorkInvoicesPage() {
  return <WorkGate title="Invoices">{(fid) => <Invoices freelancerId={fid} />}</WorkGate>;
}
