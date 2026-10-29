import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { post, put } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import {
  activeView,
  isStaff,
  marketplacePathForView,
  type MarketplaceUser,
} from '@/lib/marketplace/session';
import { apiErrorMessage } from '@/lib/marketplace/apiHelpers';
import { cn } from '@/lib/utils';

export type AppView = 'customer' | 'freelancer' | 'admin';

function currentAppView(user: MarketplaceUser | null, pathname: string): AppView {
  if (pathname.startsWith('/admin')) return 'admin';
  if (!user) return 'customer';
  return activeView(user);
}

type ViewSwitcherProps = {
  compact?: boolean;
  /** Admin sidebar styling; default is marketplace chrome. */
  surface?: 'marketplace' | 'admin';
};

export default function ViewSwitcher({ compact, surface = 'marketplace' }: ViewSwitcherProps) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState(false);

  if (!user) return null;

  const staff = isStaff(user);
  const showToggle = user.canSwitchView && !staff;
  const showPicker = staff;

  if (!showToggle && !showPicker) return null;

  const current = currentAppView(user, location.pathname);

  const switchMarketplaceView = async (target: 'customer' | 'freelancer') => {
    let customerId = user.customerId;
    if (target === 'customer' && !customerId) {
      setPending(true);
      try {
        await post(ApiPaths.marketplace.syncCustomerProfile, {});
        const fresh = await refreshUser();
        customerId = fresh?.customerId ?? null;
      } catch (err) {
        toast.error(apiErrorMessage(err, 'Could not load your customer profile.'));
        return;
      } finally {
        setPending(false);
      }
      if (!customerId) {
        toast.error('No customer profile on this account.');
        return;
      }
    }
    if (target === 'freelancer' && !user.freelancerId) {
      toast.error('No freelancer profile on this account.');
      return;
    }
    if (current === target) {
      navigate(marketplacePathForView(target), { replace: true });
      return;
    }

    setPending(true);
    try {
      await put(ApiPaths.marketplace.preferredView, { view: target });
      await refreshUser();
      navigate(marketplacePathForView(target), { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not switch view.'));
    } finally {
      setPending(false);
    }
  };

  const goAdmin = () => {
    if (current !== 'admin') navigate('/admin/dashboard', { replace: true });
  };

  if (showPicker) {
    const selectClass =
      surface === 'admin'
        ? 'w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-[13px] font-medium text-black dark:text-white disabled:opacity-60'
        : cn(
            'w-full rounded-xl border border-mk-border bg-mk-surface px-3 py-2 font-mk-display text-[13px] font-semibold text-mk-text-primary disabled:opacity-60',
            compact && 'max-w-[11rem]',
          );

    return (
      <label className={cn('block', compact ? '' : 'w-full')}>
        <span className="sr-only">Switch view</span>
        <select
          className={selectClass}
          value={current}
          disabled={pending}
          aria-busy={pending || undefined}
          onChange={(e) => {
            const next = e.target.value as AppView;
            if (next === 'admin') void goAdmin();
            else void switchMarketplaceView(next);
          }}
        >
          {user.customerId ? <option value="customer">Customer view</option> : null}
          {user.freelancerId ? <option value="freelancer">Freelancer view</option> : null}
          <option value="admin">Admin dashboard</option>
        </select>
      </label>
    );
  }

  const target = current === 'freelancer' ? 'customer' : 'freelancer';

  return (
    <button
      type="button"
      onClick={() => void switchMarketplaceView(target)}
      disabled={pending}
      aria-busy={pending || undefined}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-mk-border bg-mk-surface font-mk-display text-[13px] font-semibold text-mk-text-primary',
        'transition-[background-color,transform,opacity] duration-150 ease-out hover:bg-mk-muted active:scale-[0.97] motion-reduce:active:scale-100 disabled:opacity-60',
        compact ? 'px-3' : 'w-full px-4',
      )}
    >
      <Repeat className="h-4 w-4" aria-hidden="true" />
      {target === 'freelancer' ? 'Switch to freelancer' : 'Switch to customer'}
    </button>
  );
}
