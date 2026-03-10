import React, { useState, useEffect, useCallback } from 'react';
import { get, post, put, del } from '@/lib/api';
import { Plus, Edit, Trash2, FolderOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import PageHeader from '@/components/admin/PageHeader';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import { toast } from 'sonner';

interface CategoryItem { id: string; name: string; slug: string; description: string | null; isActive: boolean; displayOrder: number; freelancerCount?: number; color: string | null; isProximityBased: boolean; }
interface CategoryStats { total: number; active: number; inactive: number; withFreelancers: number; mostPopular: any[]; }

const emptyForm = { name: '', slug: '', description: '', color: '', isActive: true, displayOrder: 0, isProximityBased: false };

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

  const fetchCategories = useCallback(async () => { try { setIsLoading(true); const res = await get(`/admin/categories?includeInactive=true&page=${page}&limit=${pageSize}`); if (res.success) { setCategories(res.data.categories || []); setTotal(res.data.total || 0); } } catch { toast.error('Failed to load categories'); } finally { setIsLoading(false); } }, [page, pageSize]);
  const fetchStats = useCallback(async () => { try { const res = await get('/admin/categories/stats'); if (res.success) setStats(res.data); } catch {} }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (cat: CategoryItem) => { setEditId(cat.id); setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', color: cat.color || '', isActive: cat.isActive, displayOrder: cat.displayOrder, isProximityBased: cat.isProximityBased }); setFormOpen(true); };

  const handleSave = async () => { if (!form.name.trim()) { toast.error('Name is required'); return; } try { setSaving(true); const payload: any = { name: form.name, description: form.description || undefined, color: form.color || undefined, isActive: form.isActive, displayOrder: form.displayOrder, isProximityBased: form.isProximityBased }; if (form.slug) payload.slug = form.slug; if (editId) { await put(`/admin/categories/${editId}`, payload); toast.success('Category updated'); } else { await post('/admin/categories', payload); toast.success('Category created'); } setFormOpen(false); fetchCategories(); fetchStats(); } catch (err: any) { toast.error(err?.message || 'Failed to save category'); } finally { setSaving(false); } };
  const handleDelete = async () => { if (!deleteId) return; try { setDeleting(true); await del(`/admin/categories/${deleteId}`); toast.success('Category deactivated'); setDeleteOpen(false); setDeleteId(null); fetchCategories(); fetchStats(); } catch (err: any) { toast.error(err?.message || 'Failed to delete category'); } finally { setDeleting(false); } };

  const columns: Column<CategoryItem>[] = [
    { key: 'name', header: 'Name', render: (c) => (<div className="flex items-center gap-3">{c.color && <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />}<div><p className="text-black dark:text-white font-medium text-sm">{c.name}</p><p className="text-neutral-400 dark:text-neutral-500 text-xs">{c.slug}</p></div></div>) },
    { key: 'freelancerCount', header: 'Freelancers', render: (c) => <span className="text-neutral-600 dark:text-neutral-300">{c.freelancerCount ?? '--'}</span> },
    { key: 'isActive', header: 'Status', render: (c) => <StatusBadge status={c.isActive ? 'active' : 'suspended'} label={c.isActive ? 'Active' : 'Inactive'} /> },
    { key: 'displayOrder', header: 'Order', render: (c) => <span className="text-neutral-500 dark:text-neutral-400">{c.displayOrder}</span> },
    { key: 'actions', header: 'Actions', render: (c) => (<div className="flex items-center gap-2"><Button size="sm" variant="ghost" className="h-7 px-2 text-neutral-400 hover:text-black dark:hover:text-white" onClick={(e) => { e.stopPropagation(); openEdit(c); }}><Edit className="h-3.5 w-3.5" /></Button><Button size="sm" variant="ghost" className="h-7 px-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); setDeleteId(c.id); setDeleteOpen(true); }}><Trash2 className="h-3.5 w-3.5" /></Button></div>) },
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
        <DialogContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-black dark:text-white sm:max-w-md rounded-2xl shadow-soft-lg">
          <DialogHeader><DialogTitle className="text-black dark:text-white font-serif text-xl">{editId ? 'Edit Category' : 'Create Category'}</DialogTitle></DialogHeader>
          <div className="space-y-5 py-2">
            <div><label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium mb-2 block">Name *</label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-black dark:text-white rounded-xl focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-600" /></div>
            <div><label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium mb-2 block">Slug</label><Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated if empty" className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-black dark:text-white rounded-xl focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-600" /></div>
            <div><label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium mb-2 block">Description</label><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-black dark:text-white min-h-[60px] rounded-xl focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-600" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium mb-2 block">Color</label><Input type="color" value={form.color || '#171717'} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 h-10 p-1 rounded-xl" /></div>
              <div><label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium mb-2 block">Display Order</label><Input type="number" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))} className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-black dark:text-white rounded-xl focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-600" /></div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium">Active</label>
                <button onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${form.isActive ? 'bg-black dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-700'}`} aria-label={form.isActive ? 'Active (on)' : 'Active (off)'}><span className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${form.isActive ? 'translate-x-6 bg-white dark:bg-black' : 'translate-x-1 bg-neutral-400'}`} /></button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium">Proximity Based</label>
                <button onClick={() => setForm((f) => ({ ...f, isProximityBased: !f.isProximityBased }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${form.isProximityBased ? 'bg-black dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-700'}`} aria-label={form.isProximityBased ? 'Proximity-based (on)' : 'Proximity-based (off)'}><span className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${form.isProximityBased ? 'translate-x-6 bg-white dark:bg-black' : 'translate-x-1 bg-neutral-400'}`} /></button>
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
