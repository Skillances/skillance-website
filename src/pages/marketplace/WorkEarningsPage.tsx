import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, Printer, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import WorkGate from '@/components/marketplace/WorkGate';
import EarningsTrendChart, { type TrendPoint } from '@/components/marketplace/EarningsTrendChart';
import { MkButton, MkCard, MkEmpty, MkErrorState, MkInput, MkPageHeader, MkSectionTitle, MkSegmented, MkSelect, MkSkeleton } from '@/components/marketplace/ui';
import { apiErrorMessage, downloadBlob, listFrom } from '@/lib/marketplace/apiHelpers';
import { bookingKeys, fetchFreelancerBookings, otherParty } from '@/lib/marketplace/bookings';
import { categoryLabel, useCategories } from '@/lib/marketplace/categories';
import { money } from '@/lib/marketplace/pricing';
import { formatZar } from '@/lib/marketplace/theme';
import { formatDate, formatDuration, sastNow } from '@/lib/marketplace/time';

type Preset = 'thisWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Same presets as the app (date_range_presets.dart). Weeks run Monday to Sunday. */
function rangeFor(preset: Preset, custom: { from: string; to: string }): { from: string; to: string } {
  const today = sastNow().date;
  const [y, m, d] = today.split('-').map(Number);
  const now = new Date(Date.UTC(y, m - 1, d));
  switch (preset) {
    case 'thisWeek': {
      const dow = (now.getUTCDay() + 6) % 7;
      const start = new Date(now);
      start.setUTCDate(now.getUTCDate() - dow);
      const end = new Date(start);
      end.setUTCDate(start.getUTCDate() + 6);
      return { from: iso(start), to: iso(end) };
    }
    case 'thisMonth':
      return { from: iso(new Date(Date.UTC(y, m - 1, 1))), to: iso(new Date(Date.UTC(y, m, 0))) };
    case 'lastMonth':
      return { from: iso(new Date(Date.UTC(y, m - 2, 1))), to: iso(new Date(Date.UTC(y, m - 1, 0))) };
    case 'thisYear':
      return { from: `${y}-01-01`, to: `${y}-12-31` };
    default:
      return custom;
  }
}

function Earnings({ freelancerId }: { freelancerId: string }) {
  const categories = useCategories();
  const [preset, setPreset] = useState<Preset>('thisMonth');
  const [custom, setCustom] = useState(() => rangeFor('thisMonth', { from: '', to: '' }));
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [exporting, setExporting] = useState(false);
  const range = rangeFor(preset, custom);

  const trend = useQuery({
    queryKey: ['marketplace', 'dash', 'trend', freelancerId, period],
    queryFn: async () =>
      listFrom<TrendPoint>(await get(`${ApiPaths.marketplace.freelancerEarningsTrend(freelancerId)}?period=${period}&count=${period === 'weekly' ? 12 : 12}`)),
  });
  const jobs = useQuery({ queryKey: bookingKeys.freelancer(freelancerId), queryFn: () => fetchFreelancerBookings(freelancerId) });

  // As in the app's report: completed bookings whose date falls in the range, using the API booking total.
  const rows = useMemo(
    () =>
      (jobs.data?.items ?? [])
        .filter((b) => String(b.status).toLowerCase() === 'completed')
        .filter((b) => {
          const d = b.scheduledDate.slice(0, 10);
          return (!range.from || d >= range.from) && (!range.to || d <= range.to);
        })
        .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)),
    [jobs.data, range.from, range.to],
  );
  const total = rows.reduce((s, b) => s + (money(b.totalPrice) ?? 0), 0);

  const exportXlsx = async () => {
    setExporting(true);
    try {
      const { default: ExcelJS } = await import('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Earnings');
      ws.columns = [
        { header: 'Date', key: 'date', width: 14 },
        { header: 'Time', key: 'time', width: 8 },
        { header: 'Customer', key: 'customer', width: 26 },
        { header: 'Service', key: 'service', width: 30 },
        { header: 'Duration (min)', key: 'duration', width: 14 },
        { header: 'Total (ZAR)', key: 'total', width: 14 },
      ];
      ws.getRow(1).font = { bold: true };
      for (const b of rows) {
        ws.addRow({
          date: b.scheduledDate.slice(0, 10),
          time: b.scheduledTime,
          customer: otherParty(b, 'freelancer').name,
          service: b.category ? categoryLabel(categories.data, b.category) : '',
          duration: b.durationMinutes,
          total: money(b.totalPrice) ?? 0,
        });
      }
      ws.addRow({});
      ws.addRow({ service: 'Total', total }).font = { bold: true };
      ws.getColumn('total').numFmt = '#,##0.00';
      const buf = await wb.xlsx.writeBuffer();
      downloadBlob(
        new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `skillance-earnings-${range.from}-to-${range.to}.xlsx`,
      );
    } catch {
      toast.error('Could not create the spreadsheet.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <MkPageHeader back="/work" title="Earnings" subtitle="Completed bookings and your earnings trend." />

      <MkCard className="mk-no-print space-y-3">
        <MkSelect label="Period" value={preset} onChange={(e) => setPreset(e.target.value as Preset)}>
          <option value="thisWeek">This week</option>
          <option value="thisMonth">This month</option>
          <option value="lastMonth">Last month</option>
          <option value="thisYear">This year</option>
          <option value="custom">Custom range</option>
        </MkSelect>
        {preset === 'custom' && (
          <div className="grid grid-cols-2 gap-3">
            <MkInput label="From" type="date" value={custom.from} max={custom.to || undefined} onChange={(e) => setCustom({ ...custom, from: e.target.value })} />
            <MkInput label="To" type="date" value={custom.to} min={custom.from || undefined} onChange={(e) => setCustom({ ...custom, to: e.target.value })} />
          </div>
        )}
      </MkCard>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-mk-border p-4">
          <p className="text-[13px] text-mk-text-secondary">Completed jobs</p>
          <p className="mt-1 font-mk-display text-[24px] font-bold">{jobs.isPending ? '-' : rows.length}</p>
        </div>
        <div className="rounded-2xl border border-mk-border p-4">
          <p className="text-[13px] text-mk-text-secondary">Booking totals</p>
          <p className="mt-1 font-mk-display text-[24px] font-bold">{jobs.isPending ? '-' : formatZar(total)}</p>
        </div>
      </div>
      <p className="text-[13px] text-mk-text-tertiary">
        Totals are what customers were charged for completed bookings in this period. They are not payout confirmations.
      </p>

      <section className="mk-no-print">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-[17px]">{period === 'weekly' ? 'Weekly earnings, last 12 weeks' : 'Monthly earnings, last 12 months'}</h2>
          <div className="w-44">
            <MkSegmented
              label="Trend period"
              value={period}
              onChange={setPeriod}
              options={[
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
            />
          </div>
        </div>
        <MkCard>
          {trend.isPending ? (
            <MkSkeleton className="h-56 w-full" />
          ) : trend.isError ? (
            <MkErrorState message={apiErrorMessage(trend.error)} onRetry={() => void trend.refetch()} />
          ) : (
            <EarningsTrendChart points={trend.data ?? []} label={period === 'weekly' ? 'Weekly earnings' : 'Monthly earnings'} />
          )}
        </MkCard>
      </section>

      <section>
        <MkSectionTitle
          action={
            <div className="mk-no-print flex gap-2">
              <MkButton variant="secondary" size="sm" disabled={rows.length === 0} loading={exporting} onClick={() => void exportXlsx()}>
                {!exporting && <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />} Excel
              </MkButton>
              <MkButton variant="secondary" size="sm" disabled={rows.length === 0} onClick={() => window.print()}>
                <Printer className="h-4 w-4" aria-hidden="true" /> Print or PDF
              </MkButton>
            </div>
          }
        >
          Completed bookings, {formatDate(range.from)} to {formatDate(range.to)}
        </MkSectionTitle>
        {jobs.isPending ? (
          <MkSkeleton className="h-40 w-full rounded-2xl" />
        ) : jobs.isError ? (
          <MkErrorState message={apiErrorMessage(jobs.error)} onRetry={() => void jobs.refetch()} retrying={jobs.isRefetching} />
        ) : rows.length === 0 ? (
          <MkEmpty icon={<Wallet className="h-6 w-6" aria-hidden="true" />} title="No completed bookings in this period" body="Pick a longer period, or check your upcoming jobs." action={<Link to="/work/jobs" className="font-semibold underline underline-offset-2">View jobs</Link>} />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-mk-border">
            <table className="w-full min-w-[560px] text-left text-[14px]">
              <thead className="bg-mk-muted text-[12px] uppercase tracking-wide text-mk-text-secondary">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Service</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Duration</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mk-divider">
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3">
                      <Link to={`/bookings/${b.id}`} className="underline-offset-2 hover:underline">
                        {formatDate(b.scheduledDate)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{otherParty(b, 'freelancer').name}</td>
                    <td className="px-4 py-3">{b.category ? categoryLabel(categories.data, b.category) : ''}</td>
                    <td className="px-4 py-3">{formatDuration(b.durationMinutes)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatZar(money(b.totalPrice))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-mk-border font-mk-display font-semibold">
                  <td className="px-4 py-3" colSpan={4}>
                    Total
                  </td>
                  <td className="px-4 py-3 text-right">{formatZar(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        {(jobs.data?.hasMore ?? false) && <p className="mt-2 text-[12px] text-mk-text-tertiary">Report covers up to 200 of your bookings.</p>}
      </section>
    </div>
  );
}

export default function WorkEarningsPage() {
  return <WorkGate title="Earnings">{(fid) => <Earnings freelancerId={fid} />}</WorkGate>;
}
