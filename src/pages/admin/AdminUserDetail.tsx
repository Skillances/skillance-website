import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get, put } from '@/lib/api';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import PageHeader from '@/components/admin/PageHeader';
import DetailCard, { type DetailField } from '@/components/admin/DetailCard';
import StatusBadge from '@/components/admin/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface UserData { id: string; firebaseUid: string; email: string; fullName: string; tag: string; phoneNumber: string | null; profilePhotoUrl: string | null; userType: string; isAdmin: boolean; createdAt: string; updatedAt: string; freelancer: any | null; }

const AdminUserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phoneNumber: '', userType: '', isAdmin: false });

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const res = await get(`/admin/users/${userId}`);
        if (res.success) { setUser(res.data); setEditForm({ fullName: res.data.fullName || '', phoneNumber: res.data.phoneNumber || '', userType: res.data.userType, isAdmin: res.data.isAdmin }); }
      } catch { toast.error('Failed to load user'); }
      finally { setIsLoading(false); }
    };
    if (userId) fetch();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    try {
      setSaving(true);
      const payload: any = {};
      if (editForm.fullName !== user?.fullName) payload.fullName = editForm.fullName;
      if (editForm.phoneNumber !== (user?.phoneNumber || '')) payload.phoneNumber = editForm.phoneNumber;
      if (editForm.userType !== user?.userType) payload.userType = editForm.userType;
      if (editForm.isAdmin !== user?.isAdmin) payload.isAdmin = editForm.isAdmin;
      if (Object.keys(payload).length === 0) { setEditOpen(false); return; }
      const res = await put(`/admin/users/${userId}`, payload);
      if (res.success) { setUser(res.data); setEditOpen(false); toast.success('User updated successfully'); }
    } catch (err: any) { toast.error(err?.message || 'Failed to update user'); }
    finally { setSaving(false); }
  };

  if (isLoading) return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-64 bg-neutral-100 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 bg-neutral-100 rounded-2xl" />
        <Skeleton className="h-64 bg-neutral-100 rounded-2xl" />
      </div>
    </div>
  );

  if (!user) return (
    <div className="text-center py-20">
      <p className="text-neutral-500">User not found</p>
      <Button variant="outline" className="mt-4 rounded-full" onClick={() => navigate('/admin/users')}>Back to Users</Button>
    </div>
  );

  const profileFields: DetailField[] = [
    { label: 'Full Name', value: user.fullName }, { label: 'Tag', value: `@${user.tag}` },
    { label: 'Email', value: user.email }, { label: 'Phone', value: user.phoneNumber || '--' },
    { label: 'User Type', value: <StatusBadge status={user.userType as any} /> },
    { label: 'Admin', value: user.isAdmin ? <StatusBadge status="admin" /> : 'No' },
  ];
  const systemFields: DetailField[] = [
    { label: 'User ID', value: <span className="font-mono text-xs">{user.id}</span> },
    { label: 'Firebase UID', value: <span className="font-mono text-xs truncate block max-w-[200px]">{user.firebaseUid}</span> },
    { label: 'Created', value: new Date(user.createdAt).toLocaleString() },
    { label: 'Updated', value: new Date(user.updatedAt).toLocaleString() },
  ];
  const freelancerFields: DetailField[] = user.freelancer ? [
    { label: 'Freelancer ID', value: <span className="font-mono text-xs">{user.freelancer.id}</span> },
    { label: 'ID Verification', value: <StatusBadge status={user.freelancer.idVerificationStatus || 'not_submitted'} /> },
    { label: 'Verified', value: user.freelancer.isVerified ? <StatusBadge status="verified" /> : <StatusBadge status="pending" label="Unverified" /> },
    { label: 'Rating', value: user.freelancer.rating ? `${user.freelancer.rating.toFixed(1)} / 5` : 'No ratings' },
  ] : [];

  return (
    <div className="space-y-10">
      <PageHeader title={user.fullName} description={user.email}>
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')} className="border-neutral-200 text-neutral-500 hover:text-black hover:border-neutral-300 rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button size="sm" onClick={() => setEditOpen(true)} className="bg-black text-white hover:bg-neutral-800 rounded-full">
          <Edit className="mr-2 h-4 w-4" /> Edit User
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetailCard title="Profile Information" fields={profileFields} />
        <DetailCard title="System Information" fields={systemFields} />
        {user.freelancer && <DetailCard title="Freelancer Profile" fields={freelancerFields} className="lg:col-span-2" />}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-white border-neutral-200 text-black sm:max-w-md rounded-2xl shadow-soft-lg">
          <DialogHeader><DialogTitle className="text-black font-serif text-xl">Edit User</DialogTitle></DialogHeader>
          <div className="space-y-5 py-2">
            <div>
              <label className="text-xs text-neutral-400 uppercase tracking-widest font-medium mb-2 block">Full Name</label>
              <Input value={editForm.fullName} onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))} className="bg-white border-neutral-200 text-black rounded-xl focus-visible:ring-neutral-300" />
            </div>
            <div>
              <label className="text-xs text-neutral-400 uppercase tracking-widest font-medium mb-2 block">Phone Number</label>
              <Input value={editForm.phoneNumber} onChange={(e) => setEditForm((f) => ({ ...f, phoneNumber: e.target.value }))} className="bg-white border-neutral-200 text-black rounded-xl focus-visible:ring-neutral-300" />
            </div>
            <div>
              <label className="text-xs text-neutral-400 uppercase tracking-widest font-medium mb-2 block">User Type</label>
              <Select value={editForm.userType} onValueChange={(v) => setEditForm((f) => ({ ...f, userType: v }))}>
                <SelectTrigger className="bg-white border-neutral-200 text-black w-full rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-neutral-200 rounded-xl shadow-soft">
                  <SelectItem value="customer" className="text-neutral-600 focus:bg-neutral-50 focus:text-black rounded-lg">Customer</SelectItem>
                  <SelectItem value="freelancer" className="text-neutral-600 focus:bg-neutral-50 focus:text-black rounded-lg">Freelancer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-neutral-400 uppercase tracking-widest font-medium">Admin Access</label>
              <button onClick={() => setEditForm((f) => ({ ...f, isAdmin: !f.isAdmin }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${editForm.isAdmin ? 'bg-black' : 'bg-neutral-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${editForm.isAdmin ? 'translate-x-6 bg-white' : 'translate-x-1 bg-neutral-400'}`} />
              </button>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)} className="border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-black rounded-full">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-black text-white hover:bg-neutral-800 rounded-full">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserDetail;
