/**
 * Digital products: freelancer seller list (/work/products), buyer library (/documents),
 * and the viewer (/documents/:productId).
 */
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, FileText, FileUp, Package, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { get, patch, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import WorkGate from '@/components/marketplace/WorkGate';
import {
  MkAnimatedList,
  MkAvatar,
  MkButton,
  MkDialog,
  MkEmpty,
  MkErrorState,
  MkFormError,
  MkInput,
  MkListSkeleton,
  MkPageHeader,
  MkPill,
  MkSkeleton,
  MkSwap,
  MkTextarea,
  type MkTone,
} from '@/components/marketplace/ui';
import { apiErrorMessage, apiFieldErrors, fileToDataUrl, listFrom, unwrap } from '@/lib/marketplace/apiHelpers';
import { money } from '@/lib/marketplace/pricing';
import { formatZar } from '@/lib/marketplace/theme';
import { formatDate } from '@/lib/marketplace/time';

type FileType = 'pdf' | 'docx' | 'pptx';
type Product = {
  id: string;
  title: string;
  description?: string | null;
  price: number | string;
  fileType: FileType;
  moderationStatus?: 'pending' | 'verified' | 'rejected' | string;
  rejectionReason?: string | null;
  createdAt?: string;
  purchasedAt?: string;
};

const MODERATION: Record<string, { label: string; tone: MkTone }> = {
  pending: { label: 'In review', tone: 'warning' },
  verified: { label: 'Live', tone: 'success' },
  rejected: { label: 'Not approved', tone: 'error' },
};

const FILE_LABEL: Record<string, string> = { pdf: 'PDF', docx: 'Word', pptx: 'PowerPoint' };
/** Upload cap: the API accepts up to ~60 MB of base64. */
const MAX_FILE_BYTES = 40 * 1024 * 1024;

function fileTypeOf(f: File): FileType | null {
  if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) return 'pdf';
  if (/\.docx$/i.test(f.name)) return 'docx';
  if (/\.pptx$/i.test(f.name)) return 'pptx';
  return null;
}

/* --------------------------------------------------------------- Seller */

function ProductForm({ freelancerId, existing, onDone }: { freelancerId: string; existing: Product | null; onDone: () => void }) {
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [price, setPrice] = useState(existing ? String(money(existing.price) ?? '') : '');
  const [file, setFile] = useState<{ base64: string; type: FileType; name: string } | null>(null);
  const [reading, setReading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const save = useMutation({
    mutationFn: async () => {
      if (!existing) {
        return post(ApiPaths.marketplace.products, {
          freelancerId,
          title: title.trim(),
          ...(description.trim() ? { description: description.trim() } : {}),
          price: Number(price),
          fileBase64: file!.base64,
          fileType: file!.type,
          fileName: file!.name.slice(0, 200),
        });
      }
      // Send only what changed (as the app does).
      const body: Record<string, unknown> = {};
      if (title.trim() !== existing.title) body.title = title.trim();
      if ((description.trim() || null) !== (existing.description ?? null)) body.description = description.trim() || null;
      if (Number(price) !== money(existing.price)) body.price = Number(price);
      if (file) Object.assign(body, { fileBase64: file.base64, fileType: file.type, fileName: file.name.slice(0, 200) });
      if (Object.keys(body).length === 0) return null;
      return patch(ApiPaths.marketplace.product(existing.id), body);
    },
    onSuccess: (res) => {
      toast.success(res === null ? 'Nothing changed' : 'Saved. The product is in review until an admin approves it.');
      onDone();
    },
    onError: (err) => {
      const f = apiFieldErrors(err);
      setErrors(f);
      setFormError(Object.keys(f).length ? null : apiErrorMessage(err, 'Could not save the product.'));
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
        if (!title.trim()) next.title = 'Enter a title';
        if (!(Number(price) > 0)) next.price = 'Enter a price above R0';
        if (!existing && !file) next.fileBase64 = 'Choose the file to sell';
        setErrors(next);
        if (!Object.values(next).some(Boolean)) save.mutate();
      }}
    >
      <MkInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} />
      <MkTextarea label="Description" optional value={description} onChange={(e) => setDescription(e.target.value)} error={errors.description} />
      <MkInput label="Price (R)" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))} error={errors.price} />
      <div>
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={reading}
          className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-dashed border-mk-border px-4 text-left hover:bg-mk-muted"
        >
          <FileUp className="h-5 w-5 text-mk-text-secondary" aria-hidden="true" />
          <span className="flex-1 truncate font-mk-display text-[14px] font-semibold">
            {reading ? 'Reading file' : file ? file.name : existing ? 'Replace file (optional)' : 'Choose a PDF, Word, or PowerPoint file'}
          </span>
        </button>
        {errors.fileBase64 && (
          <p role="alert" className="mt-1.5 text-[13px] text-mk-error">
            {errors.fileBase64}
          </p>
        )}
        <input
          ref={input}
          type="file"
          accept=".pdf,.docx,.pptx,application/pdf"
          className="sr-only"
          tabIndex={-1}
          aria-label="Product file"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            const type = fileTypeOf(f);
            if (!type) return setErrors((x) => ({ ...x, fileBase64: 'Only PDF, Word (.docx), and PowerPoint (.pptx) files are supported.' }));
            if (f.size > MAX_FILE_BYTES) return setErrors((x) => ({ ...x, fileBase64: 'Files must be smaller than 40 MB.' }));
            setReading(true);
            try {
              setFile({ base64: await fileToDataUrl(f), type, name: f.name });
              setErrors((x) => ({ ...x, fileBase64: undefined }));
            } catch {
              setErrors((x) => ({ ...x, fileBase64: 'Could not read that file.' }));
            } finally {
              setReading(false);
            }
          }}
        />
      </div>
      <p className="text-[13px] text-mk-text-tertiary">Products stay in review until an admin verifies them. Any change sends the product back for review.</p>
      <MkFormError message={formError} />
      <MkButton type="submit" block loading={save.isPending} disabled={reading}>
        {existing ? 'Save changes' : 'Submit for review'}
      </MkButton>
    </form>
  );
}

function SellerProducts({ freelancerId }: { freelancerId: string }) {
  const qc = useQueryClient();
  const key = ['marketplace', 'products', 'mine'];
  const q = useQuery({ queryKey: key, queryFn: async () => listFrom<Product>(await get(ApiPaths.marketplace.myProducts), 'products') });
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const items = q.data ?? [];
  const state = q.isPending ? 'loading' : q.isError ? 'error' : items.length === 0 ? 'empty' : 'list';

  return (
    <>
      <MkPageHeader
        back="/work"
        title="Digital products"
        subtitle="Sell guides, templates, and worksheets. Each product is reviewed by an admin before customers can see it."
        action={
          items.length > 0 ? (
            <MkButton size="sm" onClick={() => setEditing('new')}>
              Add
            </MkButton>
          ) : undefined
        }
      />
      <MkSwap id={state}>
        {state === 'loading' && <MkListSkeleton rows={3} />}
        {state === 'error' && <MkErrorState message={apiErrorMessage(q.error)} onRetry={() => void q.refetch()} retrying={q.isRefetching} />}
        {state === 'empty' && (
          <MkEmpty
            icon={<Package className="h-6 w-6" aria-hidden="true" />}
            title="No products yet"
            body="Add a PDF, Word, or PowerPoint file to sell on your profile."
            action={<MkButton onClick={() => setEditing('new')}>Add a product</MkButton>}
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
                <div className="flex items-start gap-3 rounded-2xl border border-mk-border p-4">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-mk-text-secondary" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mk-display text-[15px] font-semibold">{p.title}</p>
                      <MkPill tone={m.tone}>{m.label}</MkPill>
                    </div>
                    <p className="text-[13px] text-mk-text-secondary">
                      {formatZar(money(p.price))} · {FILE_LABEL[p.fileType] ?? p.fileType}
                    </p>
                    {p.moderationStatus === 'rejected' && p.rejectionReason && <p className="mt-1 text-[13px] text-mk-error">{p.rejectionReason}</p>}
                  </div>
                  <MkButton variant="ghost" size="sm" onClick={() => setEditing(p)}>
                    <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                  </MkButton>
                </div>
              );
            }}
          />
        )}
      </MkSwap>
      <MkDialog open={editing != null} onOpenChange={(v) => !v && setEditing(null)} title={editing === 'new' ? 'Add a product' : 'Edit product'}>
        {editing != null && (
          <ProductForm
            freelancerId={freelancerId}
            existing={editing === 'new' ? null : editing}
            onDone={() => {
              setEditing(null);
              void qc.invalidateQueries({ queryKey: key });
            }}
          />
        )}
      </MkDialog>
    </>
  );
}

export function WorkProductsPage() {
  return <WorkGate title="Digital products">{(fid) => <SellerProducts freelancerId={fid} />}</WorkGate>;
}

/* ---------------------------------------------------------------- Buyer */

type PurchasedGroup = { freelancerId: string; freelancerName?: string; freelancerProfilePhotoUrl?: string | null; products: Product[] };

export function DocumentsPage() {
  const q = useQuery({ queryKey: ['marketplace', 'products', 'purchased'], queryFn: async () => listFrom<PurchasedGroup>(await get(ApiPaths.marketplace.purchasedProducts)) });
  const groups = (q.data ?? []).filter((g) => (g.products ?? []).length > 0);
  const state = q.isPending ? 'loading' : q.isError ? 'error' : groups.length === 0 ? 'empty' : 'list';
  return (
    <>
      <MkPageHeader title="Documents" subtitle="Digital products you have bought." />
      <MkSwap id={state}>
        {state === 'loading' && <MkListSkeleton rows={3} />}
        {state === 'error' && <MkErrorState message={apiErrorMessage(q.error)} onRetry={() => void q.refetch()} retrying={q.isRefetching} />}
        {state === 'empty' && (
          <MkEmpty icon={<FileText className="h-6 w-6" aria-hidden="true" />} title="No documents yet" body="Guides and templates you buy from freelancers show here." />
        )}
        {state === 'list' && (
          <div className="space-y-6">
            {groups.map((g) => (
              <section key={g.freelancerId}>
                <Link to={`/freelancers/${g.freelancerId}`} className="mb-2 inline-flex min-h-11 items-center gap-2.5">
                  <MkAvatar src={g.freelancerProfilePhotoUrl} name={g.freelancerName} size={32} />
                  <span className="font-mk-display text-[15px] font-semibold">{g.freelancerName || 'Freelancer'}</span>
                </Link>
                <ul className="space-y-2">
                  {g.products.map((p) => (
                    <li key={p.id}>
                      <Link to={`/documents/${p.id}`} className="flex items-center gap-3 rounded-2xl border border-mk-border p-4 hover:bg-mk-muted">
                        <FileText className="h-5 w-5 shrink-0 text-mk-text-secondary" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mk-display text-[15px] font-semibold">{p.title}</p>
                          <p className="text-[13px] text-mk-text-secondary">
                            {FILE_LABEL[p.fileType] ?? p.fileType}
                            {p.purchasedAt ? ` · Bought ${formatDate(p.purchasedAt)}` : ''}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </MkSwap>
    </>
  );
}

/* --------------------------------------------------------------- Viewer */

type ViewInfo = { viewUrl: string; fileType: FileType };

/**
 * Follows the app viewer: PDFs render inline from fetched bytes; Word and PowerPoint open in a new tab.
 * The short-lived signed URL is never placed in a link; it is requested from the API on demand.
 */
export function DocumentViewerPage() {
  const { productId = '' } = useParams();
  const view = useQuery({
    queryKey: ['marketplace', 'products', 'view', productId],
    queryFn: async () => unwrap<ViewInfo>(await get(ApiPaths.marketplace.productView(productId))),
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [inlineFailed, setInlineFailed] = useState(false);

  useEffect(() => {
    if (!view.data || view.data.fileType !== 'pdf') return;
    let url: string | null = null;
    let cancelled = false;
    fetch(view.data.viewUrl)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((b) => {
        if (cancelled) return;
        url = URL.createObjectURL(new Blob([b], { type: 'application/pdf' }));
        setBlobUrl(url);
      })
      .catch(() => !cancelled && setInlineFailed(true));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [view.data]);

  const openFresh = async () => {
    try {
      const fresh = unwrap<ViewInfo>(await get(ApiPaths.marketplace.productView(productId)));
      window.open(fresh.viewUrl, '_blank', 'noopener');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not open the document.'));
    }
  };

  return (
    <>
      <MkPageHeader back="/documents" title="Document" />
      {view.isPending ? (
        <MkSkeleton className="h-[70vh] w-full rounded-2xl" />
      ) : view.isError || !view.data ? (
        <MkErrorState message={apiErrorMessage(view.error, 'This document is not available to you.')} onRetry={() => void view.refetch()} retrying={view.isRefetching} />
      ) : view.data.fileType === 'pdf' && blobUrl ? (
        <iframe title="Document" src={blobUrl} className="h-[75vh] w-full rounded-2xl border border-mk-border" />
      ) : view.data.fileType === 'pdf' && !inlineFailed ? (
        <MkSkeleton className="h-[70vh] w-full rounded-2xl" />
      ) : (
        <MkEmpty
          icon={<FileText className="h-6 w-6" aria-hidden="true" />}
          title={view.data.fileType === 'pdf' ? 'Open your document' : `${FILE_LABEL[view.data.fileType] ?? 'This'} file`}
          body="It opens in a new tab with a secure link that expires after a few minutes."
          action={
            <MkButton onClick={() => void openFresh()}>
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> Open document
            </MkButton>
          }
        />
      )}
    </>
  );
}
