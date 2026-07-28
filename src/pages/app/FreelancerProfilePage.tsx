import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star,
  Heart,
  MessageCircle,
  Calendar,
  MapPin,
  Briefcase,
  ShieldCheck,
  BadgeCheck,
  Info,
  Copy,
  Repeat,
} from 'lucide-react';
import { get, post, del } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/components/app/RequireAuth';
import type { CategoryNode, FreelancerDetail, FreelancerReview } from '@/types/product';
import {
  computeListingRateDisplay,
  formatCurrency,
  formatDeliveryMode,
  formatTagForDisplay,
  getCategoryDisplayName,
  hourlyAmount,
  isInvoiceMode,
  rateRowForCategoryId,
} from '@/lib/categoryDisplay';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const SERVICE_CATEGORIES_COLLAPSED_LIMIT = 5;

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-neutral-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}

function formatReviewDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function FreelancerProfilePage() {
  const { freelancerId } = useParams<{ freelancerId: string }>();
  const id = freelancerId ?? '';
  const { isAuthenticated } = useAuth();
  const requireAuth = useRequireAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: async () => {
      const res = await get(ApiPaths.categories.list);
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      return Array.isArray(data) ? (data as CategoryNode[]) : [];
    },
  });

  const { data: freelancer, isPending } = useQuery({
    queryKey: queryKeys.freelancers.detail(id),
    queryFn: async () => {
      const res = await get(ApiPaths.freelancers.byId(id));
      const raw = (res?.data?.freelancer ?? res?.data ?? res) as FreelancerDetail;
      return {
        ...raw,
        portfolioProjects: raw.portfolioProjects ?? raw.portfolio ?? [],
      };
    },
    enabled: Boolean(id),
  });

  const { data: isFavorite = false } = useQuery({
    queryKey: queryKeys.favorites.status(id),
    queryFn: async () => {
      const res = await get(ApiPaths.favorites.status(id));
      return Boolean(res?.data?.isFavorite ?? res?.isFavorite);
    },
    enabled: isAuthenticated && Boolean(id),
  });

  const { data: reviewsData, isPending: reviewsLoading } = useQuery({
    queryKey: queryKeys.freelancers.reviews(id),
    queryFn: async () => {
      const res = await get(`${ApiPaths.freelancers.reviews(id)}?page=1&limit=20`);
      const data = res?.data ?? res;
      return {
        reviews: (data?.reviews ?? []) as FreelancerReview[],
        total: Number(data?.total ?? 0),
      };
    },
    enabled: isAuthenticated && Boolean(id),
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await del(ApiPaths.favorites.remove(id));
      } else {
        await post(ApiPaths.favorites.add, { freelancerId: id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.status(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.list() });
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    },
    onError: () => toast.error('Could not update favorite'),
  });

  const listingRate = useMemo(
    () => computeListingRateDisplay(freelancer?.hourlyRate, freelancer?.categoryRates),
    [freelancer?.hourlyRate, freelancer?.categoryRates],
  );

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Freelancer not found.</p>
        <Link to="/app/search" className="text-sm underline mt-2 inline-block">
          Back to search
        </Link>
      </div>
    );
  }

  const initials = freelancer.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const rating = freelancer.rating ?? freelancer.averageRating;
  const totalReviews = freelancer.totalReviews ?? freelancer.reviewCount ?? 0;
  const isIdVerified =
    freelancer.isVerified ||
    freelancer.idVerificationStatus === 'verified';
  const isPoliceClearanceVerified = freelancer.policeClearanceStatus === 'verified';
  const showUnverifiedWarning = !isIdVerified;

  const categoryIds = freelancer.categoryIds ?? [];
  const overCategoryLimit = categoryIds.length > SERVICE_CATEGORIES_COLLAPSED_LIMIT;
  const visibleCategoryIds =
    !categoriesExpanded && overCategoryLimit
      ? categoryIds.slice(0, SERVICE_CATEGORIES_COLLAPSED_LIMIT)
      : categoryIds;

  const portfolioProjects = freelancer.portfolioProjects ?? [];

  const copyToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`Copied ${label}`);
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {freelancer.coverPhotoUrl ? (
        <div className="relative -mx-4 sm:mx-0 sm:rounded-2xl overflow-hidden h-40 sm:h-48">
          <img
            src={freelancer.coverPhotoUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ) : null}

      {showUnverifiedWarning ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3 items-start">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-neutral-800">
            This freelancer has not completed ID verification.
          </p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <div className="flex gap-4">
          <Avatar className="h-20 w-20 shrink-0 border-2 border-white shadow-sm">
            <AvatarImage src={freelancer.profilePhotoUrl ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-neutral-900">{freelancer.fullName}</h1>
              {isIdVerified ? (
                <Badge variant="secondary" className="gap-1">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  ID verified
                </Badge>
              ) : freelancer.isVerified ? (
                <Badge variant="secondary">Verified</Badge>
              ) : null}
              {isPoliceClearanceVerified ? (
                <Badge variant="outline" className="gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Police clearance
                </Badge>
              ) : null}
            </div>

            {freelancer.tag ? (
              <button
                type="button"
                onClick={() => copyToClipboard('tag', formatTagForDisplay(freelancer.tag))}
                className="mt-1 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800"
              >
                {formatTagForDisplay(freelancer.tag)}
                <Copy className="h-3.5 w-3.5" />
              </button>
            ) : null}

            {rating != null ? (
              <p className="inline-flex items-center gap-1 text-sm text-neutral-600 mt-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {rating.toFixed(1)}
                {totalReviews > 0 ? ` (${totalReviews} review${totalReviews === 1 ? '' : 's'})` : ''}
              </p>
            ) : null}

            <div className="mt-2">
              {listingRate.kind === 'invoiceOnly' ? (
                <p className="text-lg font-semibold text-neutral-900">Custom quote</p>
              ) : listingRate.minHourlyAmount != null ? (
                <div>
                  <p className="text-lg font-semibold text-neutral-900">
                    {listingRate.kind === 'mixedMinHourlyWithHint' ? 'From ' : ''}
                    {formatCurrency(listingRate.minHourlyAmount)}/hour
                  </p>
                  {listingRate.showMixedServicesHint ? (
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Some services are priced on invoice
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            {freelancer.city ? (
              <p className="inline-flex items-center gap-1 text-sm text-neutral-500 mt-2">
                <MapPin className="h-4 w-4" />
                {freelancer.city}
              </p>
            ) : null}
          </div>
        </div>

        {(freelancer.responseRate != null || freelancer.totalBookingsCompleted != null) && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {freelancer.responseRate != null ? (
              <div className="rounded-xl bg-neutral-50 px-3 py-2">
                <p className="text-xs text-neutral-500">Response rate</p>
                <p className="text-sm font-medium text-neutral-900">
                  {Math.round(freelancer.responseRate)}%
                </p>
              </div>
            ) : null}
            {freelancer.totalBookingsCompleted != null ? (
              <div className="rounded-xl bg-neutral-50 px-3 py-2">
                <p className="text-xs text-neutral-500">Jobs completed</p>
                <p className="text-sm font-medium text-neutral-900">
                  {freelancer.totalBookingsCompleted}
                </p>
              </div>
            ) : null}
            {freelancer.acceptsRecurringBookings ? (
              <div className="rounded-xl bg-neutral-50 px-3 py-2">
                <p className="text-xs text-neutral-500">Recurring</p>
                <p className="text-sm font-medium text-neutral-900">Available</p>
              </div>
            ) : null}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-6">
          <Button
            className="rounded-full gap-2"
            onClick={() => requireAuth(() => navigate(`/app/freelancer/${id}/book`))}
          >
            <Calendar className="h-4 w-4" />
            Book now
          </Button>
          <Button
            variant="outline"
            className="rounded-full gap-2"
            onClick={() => requireAuth(() => navigate('/app/chat'))}
          >
            <MessageCircle className="h-4 w-4" />
            Message
          </Button>
          {isAuthenticated ? (
            <Button
              variant="outline"
              className="rounded-full gap-2"
              disabled={favoriteMutation.isPending}
              onClick={() => requireAuth(() => favoriteMutation.mutate())}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              {isFavorite ? 'Saved' : 'Save'}
            </Button>
          ) : null}
          {freelancer.acceptsRecurringBookings && categoryIds.length > 0 ? (
            <Button
              variant="outline"
              className="rounded-full gap-2"
              onClick={() =>
                requireAuth(() =>
                  navigate(
                    `/app/recurring/request?freelancerId=${id}&categoryId=${encodeURIComponent(categoryIds[0] ?? '')}`,
                  ),
                )
              }
            >
              <Repeat className="h-4 w-4" />
              Recurring
            </Button>
          ) : null}
        </div>
      </div>

      <ProfileSection title="Services">
        {categoryIds.length === 0 ? (
          <p className="text-sm text-neutral-500">No services listed yet.</p>
        ) : (
          <div className="space-y-2">
            {visibleCategoryIds.map((categoryId) => {
              const rateRow = rateRowForCategoryId(freelancer.categoryRates, categoryId);
              const invoice = isInvoiceMode(rateRow);
              const hourly = hourlyAmount(rateRow);
              return (
                <div key={categoryId} className="flex items-start gap-2 py-1">
                  <Briefcase className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                  <span className="flex-1 text-sm text-neutral-800">
                    {getCategoryDisplayName(categories, categoryId)}
                  </span>
                  {invoice ? (
                    <span className="text-sm font-medium text-neutral-900">On invoice</span>
                  ) : hourly != null ? (
                    <span className="text-sm font-medium text-neutral-900">
                      {formatCurrency(hourly)}/hour
                    </span>
                  ) : null}
                </div>
              );
            })}
            {overCategoryLimit ? (
              <button
                type="button"
                onClick={() => setCategoriesExpanded((v) => !v)}
                className="text-sm font-medium text-neutral-900 underline underline-offset-2"
              >
                {categoriesExpanded
                  ? 'Show less'
                  : `Show all ${categoryIds.length} services`}
              </button>
            ) : null}
          </div>
        )}
      </ProfileSection>

      <ProfileSection title="About">
        <p className="text-sm text-neutral-600 whitespace-pre-wrap">
          {freelancer.bio?.trim() ? freelancer.bio : 'No bio provided yet.'}
        </p>
      </ProfileSection>

      {freelancer.serviceLocations && freelancer.serviceLocations.length > 0 ? (
        <ProfileSection title="Service areas">
          <div className="space-y-3">
            {freelancer.serviceLocations.map((loc) => {
              const title = loc.label?.trim() || loc.city || 'Service area';
              const delivery = formatDeliveryMode(loc.serviceDeliveryMode);
              return (
                <div
                  key={loc.id}
                  className="rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{title}</p>
                      {loc.city && loc.label ? (
                        <p className="text-sm text-neutral-500">{loc.city}</p>
                      ) : null}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-neutral-500">
                        {loc.serviceRadius != null ? (
                          <span>{loc.serviceRadius.toFixed(1)} km radius</span>
                        ) : null}
                        {delivery ? <span>{delivery}</span> : null}
                        {loc.isPrimary ? <span>Primary area</span> : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ProfileSection>
      ) : freelancer.serviceRadius != null && freelancer.serviceRadius > 0 ? (
        <ProfileSection title="Service area">
          <div className="rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-8 text-center">
            <MapPin className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-600">
              Service radius: {freelancer.serviceRadius.toFixed(1)} km
              {freelancer.city ? ` from ${freelancer.city}` : ''}
            </p>
          </div>
        </ProfileSection>
      ) : null}

      {freelancer.certifications && freelancer.certifications.length > 0 ? (
        <ProfileSection title="Certifications">
          <ul className="space-y-2">
            {freelancer.certifications.map((cert) => {
              const verified = freelancer.credentialProofVerifiedNames?.some(
                (name) => name.trim().toLowerCase() === cert.trim().toLowerCase(),
              );
              return (
                <li key={cert} className="flex items-center gap-2 text-sm text-neutral-800">
                  <ShieldCheck className="h-4 w-4 text-neutral-400 shrink-0" />
                  <span>{cert}</span>
                  {verified ? (
                    <Badge variant="secondary" className="text-[10px]">
                      Verified
                    </Badge>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </ProfileSection>
      ) : null}

      {portfolioProjects.length > 0 ? (
        <ProfileSection title="Previous work">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {portfolioProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl border border-neutral-200 overflow-hidden bg-white"
              >
                {project.imageUrls?.[0] ? (
                  <img
                    src={project.imageUrls[0]}
                    alt={project.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-neutral-100 flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-neutral-300" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-medium text-neutral-900">{project.title}</h3>
                  {project.description ? (
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-3">{project.description}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </ProfileSection>
      ) : null}

      {freelancer.portfolioPhotos && freelancer.portfolioPhotos.length > 0 ? (
        <ProfileSection title="Portfolio photos">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {freelancer.portfolioPhotos.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                className="w-full aspect-square object-cover rounded-xl border border-neutral-200"
              />
            ))}
          </div>
        </ProfileSection>
      ) : null}

      <ProfileSection title="Reviews">
        {!isAuthenticated ? (
          <p className="text-sm text-neutral-500">
            <button
              type="button"
              className="underline underline-offset-2 text-neutral-900"
              onClick={() => requireAuth(() => undefined)}
            >
              Sign in
            </button>{' '}
            to read customer reviews.
          </p>
        ) : reviewsLoading ? (
          <Skeleton className="h-20 rounded-xl" />
        ) : (reviewsData?.reviews.length ?? 0) === 0 ? (
          <p className="text-sm text-neutral-500">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviewsData?.reviews.map((review) => {
              const reviewInitials = review.customer.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              return (
                <div
                  key={review.id}
                  className="rounded-xl border border-neutral-100 bg-neutral-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.customer.profilePhotoUrl ?? undefined} />
                      <AvatarFallback className="text-xs">{reviewInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-neutral-900">{review.customer.fullName}</p>
                        <span className="inline-flex items-center gap-1 text-sm text-neutral-600 shrink-0">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                      {review.comment ? (
                        <p className="text-sm text-neutral-600 mt-1">{review.comment}</p>
                      ) : null}
                      <p className="text-xs text-neutral-400 mt-2">{formatReviewDate(review.createdAt)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ProfileSection>
    </div>
  );
}
