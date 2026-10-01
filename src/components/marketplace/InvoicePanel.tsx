import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { MkButton, MkCard, MkConfirmDialog, MkFormError, MkIconButton, MkInput, MkPill, MkSectionTitle, MkSkeleton, MkTextarea, type MkTone } from '@/components/marketplace/ui';
import { apiErrorMessage, apiFieldErrors, unwrap } from '@/lib/marketplace/apiHelpers';
import { bookingKeys, type Booking } from '@/lib/marketplace/bookings';
import { money } from '@/lib/marketplace/pricing';
import { formatZar, mkMotion } from '@/lib/marketplace/theme';

export type Invoice = {
  id: string;
  bookingId: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'paid' | 'voided' | string;
  subtotal: number | string;
  platformCommission: number | string;
  totalDue: number | string;
  notes?: string | null;
  lineItems: { id?: string; description: string; quantity: number; unitPrice: number | string; lineTotal: number | string }[];
};

const STATUS: Record<string, { label: string; tone: MkTone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  sent: { label: 'Sent', tone: 'info' },
  accepted: { label: 'Accepted', tone: 'success' },
  declined: { label: 'Declined', tone: 'error' },
  paid: { label: 'Paid', tone: 'success' },
  voided: { label: 'Voided', tone: 'neutral' },
};

type Line = { key: number; description: string; quantity: string; unitPrice: string };

let lineSeq = 1;
const newLine = (): Line => ({ key: lineSeq++, description: '', quantity: '1', unitPrice: '' });

function InvoiceLines({ inv }: { inv: Invoice }) {
  return (
    <div className="space-y-3">
      <ul className="divide-y divide-mk-divider">
        {inv.lineItems.map((l, i) => (
          <li key={l.id ?? i} className="flex items-start justify-between gap-3 py-2.5 text-[14px]">
            <span className="min-w-0">
              {l.description}
              <span className="block text-[12px] text-mk-text-tertiary">
                {l.quantity} x {formatZar(money(l.unitPrice))}
              </span>
            </span>
            <span className="shrink-0 font-medium">{formatZar(money(l.lineTotal))}</span>
          </li>
        ))}
      </ul>
      <dl className="space-y-1.5 border-t border-mk-divider pt-3 text-[14px]">
        <div className="flex justify-between">
          <dt className="text-mk-text-secondary">Subtotal</dt>
          <dd>{formatZar(money(inv.subtotal))}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-mk-text-secondary">Platform fee</dt>
          <dd>{formatZar(money(inv.platformCommission))}</dd>
        </div>
        <div className="flex justify-between font-mk-display text-[16px] font-semibold">
          <dt>Total due</dt>
          <dd>{formatZar(money(inv.totalDue))}</dd>
        </div>
      </dl>
      {inv.notes && <p className="text-[13px] text-mk-text-secondary">{inv.notes}</p>}
    </div>
  );
}

function InvoiceForm({ bookingId, onDone }: { bookingId: string; onDone: () => void }) {
  const [lines, setLines] = useState<Line[]>([newLine()]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lineErrors, setLineErrors] = useState<Record<number, string>>({});
  const create = useMutation({
    mutationFn: async () =>
      post(ApiPaths.marketplace.invoices, {
        bookingId,
        lineItems: lines.map((l) => ({ description: l.description.trim(), quantity: Number(l.quantity), unitPrice: Number(l.unitPrice) })),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }),
    onSuccess: () => {
      toast.success('Invoice saved as a draft');
      onDone();
    },
    onError: (err) => {
      const fields = apiFieldErrors(err);
      const first = Object.values(fields)[0];
      setError(first ?? apiErrorMessage(err, 'Could not create the invoice.'));
    },
  });

  const validate = () => {
    const errs: Record<number, string> = {};
    for (const l of lines) {
      if (!l.description.trim()) errs[l.key] = 'Add a description';
      else if (!(Number(l.quantity) >= 1) || !Number.isInteger(Number(l.quantity))) errs[l.key] = 'Quantity must be a whole number of 1 or more';
      else if (l.unitPrice === '' || !(Number(l.unitPrice) >= 0)) errs[l.key] = 'Enter a unit price in rand';
    }
    setLineErrors(errs);
    return Object.keys(errs).length === 0;
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (validate()) create.mutate();
      }}
    >
      <AnimatePresence initial={false}>
        {lines.map((l, i) => (
          <motion.div
            key={l.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: mkMotion.control }}
            className="space-y-2 rounded-xl border border-mk-border p-3"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <MkInput
                  label={`Item ${i + 1}`}
                  placeholder="Describe the work or material"
                  value={l.description}
                  onChange={(e) => setLines(lines.map((x) => (x.key === l.key ? { ...x, description: e.target.value } : x)))}
                />
              </div>
              {lines.length > 1 && (
                <MkIconButton label={`Remove item ${i + 1}`} className="mt-6" onClick={() => setLines(lines.filter((x) => x.key !== l.key))}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </MkIconButton>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MkInput
                label="Quantity"
                inputMode="numeric"
                value={l.quantity}
                onChange={(e) => setLines(lines.map((x) => (x.key === l.key ? { ...x, quantity: e.target.value.replace(/\D/g, '') } : x)))}
              />
              <MkInput
                label="Unit price (R)"
                inputMode="decimal"
                value={l.unitPrice}
                onChange={(e) => setLines(lines.map((x) => (x.key === l.key ? { ...x, unitPrice: e.target.value.replace(/[^0-9.]/g, '') } : x)))}
              />
            </div>
            {lineErrors[l.key] && (
              <p role="alert" className="text-[13px] text-mk-error">
                {lineErrors[l.key]}
              </p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <MkButton variant="ghost" size="sm" onClick={() => setLines([...lines, newLine()])} disabled={lines.length >= 500}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add item
      </MkButton>
      <MkTextarea label="Notes" optional value={notes} onChange={(e) => setNotes(e.target.value)} />
      <p className="text-[13px] text-mk-text-tertiary">Skillance adds its platform fee to the total. You will see the final amount before you send it.</p>
      <MkFormError message={error} />
      <MkButton type="submit" block loading={create.isPending}>
        Save draft invoice
      </MkButton>
    </form>
  );
}

/** Invoice for an invoice-priced booking. Freelancer drafts and sends; customer accepts or declines. */
export default function InvoicePanel({ booking, role }: { booking: Booking; role: 'customer' | 'freelancer' }) {
  const qc = useQueryClient();
  const key = ['marketplace', 'invoice', booking.id];
  const enabled = booking.pricingMode === 'invoice';
  const invoice = useQuery({
    queryKey: key,
    enabled,
    queryFn: async () => unwrap<Invoice | null>(await get(ApiPaths.marketplace.invoiceByBooking(booking.id))),
  });
  const [confirm, setConfirm] = useState<'send' | 'accept' | 'decline' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: key });
    void qc.invalidateQueries({ queryKey: bookingKeys.detail(booking.id) });
    void qc.invalidateQueries({ queryKey: ['marketplace', 'invoices'] });
  };

  const act = useMutation({
    mutationFn: async (action: 'send' | 'accept' | 'decline') => {
      const id = invoice.data!.id;
      const path =
        action === 'send'
          ? ApiPaths.marketplace.invoiceSend(id)
          : action === 'accept'
            ? ApiPaths.marketplace.invoiceAccept(id)
            : ApiPaths.marketplace.invoiceDecline(id);
      return post(path, {});
    },
    onSuccess: (_d, action) => {
      setConfirm(null);
      toast.success(action === 'send' ? 'Invoice sent to the customer' : action === 'accept' ? 'Invoice accepted' : 'Invoice declined');
      refresh();
    },
    onError: (err) => setError(apiErrorMessage(err, 'That did not work. Please try again.')),
  });

  if (!enabled) return null;
  if (invoice.isPending) return <MkSkeleton className="h-32 w-full rounded-2xl" />;
  if (invoice.isError) {
    return (
      <MkCard>
        <MkSectionTitle>Invoice</MkSectionTitle>
        <p className="text-[14px] text-mk-text-secondary">{apiErrorMessage(invoice.error, 'The invoice could not be loaded.')}</p>
        <MkButton variant="secondary" size="sm" className="mt-2" onClick={() => void invoice.refetch()}>
          Try again
        </MkButton>
      </MkCard>
    );
  }

  const inv = invoice.data;
  const replaceable = !inv || inv.status === 'declined' || inv.status === 'voided';
  const st = inv ? (STATUS[inv.status] ?? { label: inv.status, tone: 'neutral' as MkTone }) : null;

  return (
    <MkCard>
      <MkSectionTitle action={st ? <MkPill tone={st.tone}>{st.label}</MkPill> : undefined}>Invoice</MkSectionTitle>
      {inv && <InvoiceLines inv={inv} />}

      {role === 'freelancer' && replaceable && (
        <div className={inv ? 'mt-5 border-t border-mk-divider pt-4' : ''}>
          {inv && <p className="mb-3 text-[14px] text-mk-text-secondary">This invoice was {inv.status}. You can create a new one.</p>}
          <InvoiceForm bookingId={booking.id} onDone={refresh} />
        </div>
      )}
      {role === 'freelancer' && inv?.status === 'draft' && (
        <MkButton block className="mt-4" onClick={() => setConfirm('send')}>
          Send to customer
        </MkButton>
      )}
      {role === 'customer' && !inv && <p className="text-[14px] text-mk-text-secondary">The freelancer has not sent an invoice yet.</p>}
      {role === 'customer' && inv?.status === 'sent' && (
        <div className="mt-4 flex gap-2">
          <MkButton variant="secondary" className="flex-1" onClick={() => setConfirm('decline')}>
            Decline
          </MkButton>
          <MkButton className="flex-1" onClick={() => setConfirm('accept')}>
            Accept invoice
          </MkButton>
        </div>
      )}

      <MkConfirmDialog
        open={confirm != null}
        onOpenChange={(v) => {
          if (!v) setConfirm(null);
          setError(null);
        }}
        title={confirm === 'send' ? 'Send this invoice?' : confirm === 'accept' ? 'Accept this invoice?' : 'Decline this invoice?'}
        description={
          confirm === 'send'
            ? 'The customer will be asked to accept it. You cannot edit it after sending.'
            : confirm === 'accept'
              ? `The booking total becomes ${inv ? formatZar(money(inv.totalDue)) : 'the invoice total'}.`
              : 'The freelancer can send a new invoice. A paid connection fee is not refunded.'
        }
        confirmLabel={confirm === 'send' ? 'Send invoice' : confirm === 'accept' ? 'Accept' : 'Decline'}
        cancelLabel="Not now"
        destructive={confirm === 'decline'}
        loading={act.isPending}
        error={error}
        onConfirm={() => confirm && act.mutate(confirm)}
      />
    </MkCard>
  );
}
