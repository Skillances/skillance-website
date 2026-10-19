import { useCallback, useEffect, useId, useState } from 'react';
import { ChevronDown, ChevronUp, ImagePlus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { del, get, post, put } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { apiErrorMessage } from '@/lib/marketplace/apiHelpers';

type AdminBeyondWorkItem = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  linkUrl: string | null;
  tags: string[];
  displayOrder: number;
  published: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

type Draft = {
  name: string;
  description: string;
  linkUrl: string;
  tags: string;
  displayOrder: string;
  published: boolean;
  imageDataUrl: string | null;
  removeImage: boolean;
};

const MISSING = 'The Beyond work API is not on the server yet.';
const MAX_LOGO_BYTES = 5_000_000;
const NAME_MAX = 200;
const DESCRIPTION_MAX = 1000;
const TAG_MAX = 60;
const TAG_COUNT_MAX = 20;
const LINK_MAX = 2000;
const ORDER_MIN = -100_000;
const ORDER_MAX = 100_000;
const HTTP_URL = /^https?:\/\//i;
const SAFE_DATA_IMAGE = /^data:image\/(png|jpeg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/;

const emptyDraft = (displayOrder = 0): Draft => ({
  name: '',
  description: '',
  linkUrl: '',
  tags: '',
  displayOrder: String(displayOrder),
  published: false,
  imageDataUrl: null,
  removeImage: false,
});

function isNotFound(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  return (err as { statusCode?: unknown }).statusCode === 404;
}

function failMessage(err: unknown, fallback: string): string {
  if (isNotFound(err)) return `${MISSING} Nothing was saved.`;
  return apiErrorMessage(err, fallback);
}

function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return HTTP_URL.test(trimmed) ? trimmed : null;
}

function safeImageUrl(value: unknown): string | null {
  const remote = safeHttpUrl(value);
  if (remote) return remote;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  return null;
}

function asItem(raw: unknown): AdminBeyondWorkItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const id = typeof row.id === 'string' ? row.id.trim() : '';
  const name = typeof row.name === 'string' ? row.name.trim() : '';
  const description = typeof row.description === 'string' ? row.description.trim() : '';
  if (!id || !name || !description) return null;
  const tags = Array.isArray(row.tags)
    ? row.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0).map((tag) => tag.trim())
    : [];
  const displayOrder = typeof row.displayOrder === 'number' && Number.isFinite(row.displayOrder) ? row.displayOrder : 0;
  return {
    id,
    name,
    description,
    imageUrl: safeImageUrl(row.imageUrl),
    linkUrl: safeHttpUrl(row.linkUrl),
    tags,
    displayOrder,
    published: row.published === true,
    createdAt: typeof row.createdAt === 'string' ? row.createdAt : null,
    updatedAt: typeof row.updatedAt === 'string' ? row.updatedAt : null,
  };
}

/** Accepts `{ success: true, data: BeyondWorkItem[] }`, including unpublished rows. */
function parseAdminBeyondWork(json: unknown): AdminBeyondWorkItem[] {
  if (!json || typeof json !== 'object') return [];
  const body = json as { success?: unknown; data?: unknown };
  if (body.success !== true || !Array.isArray(body.data)) return [];
  const items = body.data.map(asItem).filter((item): item is AdminBeyondWorkItem => item !== null);
  items.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name, 'en'));
  return items;
}

function logoType(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp' || ext === 'gif' || ext === 'svg';
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function splitTags(value: string): { tags: string[]; error: string | null } {
  const unique: string[] = [];
  for (const part of value.split(',')) {
    const tag = part.trim();
    if (!tag || unique.includes(tag)) continue;
    if (tag.length > TAG_MAX) return { tags: [], error: `Each tag must be ${TAG_MAX} characters or fewer.` };
    unique.push(tag);
  }
  if (unique.length > TAG_COUNT_MAX) return { tags: [], error: `Use at most ${TAG_COUNT_MAX} tags.` };
  return { tags: unique, error: null };
}

export default function AdminBeyondWork() {
  const formId = useId();
  const [items, setItems] = useState<AdminBeyondWorkItem[]>([]);
  const [phase, setPhase] = useState<'loading' | 'missing' | 'ready' | 'error'>('loading');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBeyondWorkItem | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminBeyondWorkItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const json = await get(ApiPaths.admin.beyondWork);
      setItems(parseAdminBeyondWork(json));
      setPhase('ready');
    } catch (err) {
      setItems([]);
      setPhase(isNotFound(err) ? 'missing' : 'error');
      if (!isNotFound(err)) toast.error(apiErrorMessage(err, 'Could not load Beyond work.'));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    get(ApiPaths.admin.beyondWork)
      .then((json) => {
        if (cancelled) return;
        setItems(parseAdminBeyondWork(json));
        setPhase('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setItems([]);
        setPhase(isNotFound(err) ? 'missing' : 'error');
        if (!isNotFound(err)) toast.error(apiErrorMessage(err, 'Could not load Beyond work.'));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openCreate = () => {
    const nextOrder = Math.min(ORDER_MAX, items.reduce((max, item) => Math.max(max, item.displayOrder + 1), 0));
    setEditing(null);
    setDraft(emptyDraft(nextOrder));
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (item: AdminBeyondWorkItem) => {
    setEditing(item);
    setDraft({
      name: item.name,
      description: item.description,
      linkUrl: item.linkUrl ?? '',
      tags: item.tags.join(', '),
      displayOrder: String(item.displayOrder),
      published: item.published,
      imageDataUrl: null,
      removeImage: false,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const onLogo = async (file: File | undefined) => {
    if (!file) return;
    if (!logoType(file.name)) {
      setFormError('Use a PNG, JPG, WEBP, GIF, or SVG logo.');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setFormError('Logo must be 5 MB or smaller.');
      return;
    }
    try {
      const imageDataUrl = await fileToDataUrl(file);
      if (!SAFE_DATA_IMAGE.test(imageDataUrl)) {
        setFormError('Could not read that image.');
        return;
      }
      setDraft((current) => ({ ...current, imageDataUrl, removeImage: false }));
      setFormError(null);
    } catch {
      setFormError('Could not read that file.');
    }
  };

  const save = async () => {
    const name = draft.name.trim();
    const description = draft.description.trim();
    const linkUrl = draft.linkUrl.trim();
    const displayOrder = Number(draft.displayOrder);
    const tags = splitTags(draft.tags);
    if (name.length < 1 || name.length > NAME_MAX) {
      setFormError(`Name must be 1–${NAME_MAX} characters.`);
      return;
    }
    if (description.length < 1 || description.length > DESCRIPTION_MAX) {
      setFormError(`Description must be 1–${DESCRIPTION_MAX} characters.`);
      return;
    }
    if (linkUrl && (!HTTP_URL.test(linkUrl) || linkUrl.length > LINK_MAX)) {
      setFormError(`Link must be an http(s) URL of at most ${LINK_MAX} characters.`);
      return;
    }
    if (!Number.isInteger(displayOrder) || displayOrder < ORDER_MIN || displayOrder > ORDER_MAX) {
      setFormError(`Display order must be a whole number from ${ORDER_MIN} to ${ORDER_MAX}.`);
      return;
    }
    if (tags.error) {
      setFormError(tags.error);
      return;
    }

    const payload: Record<string, unknown> = {
      name,
      description,
      linkUrl: linkUrl || null,
      tags: tags.tags,
      displayOrder,
      published: draft.published,
    };
    if (draft.imageDataUrl) {
      payload.image = draft.imageDataUrl;
    } else if (draft.removeImage) {
      payload.imageUrl = null;
    }

    setSaving(true);
    setFormError(null);
    try {
      if (editing) await put(ApiPaths.admin.beyondWorkItem(editing.id), payload);
      else await post(ApiPaths.admin.beyondWork, payload);
      toast.success(editing ? 'Piece updated.' : 'Piece added.');
      setFormOpen(false);
      await load();
    } catch (err) {
      const message = failMessage(err, 'Could not save this piece.');
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (item: AdminBeyondWorkItem) => {
    setBusyId(item.id);
    try {
      await put(ApiPaths.admin.beyondWorkItem(item.id), { published: !item.published });
      toast.success(item.published ? 'Unpublished.' : 'Published.');
      await load();
    } catch (err) {
      toast.error(failMessage(err, 'Could not change publish status.'));
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = items.slice();
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row);
    const updates = next
      .map((item, order) => ({ item, displayOrder: order }))
      .filter((entry) => entry.item.displayOrder !== entry.displayOrder);
    setBusyId(row.id);
    try {
      for (const update of updates) {
        await put(ApiPaths.admin.beyondWorkItem(update.item.id), { displayOrder: update.displayOrder });
      }
      setItems(next.map((item, order) => ({ ...item, displayOrder: order })));
    } catch (err) {
      toast.error(failMessage(err, 'Could not reorder.'));
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await del(ApiPaths.admin.beyondWorkItem(deleteTarget.id));
      toast.success('Piece deleted.');
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(failMessage(err, 'Could not delete this piece.'));
    } finally {
      setDeleting(false);
    }
  };

  const preview = draft.imageDataUrl && SAFE_DATA_IMAGE.test(draft.imageDataUrl) ? draft.imageDataUrl : null;
  const currentLogo = !draft.removeImage && !preview ? editing?.imageUrl : null;

  return (
    <div>
      <PageHeader
        title="Beyond work"
        description="Clients and portfolio pieces for Beyond the App. A piece stays off the public page until it is published."
      >
        <Button type="button" onClick={openCreate} className="bg-black text-white hover:bg-neutral-800 rounded-full dark:bg-white dark:text-black dark:hover:bg-neutral-200">
          Add piece
        </Button>
      </PageHeader>

      {phase === 'loading' ? (
        <p className="text-sm text-neutral-500" role="status">
          Loading Beyond work.
        </p>
      ) : null}

      {phase === 'missing' ? (
        <EmptyState
          title="The Beyond work API is not available yet"
          description="GET /admin/beyond-work returned 404. The list, publish controls, and logo upload on this page will work once that route is deployed. Nothing is stored in the browser."
        />
      ) : null}

      {phase === 'error' ? (
        <EmptyState
          title="Beyond work could not be loaded"
          description="The request failed for a reason other than a missing route. Try again in a moment."
        >
          <Button type="button" variant="outline" className="rounded-full" onClick={() => void load()}>
            Try again
          </Button>
        </EmptyState>
      ) : null}

      {phase === 'ready' && items.length === 0 ? (
        <EmptyState
          title="No pieces yet"
          description="Add a client or portfolio piece. It appears on Beyond the App only after you publish it."
        />
      ) : null}

      {phase === 'ready' && items.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-700">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-400">Piece</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-400">Tags</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-400">Order</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-400">Status</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-400">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" width={44} height={44} className="h-11 w-11 rounded-lg object-cover bg-neutral-100" />
                      ) : (
                        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-100 text-sm font-medium dark:bg-neutral-800" aria-hidden="true">
                          {item.name.slice(0, 1)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-black dark:text-white">{item.name}</p>
                        <p className="text-sm text-neutral-500 line-clamp-2">{item.description}</p>
                        {item.linkUrl ? (
                          <a href={item.linkUrl} className="text-sm underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                            {item.linkUrl}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">{item.tags.join(', ') || '—'}</td>
                  <td className="px-4 py-3 text-sm tabular-nums">{item.displayOrder}</td>
                  <td className="px-4 py-3">
                    <span className={item.published ? 'text-emerald-700 dark:text-emerald-300' : 'text-neutral-500'}>
                      {item.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button type="button" variant="outline" className="h-11 w-11 rounded-full" aria-label={`Move ${item.name} up`} disabled={index === 0 || busyId === item.id} onClick={() => void move(index, -1)}>
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" className="h-11 w-11 rounded-full" aria-label={`Move ${item.name} down`} disabled={index === items.length - 1 || busyId === item.id} onClick={() => void move(index, 1)}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" className="h-11 rounded-full px-3" aria-pressed={item.published} disabled={busyId === item.id} onClick={() => void togglePublished(item)}>
                        {item.published ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button type="button" variant="outline" className="h-11 w-11 rounded-full" aria-label={`Edit ${item.name}`} onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" className="h-11 w-11 rounded-full" aria-label={`Delete ${item.name}`} onClick={() => setDeleteTarget(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-black dark:text-white sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editing ? 'Edit piece' : 'Add piece'}</DialogTitle>
            <DialogDescription>Name, description, optional link, tags, order, logo, and whether it is public.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-name`}>Name</Label>
              <Input id={`${formId}-name`} maxLength={NAME_MAX} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-description`}>Short description</Label>
              <Textarea id={`${formId}-description`} maxLength={DESCRIPTION_MAX} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-link`}>Link (optional)</Label>
              <Input id={`${formId}-link`} inputMode="url" maxLength={LINK_MAX} placeholder="https://" value={draft.linkUrl} onChange={(event) => setDraft({ ...draft, linkUrl: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-tags`}>Sector or tags</Label>
              <Input id={`${formId}-tags`} placeholder="Separate with commas" value={draft.tags} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-order`}>Display order</Label>
              <Input id={`${formId}-order`} inputMode="numeric" value={draft.displayOrder} onChange={(event) => setDraft({ ...draft, displayOrder: event.target.value })} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={`${formId}-published`}>Published</Label>
              <Switch id={`${formId}-published`} checked={draft.published} onCheckedChange={(published) => setDraft({ ...draft, published })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${formId}-logo`}>Logo</Label>
              <div className="flex items-center gap-3">
                {preview || currentLogo ? (
                  <img src={preview || currentLogo || undefined} alt="" width={44} height={44} className="h-11 w-11 rounded-lg object-cover bg-neutral-100" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <ImagePlus className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}
                <Input
                  id={`${formId}-logo`}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  className="h-11"
                  onChange={(event) => void onLogo(event.target.files?.[0])}
                />
              </div>
              {editing?.imageUrl || draft.imageDataUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setDraft({ ...draft, imageDataUrl: null, removeImage: true })}
                >
                  Remove logo
                </Button>
              ) : null}
            </div>
            {formError ? (
              <p className="text-sm text-red-700 dark:text-red-300" role="alert">
                {formError}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" className="bg-black text-white hover:bg-neutral-800 rounded-full dark:bg-white dark:text-black" onClick={() => void save()} disabled={saving}>
              {saving ? 'Saving' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete this piece?"
        description={deleteTarget ? `${deleteTarget.name} will be removed from the admin list and from Beyond the App.` : ''}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleting}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
