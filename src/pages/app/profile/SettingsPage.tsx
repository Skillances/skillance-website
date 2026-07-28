import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { post } from '@/lib/api';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phoneNumber ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await post(`/users/${user.id}`, {
        fullName: fullName.trim(),
        phoneNumber: phone.trim(),
      });
      await refreshUser();
      toast.success('Profile updated');
    } catch {
      toast.error('Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <Link to="/app/profile" className="text-sm text-neutral-500">
          Profile
        </Link>
        <h1 className="text-2xl font-semibold mt-1">Settings</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-4 bg-white border border-neutral-200 rounded-2xl p-6">
        <div className="space-y-2">
          <Label>Full name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email ?? ''} disabled className="bg-neutral-50" />
        </div>
        <Button type="submit" className="rounded-full" disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
      </form>

      <div className="text-sm space-y-2 text-neutral-600">
        <Link to="/terms" className="block hover:text-neutral-900">
          Terms of Service
        </Link>
        <Link to="/privacy-policy" className="block hover:text-neutral-900">
          Privacy Policy
        </Link>
        <Link to="/refund-policy" className="block hover:text-neutral-900">
          Refund Policy
        </Link>
      </div>
    </div>
  );
}
