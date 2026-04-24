import React, { useState, useEffect, useCallback } from 'react';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import PageHeader from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LimitRequestRow {
  id: string;
  reason: string;
  requestedMaxRootCategories: number;
  requestedMaxServiceOffers: number;
  status: string;
  createdAt: string;
  denialReason?: string | null;
  freelancer: {
    id: string;
    userId: string;
    categoryIds: string[];
    user: { id: string; fullName: string; email: string };
  };
}

const AdminCategoryLimitRequests: React.FC = () => {
  const [rows, setRows] = useState<LimitRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [denyId, setDenyId] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get(`${ApiPaths.admin.freelancerCategoryLimitRequests}?status=pending`);
      if (res.success && Array.isArray(res.data)) {
        setRows(res.data);
      } else {
        setRows([]);
      }
    } catch {
      toast.error('Failed to load requests');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const approve = async (id: string) => {
    try {
      const res = await post(ApiPaths.admin.freelancerCategoryLimitRequestApprove(id), {});
      if (res.success) {
        toast.success('Request approved');
        void load();
      } else {
        toast.error(res.message || 'Approve failed');
      }
    } catch {
      toast.error('Approve failed');
    }
  };

  const deny = async (id: string) => {
    const reason = denyReason.trim();
    if (reason.length < 3) {
      toast.error('Enter a short reason (3+ characters)');
      return;
    }
    try {
      const res = await post(ApiPaths.admin.freelancerCategoryLimitRequestDeny(id), {
        denialReason: reason,
      });
      if (res.success) {
        toast.success('Request denied');
        setDenyId(null);
        setDenyReason('');
        void load();
      } else {
        toast.error(res.message || 'Deny failed');
      }
    } catch {
      toast.error('Deny failed');
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-10 max-w-4xl">
      <PageHeader
        title="Category & service limits"
        description="Freelancers default to 5 top-level categories and up to 20 bookable services. Approve or deny requests for higher caps."
      />

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-neutral-500">No pending limit requests.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r.id}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex flex-wrap items-center gap-2">
                    {r.freelancer.user.fullName}
                    <Link
                      to={`/admin/freelancers/${r.freelancer.id}`}
                      className="inline-flex items-center gap-1 text-sm font-normal text-sky-600 hover:underline"
                    >
                      Open profile <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </CardTitle>
                  <p className="text-xs text-neutral-500">{r.freelancer.user.email}</p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>
                    <span className="text-neutral-500">Requested caps: </span>
                    {r.requestedMaxRootCategories} categories, {r.requestedMaxServiceOffers} services
                  </p>
                  <div>
                    <p className="text-neutral-500 text-xs mb-1">Reason</p>
                    <p className="whitespace-pre-wrap rounded-md bg-neutral-50 dark:bg-neutral-900 p-3 border border-neutral-100 dark:border-neutral-800">
                      {r.reason}
                    </p>
                  </div>
                  {denyId === r.id ? (
                    <div className="space-y-2 pt-2">
                      <Textarea
                        placeholder="Denial reason (shown to internal logs / support)"
                        value={denyReason}
                        onChange={(e) => setDenyReason(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setDenyId(null); setDenyReason(''); }}>
                          Cancel
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => void deny(r.id)}>
                          Confirm deny
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button size="sm" onClick={() => void approve(r.id)} className="gap-1">
                        <CheckCircle className="h-4 w-4" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDenyId(r.id)} className="gap-1">
                        <XCircle className="h-4 w-4" /> Deny
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminCategoryLimitRequests;
