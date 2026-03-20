import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { get, post, put, del } from '@/lib/api';
import { Plus, Edit, Trash2, FolderOpen, Loader2, Upload, ImageIcon, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import PageHeader from '@/components/admin/PageHeader';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import { CategoryLottieThumb, CategoryLottieInline, isLottieImageUrl } from '@/components/admin/CategoryLottieThumb';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ImageType = 'lottie' | 'svg' | 'png' | 'jpg';

interface CategoryItem {
  id: string;
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
  isFeatured: boolean;
  supportsRecurring?: boolean;
}

interface CategoryStats { total: number; active: number; inactive: number; withFreelancers: number; mostPopular: any[]; }

const emptyForm = {
  name: '', slug: '', description: '', color: '', isActive: true, displayOrder: 0,
  isProximityBased: false, isFeatured: false, supportsRecurring: false,
  iconCodePoint: '' as string | number, iconFontFamily: 'MaterialIcons',
  imageBase64: null as string | null, imageType: null as ImageType | null,
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

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageDropActive, setImageDropActive] = useState(false);

  const fetchCategories = useCallback(async () => { try { setIsLoading(true); const res = await get(`/admin/categories?includeInactive=true&page=${page}&limit=${pageSize}`); if (res.success) { setCategories(res.data.categories || []); setTotal(res.data.total || 0); } } catch { toast.error('Failed to load categories'); } finally { setIsLoading(false); } }, [page, pageSize]);
  const fetchStats = useCallback(async () => { try { const res = await get('/admin/categories/stats'); if (res.success) setStats(res.data); } catch {} }, []);
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

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (cat: CategoryItem) => {
    setEditId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      color: cat.color || '',
      isActive: cat.isActive,
      displayOrder: cat.displayOrder,
      isProximityBased: cat.isProximityBased,
      isFeatured: cat.isFeatured,
      supportsRecurring: cat.supportsRecurring ?? false,
      iconCodePoint: cat.iconCodePoint ?? '',
      iconFontFamily: cat.iconFontFamily || 'MaterialIcons',
      imageBase64: null,
      imageType: null,
    });
    setFormOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processCategoryImageFile(file);
    e.target.value = '';
  };

  const handleImageDropZoneDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    imageDropDepthRef.current += 1;
    if (imageDropDepthRef.current === 1) setImageDropActive(true);
  };

  const handleImageDropZoneDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    imageDropDepthRef.current -= 1;
    if (imageDropDepthRef.current <= 0) {
      imageDropDepthRef.current = 0;
      setImageDropActive(false);
    }
  };

  const handleImageDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleImageDropZoneDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    imageDropDepthRef.current = 0;
    setImageDropActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processCategoryImageFile(file);
  };

  const clearImage = () => setForm((f) => ({ ...f, imageBase64: null, imageType: null }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        name: form.name,
        description: form.description || undefined,
        color: form.color || undefined,
        isActive: form.isActive,
        displayOrder: form.displayOrder,
        isProximityBased: form.isProximityBased,
        isFeatured: form.isFeatured,
        supportsRecurring: form.supportsRecurring,
        iconFontFamily: form.iconFontFamily || undefined,
      };
      if (form.slug) payload.slug = form.slug;
      const iconCode = typeof form.iconCodePoint === 'number' ? form.iconCodePoint : parseInt(String(form.iconCodePoint), 10);
      if (!isNaN(iconCode)) payload.iconCodePoint = iconCode;
      if (form.imageBase64 && form.imageType) {
        payload.image = form.imageBase64;
        payload.imageType = form.imageType;
      }
      if (editId) {
        await put(`/admin/categories/${editId}`, payload);
        toast.success('Category updated');
      } else {
        await post('/admin/categories', payload);
        toast.success('Category created');
      }
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
  const handleDelete = async () => { if (!deleteId) return; try { setDeleting(true); await del(`/admin/categories/${deleteId}`); toast.success('Category deactivated'); setDeleteOpen(false); setDeleteId(null); fetchCategories(); fetchStats(); } catch (err: any) { toast.error(err?.message || 'Failed to delete category'); } finally { setDeleting(false); } };

  const pendingLottiePreviewData = useMemo(() => {
    if (form.imageType !== 'lottie' || !form.imageBase64) return null;
    try {
      const text = atob(form.imageBase64);
      return JSON.parse(text) as unknown;
    } catch {
      return null;
    }
  }, [form.imageType, form.imageBase64]);

  const CategoryIconPreview: React.FC<{ c: CategoryItem }> = ({ c }) => {
    if (c.imageUrl) {
      if (isLottieImageUrl(c.imageUrl)) {
        return <CategoryLottieThumb key={c.imageUrl} src={c.imageUrl} size={32} />;
      }
      return (
        <img src={c.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700" />
      );
    }
    if (c.iconCodePoint != null) {
      return (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xl" style={{ fontFamily: 'Material Icons' }} title={`Icon code: ${c.iconCodePoint}`}>
          {String.fromCodePoint(c.iconCodePoint)}
        </div>
      );
    }
    return <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"><ImageIcon className="h-4 w-4 text-neutral-400" /></div>;
  };

  const columns: Column<CategoryItem>[] = [
    { key: 'name', header: 'Name', render: (c) => (
      <div className="flex items-center gap-3">
        <CategoryIconPreview c={c} />
        {c.color && <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />}
        <div>
          <p className="text-black dark:text-white font-medium text-sm">{c.name}</p>
          <p className="text-neutral-400 dark:text-neutral-500 text-xs">{c.slug}</p>
        </div>
        {c.isFeatured && <span title="Featured"><Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" /></span>}
      </div>
    ) },
    { key: 'freelancerCount', header: 'Freelancers', render: (c) => <span className="text-neutral-600 dark:text-neutral-300">{c.freelancerCount ?? '--'}</span> },
    { key: 'isActive', header: 'Status', render: (c) => <StatusBadge status={c.isActive ? 'active' : 'suspended'} label={c.isActive ? 'Active' : 'Inactive'} /> },
    { key: 'displayOrder', header: 'Order', render: (c) => <span className="text-neutral-500 dark:text-neutral-400">{c.displayOrder}</span> },
    { key: 'actions', header: 'Actions', render: (c) => (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" className="h-7 px-2 text-neutral-400 hover:text-black dark:hover:text-white" onClick={(e) => { e.stopPropagation(); openEdit(c); }}><Edit className="h-3.5 w-3.5" /></Button>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); setDeleteId(c.id); setDeleteOpen(true); }}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    ) },
  ];

  const statsCards = stats ? [
    { title: 'Total Categories', value: stats.total.toLocaleString(), icon: FolderOpen, color: '#171717' },
    { title: 'Active', value: stats.active.toLocaleString(), icon: FolderOpen, color: '#10b981' },
    { title: 'With Freelancers', value: stats.withFreelancers.toLocaleString(), icon: FolderOpen, color: '#8b5cf6' },
  ] : [];

  return (
    <div className="space-y-10">
      <PageHeader title="Categories" description="Manage service categories">
        <Button size="sm" onClick={openCreate} className="bg-black text-white hover:bg-neutral-800 rounded-full"><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
      </PageHeader>
      {stats && <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{statsCards.map((s, i) => <StatsCard key={s.title} {...s} index={i} />)}</div>}
      <DataTable columns={columns} data={categories} isLoading={isLoading} emptyTitle="No categories found" page={page} pageSize={pageSize} total={total} onPageChange={setPage} />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-black dark:text-white sm:max-w-lg rounded-2xl shadow-soft-lg max-h-[90vh] flex flex-col">
          <DialogHeader><DialogTitle className="text-black dark:text-white font-serif text-xl">{editId ? 'Edit Category' : 'Create Category'}</DialogTitle></DialogHeader>
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
                    pendingLottiePreviewData ? (
                      <CategoryLottieInline animationData={pendingLottiePreviewData} size={48} />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs text-neutral-600 dark:text-neutral-400">Invalid JSON</div>
                    )
                  ) : form.imageType === 'svg' ? (
                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-neutral-900 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                      <img src={`data:image/svg+xml;base64,${form.imageBase64}`} alt="" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <img src={`data:image/${form.imageType};base64,${form.imageBase64}`} alt="" className="w-12 h-12 rounded-lg object-cover" />
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
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
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                    .lottie, .json, .svg, .png, .jpg
                  </span>
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
                <Label htmlFor="form-featured" className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium flex items-center gap-1">Featured <Star className="h-3 w-3 text-amber-500 fill-amber-500" /></Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="form-recurring" checked={form.supportsRecurring} onCheckedChange={(v) => setForm((f) => ({ ...f, supportsRecurring: v }))} />
                <Label htmlFor="form-recurring" className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium">Supports Recurring</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)} className="border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white rounded-full">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-black text-white hover:bg-neutral-800 rounded-full">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editId ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Deactivate Category" description="This will deactivate the category. It can be reactivated later." confirmLabel="Deactivate" variant="destructive" isLoading={deleting} onConfirm={handleDelete} />
    </div>
  );
};

export default AdminCategories;
