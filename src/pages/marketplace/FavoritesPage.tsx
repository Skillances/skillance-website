import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { del, get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import FreelancerResultCard from '@/components/marketplace/FreelancerResultCard';
import { MkAnimatedList, MkEmpty, MkErrorState, MkIconButton, MkLinkButton, MkListSkeleton, MkPageHeader, MkSwap } from '@/components/marketplace/ui';
import { apiErrorMessage, listFrom } from '@/lib/marketplace/apiHelpers';
import { useCategories } from '@/lib/marketplace/categories';
import type { FreelancerSummary } from '@/lib/marketplace/search';

const KEY = ['marketplace', 'favorites'];

export default function FavoritesPage() {
  const qc = useQueryClient();
  const categories = useCategories();
  const q = useQuery({ queryKey: KEY, queryFn: async () => listFrom<FreelancerSummary>(await get(`${ApiPaths.marketplace.favorites}?limit=100`), 'freelancers') });

  const restore = useMutation({
    mutationFn: async (id: string) => post(ApiPaths.marketplace.favorites, { freelancerId: id }),
    onSettled: () => void qc.invalidateQueries({ queryKey: KEY }),
  });
  const remove = useMutation({
    mutationFn: async (f: FreelancerSummary) => del(ApiPaths.marketplace.favoriteRemove(f.id)),
    onMutate: async (f) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<FreelancerSummary[]>(KEY);
      qc.setQueryData<FreelancerSummary[]>(KEY, (cur) => (cur ?? []).filter((x) => x.id !== f.id));
      return { prev };
    },
    onSuccess: (_d, f) => {
      qc.setQueryData(['marketplace', 'favorite', f.id], false);
      toast(`Removed ${f.fullName || 'freelancer'} from favorites`, { action: { label: 'Undo', onClick: () => restore.mutate(f.id) } });
    },
    onError: (err, _f, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
      toast.error(apiErrorMessage(err, 'Could not remove the favorite.'));
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: KEY }),
  });

  const items = q.data ?? [];
  const state = q.isPending ? 'loading' : q.isError ? 'error' : items.length === 0 ? 'empty' : 'list';

  return (
    <>
      <MkPageHeader title="Favorites" subtitle="Freelancers you saved." />
      <MkSwap id={state}>
        {state === 'loading' && <MkListSkeleton rows={4} />}
        {state === 'error' && <MkErrorState message={apiErrorMessage(q.error, 'Favorites could not be loaded.')} onRetry={() => void q.refetch()} retrying={q.isRefetching} />}
        {state === 'empty' && (
          <MkEmpty
            icon={<Heart className="h-6 w-6" aria-hidden="true" />}
            title="No favorites yet"
            body="Tap the heart on a freelancer's profile to save them here."
            action={<MkLinkButton to="/search">Find freelancers</MkLinkButton>}
          />
        )}
        {state === 'list' && (
          <MkAnimatedList
            items={items}
            getKey={(f) => f.id}
            className="space-y-3"
            render={(f) => (
              <FreelancerResultCard
                freelancer={f}
                categories={categories.data}
                action={
                  <MkIconButton label={`Remove ${f.fullName || 'freelancer'} from favorites`} onClick={() => remove.mutate(f)}>
                    <Heart className="h-5 w-5 text-mk-error" fill="currentColor" aria-hidden="true" />
                  </MkIconButton>
                }
              />
            )}
          />
        )}
      </MkSwap>
    </>
  );
}
