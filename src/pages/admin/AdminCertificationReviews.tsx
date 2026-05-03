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

interface PendingCert {
  id: string;
  name: string;
  documentUrl: string;
  mimeType?: string | null;
  originalFileName?: string | null;
  createdAt: string;
  freelancer: {
    id: string;
    userId: string;
    user: { id: string; fullName: string; email: string };
  };
}

function isImageMime(mime: string | null | undefined): boolean {
  return typeof mime === 'string' && mime.trim().toLowerCase().startsWith('image/');
}

function filenameLooksLikeImage(name: string | null | undefined): boolean {
  if (!name) return false;
  return /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(name.trim());
}

function shouldOfferInlineImagePreview(r: PendingCert): boolean {
  return isImageMime(r.mimeType) || filenameLooksLikeImage(r.originalFileName);
}

const CertificationProofAttachment: React.FC<{ row: PendingCert }> = ({ row }) => {
  const [imageBroken, setImageBroken] = useState(false);
  const tryInlineImage = shouldOfferInlineImagePreview(row) && !imageBroken;

  return (
    <div className="space-y-2">
      {tryInlineImage ? (
        <a
          href={row.documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <img
            src={row.documentUrl}
            alt={`Certification proof: ${row.name}`}
            className="max-h-[min(24rem,70vh)] w-full object-contain"
            loading="lazy"
            onError={() => setImageBroken(true)}
          />
        </a>
      ) : null}
      <a
        href={row.documentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sky-600 hover:underline dark:text-sky-400"
      >
        <FileText className="h-4 w-4 shrink-0" />
        <span className="break-all">
          {row.originalFileName || 'Open document'}
          {row.mimeType ? <span className="text-xs text-neutral-400"> ({row.mimeType})</span> : null}
        </span>
      </a>
    </div>
  );
};

const AdminCertificationReviews: React.FC = () => {
  const [rows, setRows] = useState<PendingCert[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get(ApiPaths.admin.freelancerCertificationsPending);
      if (res.success && Array.isArray(res.data)) {
        setRows(res.data);
      } else {
        setRows([]);
      }
    } catch {
      toast.error('Failed to load certification queue');
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
      const res = await post(ApiPaths.admin.freelancerCertificationVerify(id), {
        status,
        ...(status === 'rejected' ? { rejectionReason: rejectReason.trim() } : {}),
      });
      if (res.success) {
        toast.success(status === 'verified' ? 'Certification approved' : 'Certification rejected');
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
        title="Certification proofs"
        description="Review PDF, Word, or image uploads that freelancers attached to their certifications."
      />

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-neutral-500">No pending certification uploads.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r.id}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex flex-wrap items-center gap-2">
                    {r.name}
                    <span className="text-sm font-normal text-neutral-500">· {r.freelancer.user.fullName}</span>
                    <Link
                      to={`/admin/freelancers/${r.freelancer.id}`}
                      className="inline-flex items-center gap-1 text-sm font-normal text-sky-600 hover:underline"
                    >
                      Profile <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </CardTitle>
                  <p className="text-xs text-neutral-500">{r.freelancer.user.email}</p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <CertificationProofAttachment row={r} />
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

export default AdminCertificationReviews;
