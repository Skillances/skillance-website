import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, put, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import PageHeader from '@/components/admin/PageHeader';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { ADMIN_QUEUE_HINT_EVENT } from '@/lib/adminQueueEvents';
import { toast } from 'sonner';

interface PendingFreelancer {
  id: string;
  idNumber?: string | null;
  idVerificationStatus: string;
  policeClearanceStatus?: string | null;
  /** Presigned GET URL (admin freelancers list) */
  policeClearancePhotoUrl?: string | null;
  idFrontPhotoUrl?: string | null;
  idBackPhotoUrl?: string | null;
  selfiePhotoUrl?: string | null;
  createdAt: string;
  fullName?: string;
  email?: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    tag: string;
    policeClearanceStatus?: string | null;
    policeClearanceDocumentUrl?: string | null;
  };
}

function VerificationDocPreview({ variant, f }: { variant: 'id' | 'clearance'; f: PendingFreelancer }) {
  if (variant === 'id') {
    const imgs = [
      { label: 'ID front', url: f.idFrontPhotoUrl },
      { label: 'ID back', url: f.idBackPhotoUrl },
      { label: 'Selfie', url: f.selfiePhotoUrl },
    ].filter((x): x is { label: string; url: string } => Boolean(x.url));
    if (imgs.length === 0) {
      return <p className="text-xs text-neutral-500 dark:text-neutral-400">No ID images uploaded yet.</p>;
    }
    return (
      <div className="flex flex-col gap-3 max-h-[min(70vh,420px)] overflow-y-auto pr-1">
        {imgs.map(({ label, url }) => (
          <div key={label} className="space-y-1">
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{label}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-50 dark:bg-neutral-900"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={url} alt={label} className="w-full max-w-[320px] h-auto object-contain max-h-52" loading="lazy" />
            </a>
          </div>
        ))}
      </div>
    );
  }
  const clearance = f.policeClearancePhotoUrl ?? null;
  if (!clearance) {
    return <p className="text-xs text-neutral-500 dark:text-neutral-400">No police clearance document.</p>;
  }
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Police clearance</p>
      <a
        href={clearance}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-50 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={clearance} alt="Police clearance document" className="w-full max-w-[320px] h-auto object-contain max-h-52" loading="lazy" />
      </a>
    </div>
  );
}

function PreviewEyeButton({
  variant,
  f,
  onProfileClick,
}: {
  variant: 'id' | 'clearance';
  f: PendingFreelancer;
  onProfileClick: () => void;
}) {
  return (
    <HoverCard openDelay={220} closeDelay={80}>
      <HoverCardTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-neutral-400 hover:text-black dark:hover:text-white"
          title="Hover to preview · click to open profile"
          onClick={(e) => {
            e.stopPropagation();
            onProfileClick();
          }}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-auto max-w-[min(92vw,380px)] p-3 shadow-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
        side="left"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <VerificationDocPreview variant={variant} f={f} />
        <p className="mt-2 text-[10px] text-neutral-400 leading-snug">Click an image to open full size in a new tab.</p>
      </HoverCardContent>
    </HoverCard>
  );
}

const AdminVerifications: React.FC = () => {
  const navigate = useNavigate();
  const [pendingId, setPendingId] = useState<PendingFreelancer[]>([]);
  const [pendingClearance, setPendingClearance] = useState<PendingFreelancer[]>([]);
  const [isLoadingId, setIsLoadingId] = useState(true);
  const [isLoadingClearance, setIsLoadingClearance] = useState(true);
  const [actionFreelancer, setActionFreelancer] = useState<PendingFreelancer | null>(null);
  const [actionType, setActionType] = useState<'id' | 'clearance'>('id');
  const [actionStatus, setActionStatus] = useState<'verified' | 'rejected'>('verified');
  const [rejectionReason, setRejectionReason] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingId = useCallback(async () => { try { setIsLoadingId(true); const res = await get(`${ApiPaths.admin.freelancersPendingVerification}?status=pending&limit=100`); if (res.success) setPendingId(res.data.freelancers || []); } catch { toast.error('Failed to load pending ID verifications'); } finally { setIsLoadingId(false); } }, []);
  const fetchPendingClearance = useCallback(async () => {
    try {
      setIsLoadingClearance(true);
      const res = await get(
        `${ApiPaths.admin.freelancers}?idVerificationStatus=all&policeClearanceStatus=pending&limit=100`,
      );
      if (res.success) {
        setPendingClearance(res.data.freelancers || []);
      }
    } catch {
      toast.error('Failed to load pending clearances');
    } finally {
      setIsLoadingClearance(false);
    }
  }, []);
  useEffect(() => { fetchPendingId(); fetchPendingClearance(); }, [fetchPendingId, fetchPendingClearance]);

  useEffect(() => {
    const onHint = () => {
      void fetchPendingId();
      void fetchPendingClearance();
    };
    window.addEventListener(ADMIN_QUEUE_HINT_EVENT, onHint);
    return () => window.removeEventListener(ADMIN_QUEUE_HINT_EVENT, onHint);
  }, [fetchPendingId, fetchPendingClearance]);

  const openAction = (freelancer: PendingFreelancer, type: 'id' | 'clearance', status: 'verified' | 'rejected') => { setActionFreelancer(freelancer); setActionType(type); setActionStatus(status); setRejectionReason(''); setDialogOpen(true); };
  const handleAction = async () => { if (!actionFreelancer) return; try { setActionLoading(true); if (actionType === 'id') { const body: any = { status: actionStatus }; if (actionStatus === 'rejected' && rejectionReason) body.rejectionReason = rejectionReason; await put(ApiPaths.admin.freelancerVerifyId(actionFreelancer.id), body); } else { await post(ApiPaths.admin.freelancerPoliceClearanceVerify(actionFreelancer.id), { status: actionStatus }); } toast.success(`${actionType === 'id' ? 'ID' : 'Police clearance'} ${actionStatus === 'verified' ? 'approved' : 'rejected'}`); setDialogOpen(false); fetchPendingId(); fetchPendingClearance(); } catch (err: any) { toast.error(err?.message || 'Action failed'); } finally { setActionLoading(false); } };

  const idColumns: Column<PendingFreelancer>[] = [
    { key: 'fullName', header: 'Freelancer', render: (f) => (<div><p className="text-black dark:text-white font-medium text-sm">{f.fullName ?? f.user?.fullName ?? 'Unknown'}</p><p className="text-neutral-400 dark:text-neutral-500 text-xs">{f.email ?? f.user?.email ?? ''}</p></div>) },
    { key: 'idNumber', header: 'ID Number', render: (f) => <span className="font-mono text-xs text-neutral-600">{f.idNumber || '--'}</span> },
    { key: 'status', header: 'Status', render: (f) => <StatusBadge status={f.idVerificationStatus as any} /> },
    { key: 'createdAt', header: 'Submitted', render: (f) => <span className="text-neutral-400 text-xs">{new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
    { key: 'actions', header: 'Actions', render: (f) => (
      <div className="flex items-center gap-1">
        <PreviewEyeButton variant="id" f={f} onProfileClick={() => navigate(`/admin/freelancers/${f.id}`)} />
        <Button size="sm" className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg" onClick={(e) => { e.stopPropagation(); openAction(f, 'id', 'verified'); }}><CheckCircle className="h-3.5 w-3.5" /></Button>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); openAction(f, 'id', 'rejected'); }}><XCircle className="h-3.5 w-3.5" /></Button>
      </div>
    )},
  ];

  const clearanceColumns: Column<PendingFreelancer>[] = [
    { key: 'fullName', header: 'Freelancer', render: (f) => (<div><p className="text-black dark:text-white font-medium text-sm">{f.fullName ?? f.user?.fullName ?? 'Unknown'}</p><p className="text-neutral-400 dark:text-neutral-500 text-xs">{f.email ?? f.user?.email ?? ''}</p></div>) },
    { key: 'status', header: 'Status', render: (f) => <StatusBadge status={((f.user?.policeClearanceStatus ?? f.policeClearanceStatus) || 'pending') as any} /> },
    { key: 'createdAt', header: 'Submitted', render: (f) => <span className="text-neutral-400 text-xs">{new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
    { key: 'actions', header: 'Actions', render: (f) => (
      <div className="flex items-center gap-1">
        <PreviewEyeButton variant="clearance" f={f} onProfileClick={() => navigate(`/admin/freelancers/${f.id}`)} />
        <Button size="sm" className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg" onClick={(e) => { e.stopPropagation(); openAction(f, 'clearance', 'verified'); }}><CheckCircle className="h-3.5 w-3.5" /></Button>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); openAction(f, 'clearance', 'rejected'); }}><XCircle className="h-3.5 w-3.5" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-10">
      <PageHeader title="Verifications" description="Review and approve pending freelancer verifications" />
      <Tabs defaultValue="id" className="w-full">
        <TabsList className="bg-neutral-50 border border-neutral-100 rounded-full p-1.5">
          <TabsTrigger value="id" className="data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-black/10 rounded-full text-sm">ID Verification ({pendingId.length})</TabsTrigger>
          <TabsTrigger value="clearance" className="data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-black/10 rounded-full text-sm">Police Clearance ({pendingClearance.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="id" className="mt-6"><DataTable columns={idColumns} data={pendingId} isLoading={isLoadingId} emptyTitle="No pending ID verifications" emptyDescription="All freelancer IDs have been reviewed" /></TabsContent>
        <TabsContent value="clearance" className="mt-6"><DataTable columns={clearanceColumns} data={pendingClearance} isLoading={isLoadingClearance} emptyTitle="No pending police clearances" emptyDescription="All police clearance documents have been reviewed" /></TabsContent>
      </Tabs>
      <ConfirmDialog open={dialogOpen} onOpenChange={setDialogOpen} title={`${actionStatus === 'verified' ? 'Approve' : 'Reject'} ${actionType === 'id' ? 'ID Verification' : 'Police Clearance'}`} description={actionStatus === 'verified' ? `Approve ${actionType === 'id' ? 'ID' : 'police clearance'} for ${actionFreelancer?.fullName ?? actionFreelancer?.user?.fullName ?? 'this freelancer'}?` : `Reject ${actionType === 'id' ? 'ID' : 'police clearance'} for ${actionFreelancer?.fullName ?? actionFreelancer?.user?.fullName ?? 'this freelancer'}?`} confirmLabel={actionStatus === 'verified' ? 'Approve' : 'Reject'} variant={actionStatus === 'rejected' ? 'destructive' : 'default'} isLoading={actionLoading} onConfirm={handleAction}>
        {actionStatus === 'rejected' && actionType === 'id' && (<div className="py-2"><Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Reason for rejection..." className="bg-white border-neutral-200 text-black min-h-[80px] rounded-xl focus-visible:ring-neutral-300" /></div>)}
      </ConfirmDialog>
    </div>
  );
};

export default AdminVerifications;
