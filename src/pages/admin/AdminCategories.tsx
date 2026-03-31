import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post, put, del } from '@/lib/api';
import {
  Plus, Edit, Trash2, FolderOpen, Loader2, Upload, ImageIcon, Star,
  ChevronRight, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import { CategoryLottieThumb, CategoryLottieInline, isLottieImageUrl } from '@/components/admin/CategoryLottieThumb';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ImageType = 'lottie' | 'svg' | 'png' | 'jpg';

interface CategoryItem {
  id: string;
  parentId: string | null;
  level: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  displayOrder: number;
  freelancerCount?: number;
  color: string | null;
  isProximityBased: boolean;
  iconCodePoint: number | null;
  iconFontFamily: string | null;
  imageUrl: string | null;
  websiteImageUrl: string | null;
  isFeatured: boolean;
  supportsRecurring?: boolean;
}

interface CategoryNode extends CategoryItem {
  children: CategoryNode[];
}

interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  withFreelancers: number;
  mostPopular: unknown[];
}

const emptyForm = {
  name: '', slug: '', description: '', color: '', isActive: true, displayOrder: 0,
  isProximityBased: false, isFeatured: false, supportsRecurring: false,
  iconCodePoint: '' as string | number, iconFontFamily: 'MaterialIcons',
  imageBase64: null as string | null, imageType: null as ImageType | null,
  websiteImageUrl: '',
};

function detectImageType(filename: string): ImageType | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['json', 'lottie'].includes(ext || '')) return 'lottie';
  if (ext === 'svg') return 'svg';
  if (ext === 'png') return 'png';
  if (['jpg', 'jpeg'].includes(ext || '')) return 'jpg';
  return null;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64 || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function sanitizeHttpImageUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function toSafeDataImageUri(imageType: Exclude<ImageType, 'lottie'>, base64: string): string | null {
  // Strictly allow base64 alphabet to prevent scriptable payloads in data URIs.
  if (!/^[A-Za-z0-9+/=]+$/.test(base64)) return null;
  return `data:image/${imageType};base64,${base64}`;
}

function buildTree(flat: CategoryItem[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  flat.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: CategoryNode[] = [];
  flat.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

// ─── Category icon preview ────────────────────────────────────────────────────
const CategoryIconPreview: React.FC<{ c: CategoryItem; size?: number }> = ({ c, size = 32 }) => {
  const px = size;
  if (c.imageUrl) {
    if (isLottieImageUrl(c.imageUrl)) {
      return <CategoryLottieThumb key={c.imageUrl} src={c.imageUrl} size={px} />;
    }
    return (
      <img
        src={c.imageUrl}
        alt=""
        style={{ width: px, height: px }}
        className="rounded-lg object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
      />
    );
  }
  if (c.iconCodePoint != null) {
    return (
      <div
        style={{ width: px, height: px, fontFamily: 'Material Icons', fontSize: px * 0.65 }}
        className="rounded-lg flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0"
        title={`Icon code: ${c.iconCodePoint}`}
      >
        {String.fromCodePoint(c.iconCodePoint)}
      </div>
    );
  }
  return (
    <div
      style={{ width: px, height: px }}
      className="rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0"
    >
      <ImageIcon className="text-neutral-400" style={{ width: px * 0.45, height: px * 0.45 }} />
    </div>
  );
};

// ─── Single category row ──────────────────────────────────────────────────────
const CategoryRow: React.FC<{
  node: CategoryNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onOpenFreelancers: (categoryFilter: string) => void;
  onEdit: (c: CategoryItem) => void;
  onDelete: (id: string) => void;
}> = ({ node, depth, expanded, onToggle, onOpenFreelancers, onEdit, onDelete }) => {
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const indent = depth * 20;

  return (
    <>
      <tr
        className={cn(
          'border-b border-neutral-50 dark:border-neutral-700/50 transition-colors',
          !node.isActive && 'opacity-50',
        )}
      >
        {/* Name cell */}
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-2.5" style={{ paddingLeft: indent }}>
            {/* Expand / collapse toggle */}
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggle(node.id)}
                className="p-0.5 rounded text-neutral-500 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors shrink-0"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded
                  ? <ChevronDown size={14} />
                  : <ChevronRight size={14} />}
              </button>
            ) : (
              <span style={{ width: 19 }} className="shrink-0" />
            )}

            {/* Icon */}
            <CategoryIconPreview c={node} size={depth === 0 ? 32 : 24} />

            {/* Color dot */}
            {node.color && (
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/50 dark:border-black/30"
                style={{ backgroundColor: node.color }}
              />
            )}

            {/* Website image thumbnail */}
            {node.websiteImageUrl && depth === 0 && (
              <img
                src={node.websiteImageUrl}
                alt="Website"
                title="Website image"
                className="w-8 h-8 rounded-md object-cover border border-neutral-200 dark:border-neutral-700 shrink-0 hidden sm:block"
              />
            )}

            {/* Text */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={cn(
                  'font-medium text-black dark:text-white truncate',
                  depth === 0 ? 'text-sm' : 'text-xs',
                )}>
                  {node.name}
                </span>
                {node.isFeatured && (
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                )}
              </div>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate block">{node.slug}</span>
            </div>
          </div>
        </td>

        {/* Subcategories count */}
        <td className="px-4 py-2.5 text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
          {hasChildren ? (
            <span className="inline-flex items-center gap-1">
              <FolderOpen size={12} className="text-neutral-400" />
              {node.children.length}
            </span>
          ) : (
            <span className="text-neutral-300 dark:text-neutral-600">—</span>
          )}
        </td>

        {/* Freelancers */}
        <td className="px-4 py-2.5 text-xs text-neutral-600 dark:text-neutral-300 tabular-nums">
          <button
            type="button"
            onClick={() => onOpenFreelancers(node.slug)}
            className="font-medium underline-offset-2 hover:underline text-neutral-700 dark:text-violet-300 dark:hover:text-violet-200"
          >
            {node.freelancerCount ?? 0}
          </button>
        </td>

        {/* Status */}
        <td className="px-4 py-2.5">
          <StatusBadge status={node.isActive ? 'active' : 'suspended'} label={node.isActive ? 'Active' : 'Inactive'} />
        </td>

        {/* Order */}
        <td className="px-4 py-2.5 text-xs text-neutral-400 dark:text-neutral-500 tabular-nums">
          {node.displayOrder}
        </td>

        {/* Actions */}
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-neutral-400 hover:text-black dark:hover:text-white"
              onClick={(e) => { e.stopPropagation(); onEdit(node); }}
              aria-label={`Edit ${node.name}`}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
              aria-label={`Delete ${node.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </td>
      </tr>

      {/* Children */}
      {hasChildren && isExpanded && node.children.map((child) => (
        <CategoryRow
          key={child.id}
          node={child}
          depth={depth + 1}
          expanded={expanded}
          onToggle={onToggle}
          onOpenFreelancers={onOpenFreelancers}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const AdminCategories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const page = 1;
  const pageSize = 100; // backend max; enough for all categories
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageDropActive, setImageDropActive] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await get(`/admin/categories?includeInactive=true&page=${page}&limit=${pageSize}`);
      if (res.success) {
        const cats: CategoryItem[] = res.data.categories || [];
        setCategories(cats);
        setTotal(res.data.total || 0);
        // Default collapsed view keeps the table compact.
        setExpanded(new Set());
      }
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await get('/admin/categories/stats');
      if (res.success) setStats(res.data);
    } catch {}
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageDropDepthRef = useRef(0);

  useEffect(() => {
    if (!formOpen) {
      imageDropDepthRef.current = 0;
      setImageDropActive(false);
    }
  }, [formOpen]);

  const processCategoryImageFile = useCallback(async (file: File) => {
    const imageType = detectImageType(file.name);
    if (!imageType) {
      toast.error('Unsupported file type. Use .lottie, .json, .svg, .png, or .jpg');
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setForm((f) => ({ ...f, imageBase64: base64, imageType }));
    } catch {
      toast.error('Failed to read file');
    }
  }, []);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (cat: CategoryItem) => {
    setEditId(cat.id);
    setForm({
      name: cat.name, slug: cat.slug, description: cat.description || '',
      color: cat.color || '', isActive: cat.isActive, displayOrder: cat.displayOrder,
      isProximityBased: cat.isProximityBased, isFeatured: cat.isFeatured,
      supportsRecurring: cat.supportsRecurring ?? false,
      iconCodePoint: cat.iconCodePoint ?? '', iconFontFamily: cat.iconFontFamily || 'MaterialIcons',
      imageBase64: null, imageType: null,
      websiteImageUrl: cat.websiteImageUrl || '',
    });
    setFormOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processCategoryImageFile(file);
    e.target.value = '';
  };

  const handleImageDropZoneDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); imageDropDepthRef.current += 1; if (imageDropDepthRef.current === 1) setImageDropActive(true); };
  const handleImageDropZoneDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); imageDropDepthRef.current -= 1; if (imageDropDepthRef.current <= 0) { imageDropDepthRef.current = 0; setImageDropActive(false); } };
  const handleImageDropZoneDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy'; };
  const handleImageDropZoneDrop = async (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); imageDropDepthRef.current = 0; setImageDropActive(false); const file = e.dataTransfer.files?.[0]; if (!file) return; await processCategoryImageFile(file); };
  const clearImage = () => setForm((f) => ({ ...f, imageBase64: null, imageType: null }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        name: form.name, description: form.description || undefined,
        color: form.color || undefined, isActive: form.isActive,
        displayOrder: form.displayOrder, isProximityBased: form.isProximityBased,
        isFeatured: form.isFeatured, supportsRecurring: form.supportsRecurring,
        iconFontFamily: form.iconFontFamily || undefined,
      };
      if (form.slug) payload.slug = form.slug;
      const iconCode = typeof form.iconCodePoint === 'number' ? form.iconCodePoint : parseInt(String(form.iconCodePoint), 10);
      if (!isNaN(iconCode)) payload.iconCodePoint = iconCode;
      if (form.imageBase64 && form.imageType) { payload.image = form.imageBase64; payload.imageType = form.imageType; }
      if (form.websiteImageUrl.trim()) payload.websiteImageUrl = form.websiteImageUrl.trim();
      else payload.websiteImageUrl = null;
      if (editId) { await put(`/admin/categories/${editId}`, payload); toast.success('Category updated'); }
      else { await post('/admin/categories', payload); toast.success('Category created'); }
      setFormOpen(false);
      fetchCategories();
      fetchStats();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message?: string }).message) : 'Failed to save category';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await del(`/admin/categories/${deleteId}`);
      toast.success('Category deactivated');
      setDeleteOpen(false);
      setDeleteId(null);
      fetchCategories();
      fetchStats();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message?: string }).message) : 'Failed to delete category';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const tree = useMemo(() => buildTree(categories), [categories]);

  useEffect(() => {
    // Keep category tree collapsed by default after data loads/refreshes.
    setExpanded(new Set());
  }, [categories.length]);

  const pendingLottiePreviewData = useMemo(() => {
    if (form.imageType !== 'lottie' || !form.imageBase64) return null;
    try { return JSON.parse(atob(form.imageBase64)) as unknown; } catch { return null; }
  }, [form.imageType, form.imageBase64]);

  const statsCards = stats ? [
    { title: 'Total', value: stats.total.toLocaleString(), icon: FolderOpen, color: '#171717' },
    { title: 'Active', value: stats.active.toLocaleString(), icon: FolderOpen, color: '#10b981' },
    { title: 'With Freelancers', value: stats.withFreelancers.toLocaleString(), icon: FolderOpen, color: '#8b5cf6' },
  ] : [];

  return (
    <div className="space-y-8">
      <PageHeader title="Categories" description="Manage service categories and their subcategories">
        <Button size="sm" onClick={openCreate} className="bg-black text-white hover:bg-neutral-800 rounded-full">
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </PageHeader>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statsCards.map((s, i) => <StatsCard key={s.title} {...s} index={i} />)}
        </div>
      )}

      {/* Tree table */}
      <div className="border border-neutral-100 dark:border-neutral-700 rounded-2xl overflow-x-auto bg-white dark:bg-neutral-800/80 shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-neutral-400 text-sm gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading categories…
          </div>
        ) : tree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-400">
            <FolderOpen className="h-10 w-10" />
            <p className="text-sm">No categories found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-700">
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-400 dark:text-neutral-500">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-400 dark:text-neutral-500 hidden sm:table-cell">
                  Sub
                </th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-400 dark:text-neutral-500 hidden sm:table-cell">
                  Freelancers
                </th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-400 dark:text-neutral-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-400 dark:text-neutral-500 hidden md:table-cell">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-400 dark:text-neutral-500">
                  {/* actions — no label */}
                </th>
              </tr>
            </thead>
            <tbody>
              {tree.map((node) => (
                <CategoryRow
                  key={node.id}
                  node={node}
                  depth={0}
                  expanded={expanded}
                  onToggle={toggleExpand}
                  onOpenFreelancers={(categoryFilter) => navigate(`/admin/freelancers?categoryId=${encodeURIComponent(categoryFilter)}`)}
                  onEdit={openEdit}
                  onDelete={(id) => { setDeleteId(id); setDeleteOpen(true); }}
                />
              ))}
            </tbody>
          </table>
        )}

        {/* Footer count */}
        {!isLoading && tree.length > 0 && (
          <div className="px-4 py-3 border-t border-neutral-50 dark:border-neutral-700/50 text-xs text-neutral-400 dark:text-neutral-500">
            {total} categor{total === 1 ? 'y' : 'ies'} total
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-black dark:text-white sm:max-w-lg rounded-2xl shadow-soft-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white font-serif text-xl">
              {editId ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2 overflow-y-auto flex-1 min-h-0 pr-1">
            <div>
              <Label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium mb-2 block">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-black dark:text-white rounded-xl focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-600" />
            </div>
            <div>
              <Label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium mb-2 block">Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated if empty" className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-black dark:text-white rounded-xl focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-600" />
            </div>
            <div>
              <Label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium mb-2 block">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-black dark:text-white min-h-[60px] rounded-xl focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium mb-2 block">Color</Label>
                <Input type="color" value={form.color || '#171717'} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 h-10 p-1 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium mb-2 block">Display Order</Label>
                <Input type="number" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))} className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-black dark:text-white rounded-xl focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-600" />
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <Label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium mb-2 block">Icon (Material code point)</Label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Use decimal code from <a href="https://fonts.google.com/icons" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-700 dark:hover:text-neutral-300">Google Material Icons</a>. Example: 59497 for handyman.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-neutral-500 mb-1 block">Code point (decimal)</Label>
                  <Input type="number" value={form.iconCodePoint} onChange={(e) => { const v = e.target.value; const n = parseInt(v, 10); setForm((f) => ({ ...f, iconCodePoint: v === '' ? '' : (isNaN(n) ? f.iconCodePoint : n) })); }} placeholder="59497" className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-black dark:text-white rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs text-neutral-500 mb-1 block">Font family</Label>
                  <Input value={form.iconFontFamily} onChange={(e) => setForm((f) => ({ ...f, iconFontFamily: e.target.value }))} placeholder="MaterialIcons" className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-black dark:text-white rounded-xl" />
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <Label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium mb-2 block">Category image</Label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Upload lottie (.json), SVG, PNG, or JPG. Drag and drop a file here or click to browse. Overrides icon if both are set.</p>
              <input ref={fileInputRef} type="file" accept=".json,.lottie,.svg,.png,.jpg,.jpeg" className="hidden" onChange={handleFileChange} />
              {form.imageBase64 && form.imageType ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  {form.imageType === 'lottie' ? (
                    pendingLottiePreviewData
                      ? <CategoryLottieInline animationData={pendingLottiePreviewData} size={48} />
                      : <div className="w-12 h-12 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs text-neutral-600 dark:text-neutral-400">Invalid JSON</div>
                  ) : form.imageType === 'svg' ? (
                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-neutral-900 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                      {toSafeDataImageUri('svg', form.imageBase64) ? (
                        <img src={toSafeDataImageUri('svg', form.imageBase64) || undefined} alt="" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <div className="text-[10px] text-neutral-500">Invalid image</div>
                      )}
                    </div>
                  ) : (
                    (toSafeDataImageUri(form.imageType, form.imageBase64)
                      ? <img src={toSafeDataImageUri(form.imageType, form.imageBase64) || undefined} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      : <div className="w-12 h-12 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] text-neutral-500">Invalid</div>)
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black dark:text-white truncate">Uploaded ({form.imageType})</p>
                    <p className="text-xs text-neutral-500">Ready to save</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={clearImage} className="shrink-0 border-neutral-300 dark:border-neutral-600">Remove</Button>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                  onDragEnter={handleImageDropZoneDragEnter}
                  onDragLeave={handleImageDropZoneDragLeave}
                  onDragOver={handleImageDropZoneDragOver}
                  onDrop={handleImageDropZoneDrop}
                  className={cn(
                    'w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-8 px-4 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900',
                    imageDropActive
                      ? 'border-black dark:border-white bg-neutral-100 dark:bg-neutral-800'
                      : 'border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/80',
                  )}
                >
                  <Upload className="h-5 w-5 text-neutral-500 dark:text-neutral-400" aria-hidden />
                  <span className="text-sm font-medium text-black dark:text-white text-center">
                    {imageDropActive ? 'Drop file here' : 'Choose file or drag and drop'}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 text-center">.lottie, .json, .svg, .png, .jpg</span>
                </div>
              )}
            </div>

            {/* Website image — separate from app image */}
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <Label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium mb-1 block">Website Image URL</Label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                This image appears on the public Skillance website (ServicesPage, CategoryPage). It is separate from the app icon/image above.
              </p>
              <Input
                value={form.websiteImageUrl}
                onChange={(e) => setForm((f) => ({ ...f, websiteImageUrl: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-black dark:text-white rounded-xl focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-600"
              />
              {form.websiteImageUrl && sanitizeHttpImageUrl(form.websiteImageUrl) && (
                <div className="mt-2 rounded-xl overflow-hidden aspect-[16/9] bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <img
                    src={sanitizeHttpImageUrl(form.websiteImageUrl) || undefined}
                    alt="Website image preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.display = ''; }}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch id="form-active" checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
                <Label htmlFor="form-active" className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="form-proximity" checked={form.isProximityBased} onCheckedChange={(v) => setForm((f) => ({ ...f, isProximityBased: v }))} />
                <Label htmlFor="form-proximity" className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium">Proximity Based</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="form-featured" checked={form.isFeatured} onCheckedChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))} />
                <Label htmlFor="form-featured" className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium flex items-center gap-1">
                  Featured <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="form-recurring" checked={form.supportsRecurring} onCheckedChange={(v) => setForm((f) => ({ ...f, supportsRecurring: v }))} />
                <Label htmlFor="form-recurring" className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium">Supports Recurring</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)} className="border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white rounded-full">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-black text-white hover:bg-neutral-800 rounded-full">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Deactivate Category"
        description="This will deactivate the category. It can be reactivated later."
        confirmLabel="Deactivate"
        variant="destructive"
        isLoading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminCategories;
