import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { mkColors, mkFonts, formatZar } from '@/lib/marketplace/theme';
import { formatDate } from '@/lib/marketplace/time';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export type TrendPoint = { date: string; amount: number };

/**
 * Single-series earnings trend (amounts from the API, in rand). One series, so no legend box: the
 * surrounding title names it. 2px line, recessive grid, hover tooltip, and a table for screen readers.
 */
export default function EarningsTrendChart({ points, label }: { points: TrendPoint[]; label: string }) {
  const reduced = usePrefersReducedMotion();
  const data = points.map((p) => ({ ...p, amount: Number(p.amount) || 0 }));
  return (
    <figure>
      <div className="h-56 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="mk-earn-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={mkColors.primary} stopOpacity={0.12} />
                <stop offset="100%" stopColor={mkColors.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={mkColors.divider} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: mkColors.textTertiary, fontSize: 11, fontFamily: mkFonts.body }}
              tickFormatter={(d: string) => formatDate(d, { weekday: false, year: false })}
              minTickGap={24}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fill: mkColors.textTertiary, fontSize: 11, fontFamily: mkFonts.body }}
              tickFormatter={(v: number) => (v >= 1000 ? `R${Math.round(v / 1000)}k` : `R${v}`)}
            />
            <Tooltip
              cursor={{ stroke: mkColors.border, strokeWidth: 1 }}
              contentStyle={{
                borderRadius: 12,
                border: `1px solid ${mkColors.border}`,
                boxShadow: 'none',
                fontFamily: mkFonts.body,
                fontSize: 13,
                color: mkColors.textPrimary,
              }}
              labelFormatter={(d) => formatDate(String(d))}
              formatter={(v) => [formatZar(Number(v)), 'Earnings']}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke={mkColors.primary}
              strokeWidth={2}
              fill="url(#mk-earn-fill)"
              activeDot={{ r: 5, stroke: mkColors.surface, strokeWidth: 2, fill: mkColors.primary }}
              isAnimationActive={!reduced}
              animationDuration={350}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Period starting</th>
            <th scope="col">Earnings</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.date}>
              <td>{formatDate(p.date)}</td>
              <td>{formatZar(p.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
