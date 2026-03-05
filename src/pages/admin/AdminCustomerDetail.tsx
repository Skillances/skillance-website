import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/admin/PageHeader';
import DetailCard, { type DetailField } from '@/components/admin/DetailCard';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const AdminCustomerDetail: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { const fetch = async () => { try { setIsLoading(true); const res = await get(`/admin/customers/${customerId}`); if (res.success) setCustomer(res.data); } catch { toast.error('Failed to load customer'); } finally { setIsLoading(false); } }; if (customerId) fetch(); }, [customerId]);

  if (isLoading) return (<div className="space-y-8"><Skeleton className="h-10 w-64 bg-neutral-100 rounded" /><Skeleton className="h-64 bg-neutral-100 rounded-2xl" /></div>);
  if (!customer) return (<div className="text-center py-20"><p className="text-neutral-500">Customer not found</p><Button variant="outline" className="mt-4 rounded-full" onClick={() => navigate('/admin/customers')}>Back</Button></div>);

  const profileFields: DetailField[] = [{ label: 'Full Name', value: customer.fullName }, { label: 'Tag', value: `@${customer.tag}` }, { label: 'Email', value: customer.email }, { label: 'Phone', value: customer.phoneNumber || '--' }];
  const systemFields: DetailField[] = [{ label: 'User ID', value: <span className="font-mono text-xs">{customer.id}</span> }, { label: 'Firebase UID', value: <span className="font-mono text-xs truncate block max-w-[200px]">{customer.firebaseUid}</span> }, { label: 'Created', value: new Date(customer.createdAt).toLocaleString() }, { label: 'Updated', value: new Date(customer.updatedAt).toLocaleString() }];

  return (
    <div className="space-y-10">
      <PageHeader title={customer.fullName} description={customer.email}>
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/customers')} className="border-neutral-200 text-neutral-500 hover:text-black hover:border-neutral-300 rounded-full"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
      </PageHeader>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetailCard title="Profile Information" fields={profileFields} />
        <DetailCard title="System Information" fields={systemFields} />
      </div>
    </div>
  );
};

export default AdminCustomerDetail;
