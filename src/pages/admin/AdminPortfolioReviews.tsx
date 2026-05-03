import React, { useState, useEffect, useCallback } from 'react';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import PageHeader from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ADMIN_QUEUE_HINT_EVENT } from '@/lib/adminQueueEvents';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PendingPortfolioRow {
  id: string;
  title: string;
  description?: string | null;
  imageUrls: string[];
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  freelancer: {
    id: string;
    userId: string;
    user: { id: string; fullName: string; email: string };
  };
}

const AdminPortfolioReviews: React.FC = () => {
  const [rows, setRows] = useState<PendingPortfolioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get(ApiPaths.admin.portfolioProjectsPending);
      if (res.success && Array.isArray(res.data)) {
        setRows(res.data as PendingPortfolioRow[]);
      } else {
        setRows([]);
      }
    } catch {
      toast.error('Failed to load portfolio review queue');
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
      const res = await post(ApiPaths.admin.portfolioProjectVerify(id), {
        status,
        ...(status === 'rejected' ? { rejectionReason: rejectReason.trim() } : {}),
      });
      if (res.success) {
        toast.success(status === 'verified' ? 'Portfolio project approved' : 'Portfolio project rejected');
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
        title="Portfolio / previous work"
        description="Review freelancer showcase projects. Only approved items appear on public profiles."
      />

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-neutral-500">No portfolio projects pending review.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r.id}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex flex-wrap items-center gap-2">
                    {r.title}
                    <Link
                      to={`/admin/freelancers/${r.freelancer.id}`}
                      className="text-xs font-normal text-neutral-500 hover:text-black dark:hover:text-white inline-flex items-center gap-1"
                    >
                      {r.freelancer.user.fullName}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </CardTitle>
                  <p className="text-xs text-neutral-500">{r.freelancer.user.email}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {r.description ? (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">{r.description}</p>
                  ) : null}
                  {r.imageUrls.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {r.imageUrls.map((url, i) => (
                        <a
                          key={`${r.id}-img-${i}`}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-50 dark:bg-neutral-900"
                        >
                          <img
                            src={url}
                            alt=""
                            className="w-28 h-28 object-cover"
                            loading="lazy"
                          />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400">No images on this project.</p>
                  )}
                  {rejectId === r.id ? (
                    <div className="space-y-2 pt-2">
                      <Textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason for rejection…"
                        className="min-h-[72px] rounded-xl"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setRejectId(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => void verify(r.id, 'rejected')}>
                          Confirm reject
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => void verify(r.id, 'verified')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => setRejectId(r.id)}>
                        <XCircle className="h-4 w-4 mr-1" /> Reject
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

export default AdminPortfolioReviews;
