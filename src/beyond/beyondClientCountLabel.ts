/** Copy for published Beyond work rows (admin → GET /public/beyond-work). */
export function beyondActiveClientLabel(ready: boolean, count: number): string {
  if (!ready) return 'Updating client count…';
  if (count > 0) return `${count} active client${count === 1 ? '' : 's'}`;
  return 'Portfolio growing';
}
