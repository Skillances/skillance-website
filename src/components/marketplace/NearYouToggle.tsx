import { Loader2, LocateFixed, X } from 'lucide-react';
import { clearBrowserLocation, requestBrowserLocation, useBrowserLocation } from '@/lib/marketplace/search';
import { cn } from '@/lib/utils';

/** Opt-in "near you" control. Asks the browser for a position only on tap. */
export default function NearYouToggle() {
  const loc = useBrowserLocation();
  const on = loc.status === 'granted';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-pressed={on}
        onClick={() => (on ? clearBrowserLocation() : requestBrowserLocation())}
        disabled={loc.status === 'locating'}
        className={cn(
          'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-mk-display text-[13px] font-semibold transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] motion-reduce:active:scale-100',
          on ? 'border-mk-accent text-mk-text-primary' : 'border-mk-border text-mk-text-primary hover:bg-mk-muted',
        )}
      >
        {loc.status === 'locating' ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <LocateFixed className={cn('h-4 w-4', on && 'text-mk-accent')} aria-hidden="true" />
        )}
        {on ? 'Near you' : 'Use my location'}
        {on && <X className="h-3.5 w-3.5 text-mk-text-tertiary" aria-hidden="true" />}
      </button>
      {loc.status === 'denied' && <span className="text-[13px] text-mk-text-secondary">{loc.message}</span>}
    </div>
  );
}
