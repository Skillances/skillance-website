import type { ReactNode } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SearchX } from 'lucide-react';
import FreelancerResultCard from '@/components/marketplace/FreelancerResultCard';
import { MkAnimatedList, MkButton, MkEmpty, MkErrorState, MkListSkeleton, MkSwap } from '@/components/marketplace/ui';
import { apiErrorMessage } from '@/lib/marketplace/apiHelpers';
import { useCategories } from '@/lib/marketplace/categories';
import { SEARCH_PAGE_SIZE, searchFreelancers, type SearchBody } from '@/lib/marketplace/search';

/** Paged `POST /freelancers/search` results (20 per page) with loading, empty, and error states. */
export default function FreelancerResults({
  body,
  emptyTitle = 'No freelancers found',
  emptyBody = 'Try a different search or remove some filters.',
  emptyAction,
  limit = SEARCH_PAGE_SIZE,
  showMore = true,
}: {
  body: Omit<SearchBody, 'pagination'>;
  emptyTitle?: string;
  emptyBody?: ReactNode;
  emptyAction?: ReactNode;
  limit?: number;
  showMore?: boolean;
}) {
  const categories = useCategories();
  const q = useInfiniteQuery({
    queryKey: ['marketplace', 'search', body, limit],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => searchFreelancers({ ...body, pagination: { limit, offset: pageParam } }),
    getNextPageParam: (last) => (last.hasMore ? last.offset + limit : undefined),
  });

  const items = q.data?.pages.flatMap((p) => p.freelancers) ?? [];
  const state = q.isPending ? 'loading' : items.length > 0 ? 'list' : q.isError ? 'error' : 'empty';

  return (
    <MkSwap id={state}>
      {state === 'loading' && <MkListSkeleton rows={4} />}
      {state === 'error' && (
        <MkErrorState
          message={apiErrorMessage(q.error, 'Search is unavailable right now.')}
          onRetry={() => void q.refetch()}
          retrying={q.isRefetching}
        />
      )}
      {state === 'empty' && (
        <MkEmpty icon={<SearchX className="h-6 w-6" aria-hidden="true" />} title={emptyTitle} body={emptyBody} action={emptyAction} />
      )}
      {state === 'list' && (
        <>
          <MkAnimatedList
            items={items}
            getKey={(f) => f.id}
            className="space-y-3"
            render={(f) => <FreelancerResultCard freelancer={f} categories={categories.data} />}
          />
          {showMore && q.hasNextPage && (
            <div className="mt-5 flex justify-center">
              <MkButton variant="secondary" loading={q.isFetchingNextPage} onClick={() => void q.fetchNextPage()}>
                Show more
              </MkButton>
            </div>
          )}
          {q.isError && items.length > 0 && (
            <p className="mt-3 text-center text-[13px] text-mk-error">{apiErrorMessage(q.error)}</p>
          )}
        </>
      )}
    </MkSwap>
  );
}
