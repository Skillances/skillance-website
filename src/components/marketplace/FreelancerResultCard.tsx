import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, MapPin, ShieldCheck } from 'lucide-react';
import { MkAvatar, MkRating } from '@/components/marketplace/ui';
import { categoryLabel, type CategoryNode } from '@/lib/marketplace/categories';
import { listingPriceLabel } from '@/lib/marketplace/pricing';
import { isIdVerified, type FreelancerSummary } from '@/lib/marketplace/search';

/** Search, category, and favorites row. Links to the public profile. */
export default function FreelancerResultCard({
  freelancer: f,
  categories,
  action,
}: {
  freelancer: FreelancerSummary;
  categories?: CategoryNode[];
  /** Optional trailing control (e.g. remove from favorites). Sits outside the link. */
  action?: ReactNode;
}) {
  const primaryCategory = f.categoryIds?.[0] ? categoryLabel(categories, f.categoryIds[0]) : null;
  const city = f.serviceLocations?.find((l) => l.isPrimary)?.city ?? f.serviceLocations?.[0]?.city ?? null;
  const name = f.fullName || 'Skillance freelancer';

  return (
    <div className="relative flex items-stretch gap-2 rounded-2xl border border-mk-border bg-mk-surface transition-shadow duration-200 ease-out hover:shadow-mk-card">
      <Link
        to={`/freelancers/${f.id}`}
        className="flex min-w-0 flex-1 items-center gap-3.5 rounded-2xl p-4 focus-visible:outline-offset-[-2px]"
      >
        <MkAvatar src={f.profilePhotoUrl} name={name} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-mk-display text-[15px] font-semibold">{name}</p>
            {isIdVerified(f) && <BadgeCheck className="h-4 w-4 shrink-0 text-mk-info" aria-label="ID verified" />}
            {f.policeClearanceStatus === 'verified' && (
              <ShieldCheck className="h-4 w-4 shrink-0 text-mk-success" aria-label="Police clearance verified" />
            )}
          </div>
          {primaryCategory && <p className="truncate text-[13px] text-mk-text-secondary">{primaryCategory}</p>}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <MkRating value={f.rating} count={f.totalReviews} />
            {typeof f.distance === 'number' && Number.isFinite(f.distance) ? (
              <span className="inline-flex items-center gap-1 text-[13px] text-mk-text-secondary">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {f.distance < 1 ? '<1' : f.distance.toFixed(f.distance < 10 ? 1 : 0)} km
              </span>
            ) : city ? (
              <span className="inline-flex items-center gap-1 text-[13px] text-mk-text-secondary">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {city}
              </span>
            ) : null}
          </div>
        </div>
        <p className="shrink-0 self-start text-right font-mk-display text-[14px] font-semibold">{listingPriceLabel(f)}</p>
      </Link>
      {action && <div className="flex items-center pr-2">{action}</div>}
    </div>
  );
}
