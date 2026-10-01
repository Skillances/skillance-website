import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, BadgeCheck, FileText, Heart, Images, Share2, ShieldCheck, Star } from 'lucide-react';
import { toast } from 'sonner';
import { del, get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import {
  MkAvatar,
  MkCard,
  MkErrorState,
  MkIconButton,
  MkLinkButton,
  MkRating,
  MkSectionTitle,
  MkSkeleton,
  MkSwap,
} from '@/components/marketplace/ui';
import { apiErrorMessage, unwrap } from '@/lib/marketplace/apiHelpers';
import { categoryLabel, useCategories } from '@/lib/marketplace/categories';
import { listingPriceLabel, money, rateLabel } from '@/lib/marketplace/pricing';
import { isIdVerified } from '@/lib/marketplace/search';
import { formatZar, mkMotion } from '@/lib/marketplace/theme';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

type PublicProfile = {
  id: string;
  userId?: string;
  fullName?: string;
  tag?: string | null;
  profilePhotoUrl?: string | null;
  coverPhotoUrl?: string | null;
  bio?: string | null;
  categoryIds?: string[];
  hourlyRate?: number | string | null;
  categoryRates?: { categoryId: string; hourlyRate: number | string; bookingPricingMode?: string }[];
  certifications?: string[];
  credentialProofVerifiedNames?: string[];
  rating?: number | null;
  totalReviews?: number | null;
  isVerified?: boolean;
  idVerificationStatus?: string;
  policeClearanceStatus?: string;
  serviceRadius?: number | null;
  serviceLocations?: { id: string; label?: string | null; city?: string | null; serviceRadius?: number | null; isPrimary?: boolean }[];
  acceptsRecurringBookings?: boolean;
};

type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customer?: { fullName?: string; profilePhotoUrl?: string | null };
};

type Project = { id: string; title: string; description?: string | null; imageUrls?: string[] };
type Product = { id: string; title: string; description?: string | null; price: string | number; fileType?: string };

/** The site's own public profile URL (not the app QR deep link). */
const shareUrl = (id: string) => `https://skillance.co.za/freelancers/${id}`;

function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="border-t border-mk-divider pt-6">
      <MkSectionTitle action={action}>{title}</MkSectionTitle>
      {children}
    </section>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading profile">
      <MkSkeleton className="h-36 w-full rounded-2xl" />
      <div className="flex items-center gap-4">
        <MkSkeleton className="h-20 w-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <MkSkeleton className="h-6 w-1/2" />
          <MkSkeleton className="h-4 w-1/3" />
        </div>
      </div>
      <MkSkeleton className="h-24 w-full rounded-2xl" />
      <MkSkeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}

function FavoriteButton({ freelancerId }: { freelancerId: string }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const reduced = usePrefersReducedMotion();
  const status = useQuery({
    queryKey: ['marketplace', 'favorite', freelancerId],
    enabled: isAuthenticated,
    queryFn: async () => unwrap<{ isFavorite?: boolean }>(await get(ApiPaths.marketplace.favoriteStatus(freelancerId))).isFavorite === true,
  });
  const toggle = useMutation({
    mutationFn: async (next: boolean) => {
      if (next) await post(ApiPaths.marketplace.favorites, { freelancerId });
      else await del(ApiPaths.marketplace.favoriteRemove(freelancerId));
      return next;
    },
    onMutate: async (next) => {
      qc.setQueryData(['marketplace', 'favorite', freelancerId], next);
    },
    onError: (err, next) => {
      qc.setQueryData(['marketplace', 'favorite', freelancerId], !next);
      toast.error(apiErrorMessage(err, 'Could not update favorites.'));
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['marketplace', 'favorites'] });
    },
  });

  const on = status.data === true;
  return (
    <MkIconButton
      label={on ? 'Remove from favorites' : 'Save to favorites'}
      aria-pressed={on}
      className="bg-mk-surface shadow-mk-avatar"
      disabled={toggle.isPending || (isAuthenticated && status.isPending)}
      onClick={() => {
        if (!isAuthenticated) {
          navigate('/login', { state: { from: location } });
          return;
        }
        toggle.mutate(!on);
      }}
    >
      <motion.span
        key={on ? 'on' : 'off'}
        initial={reduced ? false : { scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: mkMotion.control, ease: mkMotion.ease }}
        className="inline-flex"
      >
        <Heart className={cn('h-5 w-5', on && 'text-mk-error')} fill={on ? 'currentColor' : 'none'} aria-hidden="true" />
      </motion.span>
    </MkIconButton>
  );
}

function Reviews({ freelancerId }: { freelancerId: string }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const reviews = useQuery({
    queryKey: ['marketplace', 'reviews', freelancerId],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await get(`${ApiPaths.marketplace.freelancerReviews(freelancerId)}?page=1&limit=20`);
      return (unwrap<{ reviews?: Review[] }>(res).reviews ?? []) as Review[];
    },
  });

  if (!isAuthenticated) {
    return (
      <p className="text-[14px] text-mk-text-secondary">
        <Link to="/login" state={{ from: location }} className="font-semibold text-mk-text-primary underline underline-offset-2">
          Sign in
        </Link>{' '}
        to read reviews from customers.
      </p>
    );
  }
  if (reviews.isPending) {
    return (
      <div className="space-y-3">
        <MkSkeleton className="h-16 w-full" />
        <MkSkeleton className="h-16 w-full" />
      </div>
    );
  }
  if (reviews.isError) {
    return (
      <MkErrorState
        message={apiErrorMessage(reviews.error, 'Reviews are unavailable.')}
        onRetry={() => void reviews.refetch()}
        retrying={reviews.isRefetching}
      />
    );
  }
  if ((reviews.data ?? []).length === 0) {
    return <p className="text-[14px] text-mk-text-secondary">No reviews yet. Book a session and be the first to leave one.</p>;
  }
  return (
    <ul className="space-y-4">
      {reviews.data.map((r) => (
        <li key={r.id} className="flex gap-3">
          <MkAvatar src={r.customer?.profilePhotoUrl} name={r.customer?.fullName} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2">
              <p className="font-mk-display text-[14px] font-semibold">{r.customer?.fullName || 'Customer'}</p>
              <span className="inline-flex" aria-label={`${r.rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={cn('h-3.5 w-3.5', i < r.rating ? 'text-mk-rating' : 'text-mk-border')}
                    fill="currentColor"
                    aria-hidden="true"
                  />
                ))}
              </span>
              <span className="text-[12px] text-mk-text-tertiary">{new Date(r.createdAt).toLocaleDateString('en-ZA')}</span>
            </div>
            {r.comment && <p className="mt-1 text-[14px] leading-relaxed text-mk-text-secondary">{r.comment}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function FreelancerProfilePage() {
  const { freelancerId = '' } = useParams();
  const { isAuthenticated } = useAuth();
  const categories = useCategories();
  const [showAllCats, setShowAllCats] = useState(false);

  const profile = useQuery({
    queryKey: ['marketplace', 'freelancer', freelancerId],
    queryFn: async () => unwrap<PublicProfile>(await get(ApiPaths.marketplace.freelancer(freelancerId))),
  });
  const portfolio = useQuery({
    queryKey: ['marketplace', 'portfolio', freelancerId],
    queryFn: async () => (unwrap<Project[]>(await get(ApiPaths.marketplace.freelancerPortfolio(freelancerId))) ?? []) as Project[],
  });
  const products = useQuery({
    queryKey: ['marketplace', 'products', 'freelancer', freelancerId],
    queryFn: async () => (unwrap<Product[]>(await get(ApiPaths.marketplace.freelancerProducts(freelancerId))) ?? []) as Product[],
  });

  const bookPath = `/freelancers/${freelancerId}/book`;
  const state = profile.isPending ? 'loading' : profile.isError ? 'error' : 'ready';

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(freelancerId));
      toast.success('Profile link copied');
    } catch {
      toast.error('Could not copy the link. Copy it from the address bar instead.');
    }
  };

  return (
    <MkSwap id={state}>
      {state === 'loading' && <ProfileSkeleton />}
      {state === 'error' && (
        <MkErrorState
          message={apiErrorMessage(profile.error, 'This profile could not be loaded. It may no longer be available.')}
          onRetry={() => void profile.refetch()}
          retrying={profile.isRefetching}
        />
      )}
      {state === 'ready' && profile.data && (
        <ProfileBody
          p={profile.data}
          categoriesLabel={(id) => categoryLabel(categories.data, id)}
          showAllCats={showAllCats}
          onToggleCats={() => setShowAllCats((v) => !v)}
          onShare={onShare}
          favorite={<FavoriteButton freelancerId={freelancerId} />}
          portfolio={portfolio}
          products={products}
          bookAction={
            isAuthenticated ? (
              <MkLinkButton to={bookPath} block className="h-12">
                Book now
              </MkLinkButton>
            ) : (
              <MkLinkButton to="/login" state={{ from: bookPath }} block className="h-12">
                Sign in to book
              </MkLinkButton>
            )
          }
        />
      )}
    </MkSwap>
  );
}

function ProfileBody({
  p,
  categoriesLabel,
  showAllCats,
  onToggleCats,
  onShare,
  favorite,
  portfolio,
  products,
  bookAction,
}: {
  p: PublicProfile;
  categoriesLabel: (id: string) => string;
  showAllCats: boolean;
  onToggleCats: () => void;
  onShare: () => void;
  favorite: ReactNode;
  portfolio: { data?: Project[]; isPending: boolean; isError: boolean; error: unknown; refetch: () => unknown };
  products: { data?: Product[]; isPending: boolean; isError: boolean; error: unknown; refetch: () => unknown };
  bookAction: ReactNode;
}) {
  const name = p.fullName || 'Skillance freelancer';
  const verified = isIdVerified(p);
  const cats = p.categoryIds ?? [];
  const shownCats = showAllCats ? cats : cats.slice(0, 5);
  const rateFor = (id: string) => p.categoryRates?.find((r) => r.categoryId === id);
  const verifiedCerts = new Set(p.credentialProofVerifiedNames ?? []);

  return (
    <div className="pb-24 lg:pb-0">
      {/* Cover with share and favorite */}
      <div className="relative -mx-4 h-36 overflow-hidden bg-mk-muted sm:mx-0 sm:h-44 sm:rounded-2xl">
        {p.coverPhotoUrl && <img src={p.coverPhotoUrl} alt="" className="h-full w-full object-cover" />}
        <div className="absolute right-3 top-3 flex gap-2">
          <MkIconButton label="Copy profile link" className="bg-mk-surface shadow-mk-avatar" onClick={onShare}>
            <Share2 className="h-5 w-5" aria-hidden="true" />
          </MkIconButton>
          {favorite}
        </div>
      </div>

      {!verified && (
        <div className="mt-4 flex gap-3 rounded-2xl border border-mk-border p-3.5 text-[14px]" role="note">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-mk-warning" aria-hidden="true" />
          <p className="text-mk-text-secondary">This freelancer has not completed ID verification yet. Take care when sharing personal details.</p>
        </div>
      )}

      {/* Header */}
      <div className="-mt-10 flex items-end gap-4 px-1 sm:-mt-12">
        <span className="rounded-full border-4 border-mk-surface shadow-mk-avatar">
          <MkAvatar src={p.profilePhotoUrl} name={name} size={88} />
        </span>
      </div>
      <div className="mt-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[24px] font-bold leading-tight tracking-tight">{name}</h1>
          {verified && (
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-mk-info">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" /> ID verified
            </span>
          )}
          {p.policeClearanceStatus === 'verified' && (
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-mk-success">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Police clearance
            </span>
          )}
        </div>
        {p.tag && <p className="mt-0.5 text-[14px] text-mk-text-tertiary">@{p.tag}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <MkRating value={p.rating} count={p.totalReviews} size={16} />
          <span className="font-mk-display text-[15px] font-semibold">{listingPriceLabel(p)}</span>
        </div>
      </div>

      <div className="mt-6 hidden lg:block lg:max-w-xs">{bookAction}</div>

      <div className="mt-6 space-y-6">
        {cats.length > 0 && (
          <Section
            title="Service categories"
            action={
              cats.length > 5 ? (
                <button type="button" onClick={onToggleCats} className="min-h-11 text-[13px] font-semibold text-mk-text-secondary hover:text-mk-text-primary">
                  {showAllCats ? 'Show less' : `Show all ${cats.length}`}
                </button>
              ) : undefined
            }
          >
            <ul className="divide-y divide-mk-divider rounded-2xl border border-mk-border">
              <AnimatePresence initial={false}>
                {shownCats.map((id) => {
                  const r = rateFor(id);
                  return (
                    <motion.li
                      key={id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: mkMotion.control }}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <span className="text-[14px]">{categoriesLabel(id)}</span>
                      <span className="shrink-0 font-mk-display text-[14px] font-semibold">{r ? rateLabel(r) : '-'}</span>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </Section>
        )}

        <Section title="About">
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-mk-text-secondary">{p.bio?.trim() || 'No bio yet.'}</p>
        </Section>

        {(p.certifications ?? []).length > 0 && (
          <Section title="Certifications">
            <ul className="flex flex-wrap gap-2">
              {(p.certifications ?? []).map((c) => (
                <li key={c} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-mk-border px-3 text-[13px]">
                  {verifiedCerts.has(c) && <BadgeCheck className="h-4 w-4 text-mk-success" aria-label="Verified document" />}
                  {c}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="Previous work">
          {portfolio.isPending ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <MkSkeleton className="aspect-[4/3] rounded-2xl" />
              <MkSkeleton className="aspect-[4/3] rounded-2xl" />
            </div>
          ) : portfolio.isError ? (
            <MkErrorState message={apiErrorMessage(portfolio.error)} onRetry={() => void portfolio.refetch()} />
          ) : (portfolio.data ?? []).length === 0 ? (
            <p className="flex items-center gap-2 text-[14px] text-mk-text-secondary">
              <Images className="h-4 w-4" aria-hidden="true" /> No previous work shared yet.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(portfolio.data ?? []).map((proj) => (
                <li key={proj.id}>
                  <MkCard className="overflow-hidden p-0">
                    {proj.imageUrls?.[0] && (
                      <img src={proj.imageUrls[0]} alt={proj.title} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                    )}
                    <div className="p-3.5">
                      <p className="font-mk-display text-[14px] font-semibold">{proj.title}</p>
                      {proj.description && <p className="mt-1 line-clamp-2 text-[13px] text-mk-text-secondary">{proj.description}</p>}
                      {(proj.imageUrls?.length ?? 0) > 1 && (
                        <p className="mt-1 text-[12px] text-mk-text-tertiary">{proj.imageUrls!.length} photos</p>
                      )}
                    </div>
                  </MkCard>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {(p.serviceLocations ?? []).length > 0 ? (
          <Section title="Service areas">
            <ul className="flex flex-wrap gap-2">
              {(p.serviceLocations ?? []).map((l) => (
                <li key={l.id} className="inline-flex min-h-9 items-center rounded-full bg-mk-muted px-3 text-[13px]">
                  {[l.label, l.city].filter(Boolean).join(', ') || 'Service area'}
                  {l.serviceRadius ? ` (${l.serviceRadius} km)` : ''}
                </li>
              ))}
            </ul>
          </Section>
        ) : p.serviceRadius ? (
          <Section title="Service area">
            <p className="text-[14px] text-mk-text-secondary">Works within {p.serviceRadius} km.</p>
          </Section>
        ) : null}

        {(products.data ?? []).length > 0 && (
          <Section title="Digital products">
            <ul className="space-y-2">
              {(products.data ?? []).map((pr) => (
                <li key={pr.id} className="flex items-center gap-3 rounded-2xl border border-mk-border p-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mk-muted">
                    <FileText className="h-5 w-5 text-mk-text-secondary" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mk-display text-[14px] font-semibold">{pr.title}</p>
                    {pr.description && <p className="truncate text-[13px] text-mk-text-secondary">{pr.description}</p>}
                  </div>
                  <span className="shrink-0 font-mk-display text-[14px] font-semibold">{formatZar(money(pr.price))}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[13px] text-mk-text-tertiary">Buying digital products is not available on the web yet.</p>
          </Section>
        )}

        <Section title="Reviews">
          <Reviews freelancerId={p.id} />
        </Section>
      </div>

      {/* Primary action stays visible on phones */}
      <div className="mk-no-print fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-20 border-t border-mk-divider bg-mk-surface px-4 py-3 lg:hidden">
        {bookAction}
      </div>
    </div>
  );
}
