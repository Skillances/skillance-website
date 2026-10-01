import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import SearchBar from '@/components/marketplace/SearchBar';
import NearYouToggle from '@/components/marketplace/NearYouToggle';
import FreelancerResults from '@/components/marketplace/FreelancerResults';
import { MkButton, MkEmpty, MkSectionTitle, MkSkeleton } from '@/components/marketplace/ui';
import { useCategories } from '@/lib/marketplace/categories';
import { useBrowserLocation } from '@/lib/marketplace/search';
import { apiErrorMessage } from '@/lib/marketplace/apiHelpers';

const NEARBY_KM = 50;

export default function CustomerHomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const categories = useCategories();
  const loc = useBrowserLocation();
  const near = loc.status === 'granted';
  const firstName = user?.firstName || user?.fullName?.split(' ')[0];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-[26px] font-bold leading-tight tracking-tight sm:text-[30px]">
          {firstName ? `Hi ${firstName}, what do you need done?` : 'What do you need done?'}
        </h1>
        <p className="mt-1.5 text-[15px] text-mk-text-secondary">Book trusted, verified freelancers across South Africa.</p>
        <div className="mt-5 space-y-3">
          <SearchBar onSubmit={(q) => navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')} />
          <NearYouToggle />
        </div>
      </section>

      <section aria-labelledby="home-categories">
        <MkSectionTitle
          action={
            <Link to="/search" className="inline-flex min-h-11 items-center text-[13px] font-semibold text-mk-text-secondary hover:text-mk-text-primary">
              Search all
            </Link>
          }
        >
          <span id="home-categories">Categories</span>
        </MkSectionTitle>
        {categories.isPending ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <MkSkeleton key={i} className="h-[76px] rounded-2xl" />
            ))}
          </div>
        ) : categories.isError ? (
          <div className="rounded-2xl border border-mk-border p-4 text-[14px] text-mk-text-secondary">
            {apiErrorMessage(categories.error, 'Categories are unavailable.')}{' '}
            <MkButton variant="ghost" size="sm" onClick={() => void categories.refetch()}>
              Try again
            </MkButton>
          </div>
        ) : (categories.data ?? []).length === 0 ? (
          <MkEmpty title="No categories yet" body="Search by what you need instead." />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {(categories.data ?? []).map((c) => (
              <li key={c.id}>
                <Link
                  to={`/browse/category/${encodeURIComponent(c.id)}`}
                  className="group flex min-h-[76px] items-center gap-3 rounded-2xl border border-mk-border bg-mk-surface p-3 transition-[box-shadow,transform] duration-200 ease-out hover:shadow-mk-card active:scale-[0.98] motion-reduce:active:scale-100"
                >
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl bg-mk-muted object-cover" loading="lazy" />
                  ) : (
                    <span className="h-12 w-12 shrink-0 rounded-xl bg-mk-muted" aria-hidden="true" />
                  )}
                  <span className="min-w-0 flex-1 font-mk-display text-[14px] font-semibold leading-snug">{c.name}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-mk-text-tertiary transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="home-recommended">
        <MkSectionTitle>
          <span id="home-recommended">{near ? 'Top rated near you' : 'Top rated'}</span>
        </MkSectionTitle>
        <FreelancerResults
          limit={10}
          showMore={false}
          body={
            near
              ? {
                  query: '',
                  location: { latitude: loc.latitude, longitude: loc.longitude },
                  filters: { maxDistance: NEARBY_KM },
                  sortBy: 'distance',
                }
              : { query: '', sortBy: 'rating' }
          }
          emptyTitle={near ? 'No freelancers near you yet' : 'No freelancers yet'}
          emptyBody={near ? 'Turn off location to see freelancers across South Africa.' : 'Try searching for a service.'}
        />
      </section>
    </div>
  );
}
