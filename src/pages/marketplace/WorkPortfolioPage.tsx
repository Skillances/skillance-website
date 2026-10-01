import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Images, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { del, get, post, put } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import WorkGate from '@/components/marketplace/WorkGate';
import {
  MkAnimatedList,
  MkButton,
  MkConfirmDialog,
  MkDialog,
  MkEmpty,
  MkErrorState,
  MkFormError,
  MkIconButton,
  MkInput,
  MkListSkeleton,
  MkPageHeader,
  MkPill,
  MkSwap,
  MkTextarea,
  type MkTone,
} from '@/components/marketplace/ui';
import { apiErrorMessage, apiFieldErrors, listFrom } from '@/lib/marketplace/apiHelpers';
import { compressImage } from '@/lib/marketplace/image';

type Project = {
  id: string;
  title: string;
  description?: string | null;
  imageUrls: string[];
  moderationStatus?: 'pending' | 'verified' | 'rejected' | string;
  rejectionReason?: string | null;
};

/** API limits (portfolio.service): 3 projects, 3 images each. The create route has a 2 MB body cap. */
const MAX_PROJECTS = 3;
const MAX_IMAGES = 3;

const MODERATION: Record<string, { label: string; tone: MkTone }> = {
  pending: { label: 'In review', tone: 'warning' },
  verified: { label: 'Live', tone: 'success' },
  rejected: { label: 'Not approved', tone: 'error' },
};

function ProjectForm({ freelancerId, existing, onDone }: { freelancerId: string; existing: Project | null; onDone: () => void }) {
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [images, setImages] = useState<string[]>(existing?.imageUrls ?? []);
  const [preparing, setPreparing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const save = useMutation({
    mutationFn: async () => {
      const body = { title: title.trim(), description: description.trim() || (existing ? null : undefined), imageUrls: images };
      return existing
        ? put(ApiPaths.marketplace.freelancerPortfolioProject(freelancerId, existing.id), body)
        : post(ApiPaths.marketplace.freelancerPortfolio(freelancerId), body);
    },
    onSuccess: () => {
      toast.success(existing ? 'Project updated. It is back in review.' : 'Project added. It goes live after review.');
      onDone();
    },
    onError: (err) => {
      const f = apiFieldErrors(err);
      setErrors(f);
      setFormError(Object.keys(f).length ? null : apiErrorMessage(err, 'Could not save the project.'));
    },
  });

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setFormError(null);
        const next: Record<string, string | undefined> = {};
        if (!title.trim()) next.title = 'Give the project a title';
        if (images.length === 0) next.imageUrls = 'Add at least one photo';
        setErrors(next);
        if (!Object.values(next).some(Boolean)) save.mutate();
      }}
    >
      <MkInput label="Title" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} />
      <MkTextarea label="Description" optional maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} hint={`${description.length}/500`} error={errors.description} />
      <div>
        <p className="mb-2 font-mk-display text-[13px] font-semibold">Photos (up to {MAX_IMAGES})</p>
        <div className="grid grid-cols-3 gap-2">
          {images.map((src, i) => (
            <div key={`${src.slice(-24)}-${i}`} className="relative aspect-square overflow-hidden rounded-xl bg-mk-muted">
              <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => setImages(images.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 inline-flex h-11 w-11 items-center justify-center rounded-full"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-mk-surface shadow-mk-avatar">
                  <X className="h-4 w-4" aria-hidden="true" />
                </span>
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={preparing}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-mk-border text-[12px] text-mk-text-secondary hover:bg-mk-muted"
            >
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
              {preparing ? 'Preparing' : 'Add photo'}
            </button>
          )}
        </div>
        {errors.imageUrls && (
          <p role="alert" className="mt-1.5 text-[13px] text-mk-error">
            {errors.imageUrls}
          </p>
        )}
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-label="Add photo"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            setPreparing(true);
            try {
              // Three photos must fit in one 2 MB request.
              const url = await compressImage(file, { maxDim: 1400, maxBytes: 450_000 });
              setImages((cur) => [...cur, url].slice(0, MAX_IMAGES));
              setErrors((x) => ({ ...x, imageUrls: undefined }));
            } catch (err) {
              setErrors((x) => ({ ...x, imageUrls: err instanceof Error ? err.message : 'Could not add that photo.' }));
            } finally {
              setPreparing(false);
            }
          }}
        />
      </div>
      <p className="text-[13px] text-mk-text-tertiary">An admin reviews every project before customers can see it. Editing sends it back for review.</p>
      <MkFormError message={formError} />
      <MkButton type="submit" block loading={save.isPending} disabled={preparing}>
        {existing ? 'Save project' : 'Add project'}
      </MkButton>
    </form>
  );
}

function Portfolio({ freelancerId }: { freelancerId: string }) {
  const qc = useQueryClient();
  const key = ['marketplace', 'portfolio', freelancerId];
  const q = useQuery({ queryKey: key, queryFn: async () => listFrom<Project>(await get(ApiPaths.marketplace.freelancerPortfolio(freelancerId)), 'projects') });
  const [editing, setEditing] = useState<Project | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const remove = useMutation({
    mutationFn: async (p: Project) => del(ApiPaths.marketplace.freelancerPortfolioProject(freelancerId, p.id)),
    onSuccess: () => {
      setDeleting(null);
      toast.success('Project removed');
      void qc.invalidateQueries({ queryKey: key });
    },
  });
  const items = q.data ?? [];
  const state = q.isPending ? 'loading' : q.isError ? 'error' : items.length === 0 ? 'empty' : 'list';

  return (
    <>
      <MkPageHeader
        back="/work"
        title="Previous work"
        subtitle={`Show up to ${MAX_PROJECTS} projects on your profile.`}
        action={
          items.length > 0 && items.length < MAX_PROJECTS ? (
            <MkButton size="sm" onClick={() => setEditing('new')}>
              Add
            </MkButton>
          ) : undefined
        }
      />
      <MkSwap id={state}>
        {state === 'loading' && <MkListSkeleton rows={2} />}
        {state === 'error' && <MkErrorState message={apiErrorMessage(q.error)} onRetry={() => void q.refetch()} retrying={q.isRefetching} />}
        {state === 'empty' && (
          <MkEmpty
            icon={<Images className="h-6 w-6" aria-hidden="true" />}
            title="No projects yet"
            body="Photos of past jobs help customers choose you."
            action={<MkButton onClick={() => setEditing('new')}>Add a project</MkButton>}
          />
        )}
        {state === 'list' && (
          <MkAnimatedList
            items={items}
            getKey={(p) => p.id}
            className="space-y-3"
            render={(p) => {
              const m = MODERATION[p.moderationStatus ?? 'pending'] ?? MODERATION.pending;
              return (
                <div className="flex gap-3 rounded-2xl border border-mk-border p-3">
                  {p.imageUrls[0] ? (
                    <img src={p.imageUrls[0]} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="h-20 w-20 shrink-0 rounded-xl bg-mk-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mk-display text-[15px] font-semibold">{p.title}</p>
                      <MkPill tone={m.tone}>{m.label}</MkPill>
                    </div>
                    {p.description && <p className="line-clamp-2 text-[13px] text-mk-text-secondary">{p.description}</p>}
                    {p.moderationStatus === 'rejected' && p.rejectionReason && <p className="mt-1 text-[13px] text-mk-error">{p.rejectionReason}</p>}
                  </div>
                  <div className="flex flex-col">
                    <MkIconButton label={`Edit ${p.title}`} onClick={() => setEditing(p)}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </MkIconButton>
                    <MkIconButton label={`Remove ${p.title}`} onClick={() => setDeleting(p)}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </MkIconButton>
                  </div>
                </div>
              );
            }}
          />
        )}
      </MkSwap>

      <MkDialog open={editing != null} onOpenChange={(v) => !v && setEditing(null)} title={editing === 'new' ? 'Add a project' : 'Edit project'}>
        {editing != null && (
          <ProjectForm
            freelancerId={freelancerId}
            existing={editing === 'new' ? null : editing}
            onDone={() => {
              setEditing(null);
              void qc.invalidateQueries({ queryKey: key });
            }}
          />
        )}
      </MkDialog>
      <MkConfirmDialog
        open={deleting != null}
        onOpenChange={(v) => {
          if (!v) setDeleting(null);
          remove.reset();
        }}
        title="Remove this project?"
        description="It will be removed from your profile."
        confirmLabel="Remove"
        destructive
        loading={remove.isPending}
        error={remove.isError ? apiErrorMessage(remove.error) : null}
        onConfirm={() => deleting && remove.mutate(deleting)}
      />
    </>
  );
}

export default function WorkPortfolioPage() {
  return <WorkGate title="Previous work">{(fid) => <Portfolio freelancerId={fid} />}</WorkGate>;
}
