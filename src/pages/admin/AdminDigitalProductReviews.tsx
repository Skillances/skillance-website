import React, { useState, useEffect, useCallback } from 'react';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import PageHeader from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ADMIN_QUEUE_HINT_EVENT } from '@/lib/adminQueueEvents';
import { CheckCircle, XCircle, ExternalLink, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PendingDigitalSku {
  id: string;
  title: string;
  description?: string | null;
  price: string | number;
  fileType: string;
  documentUrl: string;
  createdAt: string;
  freelancer: {
    id: string;
    userId: string;
    user: { id: string; fullName: string; email: string };
  };
}

function formatPriceZar(price: string | number): string {
  const n = typeof price === 'number' ? price : Number.parseFloat(String(price));
  if (Number.isFinite(n)) {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }).format(n);
  }
  return String(price);
}

const AdminDigitalProductReviews: React.FC = () => {
  const [rows, setRows] = useState<PendingDigitalSku[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get(ApiPaths.admin.digitalProductsPending);
      if (res.success && Array.isArray(res.data)) {
        setRows(res.data as PendingDigitalSku[]);
      } else {
        setRows([]);
      }
    } catch {
      toast.error('Failed to load digital product queue');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onHint = () => void load();
    window.addEventListener(ADMIN_QUEUE_HINT_EVENT, onHint);
    return () => window.removeEventListener(ADMIN_QUEUE_HINT_EVENT, onHint);
  }, [load]);

  const verify = async (id: string, status: 'verified' | 'rejected') => {
    if (status === 'rejected') {
      const reason = rejectReason.trim();
      if (reason.length < 3) {
        toast.error('Enter a rejection reason (3+ characters)');
        return;
      }
    }
    try {
      const res = await post(ApiPaths.admin.digitalProductVerify(id), {
        status,
        ...(status === 'rejected' ? { rejectionReason: rejectReason.trim() } : {}),
      });
      if (res.success) {
        toast.success(status === 'verified' ? 'Digital product approved' : 'Digital product rejected');
        setRejectId(null);
        setRejectReason('');
        void load();
      } else {
        toast.error(res.message || 'Action failed');
      }
    } catch {
      toast.error('Request failed');
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-10 max-w-4xl">
      <PageHeader
        title="Digital products"
        description="Review freelancer documents listed for sale. Only approved items appear publicly and can be purchased."
      />

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-neutral-500">No digital products pending review.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r.id}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex flex-wrap items-center gap-2">
                    {r.title}
                    <span className="text-sm font-normal text-neutral-500">
                      · {formatPriceZar(r.price)}
                    </span>
                    <span className="text-sm font-normal text-neutral-500">
                      · {r.freelancer.user.fullName}
                    </span>
                    <Link
                      to={`/admin/freelancers/${r.freelancer.id}`}
                      className="inline-flex items-center gap-1 text-sm font-normal text-sky-600 hover:underline"
                    >
                      Profile <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </CardTitle>
                  <p className="text-xs text-neutral-500">{r.freelancer.user.email}</p>
                  {r.description && r.description.trim() ? (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 pt-1">{r.description}</p>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <a
                    href={r.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sky-600 hover:underline dark:text-sky-400"
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="break-all">
                      Open document
                      <span className="text-xs text-neutral-400"> ({r.fileType})</span>
                    </span>
                  </a>
                  {rejectId === r.id ? (
                    <div className="space-y-2 pt-2">
                      <Textarea
                        placeholder="Rejection reason (required)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setRejectId(null); setRejectReason(''); }}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => void verify(r.id, 'rejected')}
                        >
                          Confirm reject
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button size="sm" onClick={() => void verify(r.id, 'verified')} className="gap-1">
                        <CheckCircle className="h-4 w-4" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setRejectId(r.id)} className="gap-1">
                        <XCircle className="h-4 w-4" /> Reject
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

export default AdminDigitalProductReviews;
