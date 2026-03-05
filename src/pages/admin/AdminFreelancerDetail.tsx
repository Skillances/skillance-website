import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get, put, post, del } from '@/lib/api';
import { ArrowLeft, CheckCircle, XCircle, User, IdCard, FileCheck, BadgeCheck, Shield, ZoomIn, ZoomOut, RotateCw, Minimize2, Trash2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/admin/PageHeader';
import DetailCard, { type DetailField } from '@/components/admin/DetailCard';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const AdminFreelancerDetail: React.FC = () => {
  const { freelancerId } = useParams<{ freelancerId: string }>();
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewRotate, setPreviewRotate] = useState(0);
  const [previewPanX, setPreviewPanX] = useState(0);
  const [previewPanY, setPreviewPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imageOrientation, setImageOrientation] = useState<'landscape' | 'portrait' | 'square'>('landscape');
  const previewZoomContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const [verifyIdOpen, setVerifyIdOpen] = useState(false);
  const [verifyIdAction, setVerifyIdAction] = useState<'verified' | 'rejected'>('verified');
  const [rejectionReason, setRejectionReason] = useState('');
  const [verifyIdLoading, setVerifyIdLoading] = useState(false);
  const [verifyClearanceOpen, setVerifyClearanceOpen] = useState(false);
  const [clearanceAction, setClearanceAction] = useState<'verified' | 'rejected'>('verified');
  const [clearanceLoading, setClearanceLoading] = useState(false);

  const openPreview = (url: string, title: string) => {
    setPreviewUrl(url);
    setPreviewTitle(title);
    setPreviewZoom(1);
    setPreviewRotate(0);
    setPreviewPanX(0);
    setPreviewPanY(0);
    setImageOrientation('landscape');
    setPreviewOpen(true);

    const img = new Image();
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      if (ratio > 1.15) setImageOrientation('landscape');
      else if (ratio < 0.85) setImageOrientation('portrait');
      else setImageOrientation('square');
    };
    img.src = url;
  };

  const resetPreviewTransform = useCallback(() => {
    setPreviewZoom(1);
    setPreviewPanX(0);
    setPreviewPanY(0);
  }, []);

  useEffect(() => {
    if (!previewOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [previewOpen]);

  useEffect(() => {
    if (!previewOpen) return;
    const handler = (e: WheelEvent) => {
      const target = e.target as Node;
      const inContainer = previewZoomContainerRef.current?.contains(target) || (e.target as Element).closest?.('[data-preview-zoom-container]');
      if (inContainer) {
        e.preventDefault();
        e.stopPropagation();
        setPreviewZoom((z) => (e.deltaY < 0 ? Math.min(5, z + 0.15) : Math.max(0.3, z - 0.15)));
      }
    };
    document.addEventListener('wheel', handler, { passive: false, capture: true });
    return () => document.removeEventListener('wheel', handler, true);
  }, [previewOpen]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      setPreviewPanX(panStartRef.current.x + e.clientX - dragStartRef.current.x);
      setPreviewPanY(panStartRef.current.y + e.clientY - dragStartRef.current.y);
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  const handlePreviewMouseDown = (e: React.MouseEvent) => {
    if (!previewUrl || e.button !== 0) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { x: previewPanX, y: previewPanY };
    setIsDragging(true);
  };

  const fetchFreelancer = async () => { try { setIsLoading(true); const res = await get(`/admin/freelancers/${freelancerId}`); if (res.success) setFreelancer(res.data); } catch { toast.error('Failed to load freelancer'); } finally { setIsLoading(false); } };
  useEffect(() => { if (freelancerId) fetchFreelancer(); }, [freelancerId]);

  const handleVerifyId = async () => { try { setVerifyIdLoading(true); const body: any = { status: verifyIdAction }; if (verifyIdAction === 'rejected' && rejectionReason) body.rejectionReason = rejectionReason; await put(`/admin/freelancers/${freelancerId}/verify-id`, body); toast.success(`ID ${verifyIdAction === 'verified' ? 'approved' : 'rejected'} successfully`); setVerifyIdOpen(false); setRejectionReason(''); fetchFreelancer(); } catch (err: any) { toast.error(err?.message || 'Failed to verify ID'); } finally { setVerifyIdLoading(false); } };
  const handleVerifyClearance = async () => { try { setClearanceLoading(true); await post(`/admin/freelancers/${freelancerId}/police-clearance/verify`, { status: clearanceAction }); toast.success(`Police clearance ${clearanceAction === 'verified' ? 'approved' : 'rejected'} successfully`); setVerifyClearanceOpen(false); fetchFreelancer(); } catch (err: any) { toast.error(err?.message || 'Failed to verify clearance'); } finally { setClearanceLoading(false); } };

  const [deletePhotoLoading, setDeletePhotoLoading] = useState<string | null>(null);
  const handleDeletePhoto = async (photoType: string) => {
    try {
      setDeletePhotoLoading(photoType);
      await del(`/admin/freelancers/${freelancerId}/photos/${photoType}`);
      toast.success('Photo removed');
      fetchFreelancer();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete photo');
    } finally {
      setDeletePhotoLoading(null);
    }
  };

  if (isLoading) return (<div className="space-y-8"><Skeleton className="h-10 w-64 bg-neutral-100 rounded" /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Skeleton className="h-72 bg-neutral-100 rounded-2xl" /><Skeleton className="h-72 bg-neutral-100 rounded-2xl" /></div></div>);
  if (!freelancer) return (<div className="text-center py-20"><p className="text-neutral-500">Freelancer not found</p><Button variant="outline" className="mt-4 rounded-full" onClick={() => navigate('/admin/freelancers')}>Back</Button></div>);

  const profileFields: DetailField[] = [
    { label: 'Full Name', value: freelancer.user?.fullName }, { label: 'Email', value: freelancer.user?.email },
    { label: 'Phone', value: freelancer.user?.phoneNumber || '--' }, { label: 'Tag', value: freelancer.user?.tag ? `@${freelancer.user.tag}` : '--' },
    { label: 'City', value: freelancer.user?.city || '--' },
    { label: 'Rating', value: freelancer.rating ? `${Number(freelancer.rating).toFixed(1)} / 5 (${freelancer.totalReviews || 0} reviews)` : 'No ratings' },
  ];
  const verificationFields: DetailField[] = [
    { label: 'ID Verification', value: <StatusBadge status={(freelancer.idVerificationStatus || 'not_submitted') as any} /> },
    { label: 'Police Clearance', value: <StatusBadge status={(freelancer.policeClearanceStatus || 'not_submitted') as any} /> },
    { label: 'Overall Verified', value: freelancer.isVerified ? <StatusBadge status="verified" /> : <StatusBadge status="pending" label="Not Verified" /> },
    { label: 'ID Number', value: freelancer.idNumber ? <span className="font-mono text-xs">{freelancer.idNumber}</span> : '--' },
  ];
  const systemFields: DetailField[] = [
    { label: 'Freelancer ID', value: <span className="font-mono text-xs">{freelancer.id}</span> },
    { label: 'User ID', value: <span className="font-mono text-xs">{freelancer.userId}</span> },
    { label: 'Response Rate', value: freelancer.responseRate ? `${freelancer.responseRate}%` : '--' },
    { label: 'Bookings Completed', value: String(freelancer.totalBookingsCompleted || 0) },
    { label: 'Created', value: new Date(freelancer.createdAt).toLocaleString() },
    { label: 'Updated', value: new Date(freelancer.updatedAt).toLocaleString() },
  ];
  const canVerifyId = freelancer.idVerificationStatus === 'pending';
  const canVerifyClearance = freelancer.policeClearanceStatus === 'pending' && freelancer.policeClearancePhotoUrl;

  const nameWithBadges = (
    <span className="inline-flex items-center gap-2 flex-wrap">
      <span>{freelancer.user?.fullName || 'Freelancer'}</span>
      {freelancer.idVerificationStatus === 'verified' && (
        <span className="inline-flex items-center justify-center rounded-full bg-emerald-500 text-white p-1" title="ID verified">
          <BadgeCheck className="h-4 w-4" strokeWidth={2.5} />
        </span>
      )}
      {freelancer.policeClearanceStatus === 'verified' && (
        <span className="inline-flex items-center justify-center rounded-full bg-blue-500 text-white p-1" title="Police clearance verified">
          <Shield className="h-4 w-4" strokeWidth={2} />
        </span>
      )}
    </span>
  );

  return (
    <div className="space-y-10">
      <PageHeader title={nameWithBadges} description={`Freelancer profile - ${freelancer.user?.email}`}>
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/freelancers')} className="border-neutral-200 text-neutral-500 hover:text-black hover:border-neutral-300 rounded-full"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
      </PageHeader>

      {(canVerifyId || canVerifyClearance) && (
        <Card className="border-amber-200 bg-amber-50 rounded-2xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-amber-700 tracking-wide">Pending Verification Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {canVerifyId && (<><Button size="sm" onClick={() => { setVerifyIdAction('verified'); setVerifyIdOpen(true); }} className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-full"><CheckCircle className="mr-2 h-4 w-4" /> Approve ID</Button><Button size="sm" variant="outline" onClick={() => { setVerifyIdAction('rejected'); setVerifyIdOpen(true); }} className="border-red-200 text-red-600 hover:bg-red-50 rounded-full"><XCircle className="mr-2 h-4 w-4" /> Reject ID</Button></>)}
            {canVerifyClearance && (<><Button size="sm" onClick={() => { setClearanceAction('verified'); setVerifyClearanceOpen(true); }} className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-full"><CheckCircle className="mr-2 h-4 w-4" /> Approve Clearance</Button><Button size="sm" variant="outline" onClick={() => { setClearanceAction('rejected'); setVerifyClearanceOpen(true); }} className="border-red-200 text-red-600 hover:bg-red-50 rounded-full"><XCircle className="mr-2 h-4 w-4" /> Reject Clearance</Button></>)}
          </CardContent>
        </Card>
      )}

      {/* Profile and ID verification photos */}
      <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden">
        <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 py-5 px-6">
          <CardTitle className="text-lg font-semibold text-black dark:text-white tracking-tight flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-700">
              <User className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
            </span>
            Profile & ID Verification
          </CardTitle>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1 ml-12">Click a photo to open preview. Use delete to remove.</p>
        </CardHeader>
        <CardContent className="p-6">
          {/* Profile banner */}
          <div className="mb-6">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">Profile banner</p>
            <div className="relative rounded-xl border border-neutral-200 dark:border-neutral-600 overflow-hidden bg-neutral-50 dark:bg-neutral-800 aspect-[3/1] min-h-[120px] max-h-[200px]">
              {freelancer.coverPhotoUrl ? (
                <>
                  <button type="button" onClick={() => openPreview(freelancer.coverPhotoUrl, 'Profile banner')} className="block w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2 cursor-pointer">
                    <img src={freelancer.coverPhotoUrl} alt="Profile banner" className="w-full h-full object-cover" />
                  </button>
                  <Button variant="destructive" size="sm" className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full opacity-90 hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleDeletePhoto('profileBanner'); }} disabled={deletePhotoLoading === 'profileBanner'}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400 dark:text-neutral-500">
                  <ImageIcon className="h-12 w-12" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { key: 'profilePhoto', label: 'Profile photo', url: freelancer.user?.profilePhotoUrl, icon: User },
              { key: 'idFront', label: 'ID (front)', url: freelancer.idFrontPhotoUrl, icon: IdCard },
              { key: 'idBack', label: 'ID (back)', url: freelancer.idBackPhotoUrl, icon: IdCard },
              { key: 'selfie', label: 'Selfie', url: freelancer.selfiePhotoUrl, icon: User },
              { key: 'policeClearance', label: 'Police clearance', url: freelancer.policeClearancePhotoUrl, icon: FileCheck },
            ].map(({ key, label, url, icon: Icon }) => (
              <div key={key}>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">{label}</p>
                <div className="relative w-44 h-44 shrink-0">
                  {url ? (
                    <>
                      <button type="button" onClick={() => openPreview(url, label)} className="w-full h-full rounded-xl border border-neutral-200 dark:border-neutral-600 overflow-hidden bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2 cursor-pointer block">
                        <img src={url} alt={label} className="w-full h-full object-cover" />
                      </button>
                      <Button variant="destructive" size="sm" className="absolute top-1 right-1 h-7 w-7 p-0 rounded-full opacity-90 hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleDeletePhoto(key); }} disabled={deletePhotoLoading === key}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <div className="w-full h-full rounded-xl border border-neutral-200 dark:border-neutral-600 overflow-hidden bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
                      <Icon className="h-10 w-10" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetailCard title="Profile Information" fields={profileFields} />
        <DetailCard title="Verification Status" fields={verificationFields} />
        <DetailCard title="System Details" fields={systemFields} className="lg:col-span-2" />
      </div>

      <Dialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) setIsDragging(false);
        }}
      >
        <DialogContent
          className={[
            'flex flex-col bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 rounded-2xl',
            imageOrientation === 'portrait'
              ? 'w-auto max-w-[min(520px,90vw)] h-[92vh] max-h-[92vh]'
              : imageOrientation === 'square'
                ? 'w-[min(75vw,800px)] h-[min(80vh,800px)]'
                : 'w-[95vw] max-w-6xl h-[85vh] max-h-[85vh]',
          ].join(' ')}
        >
          <DialogHeader className="shrink-0 px-6 pt-5 pb-3 flex flex-row items-center justify-between">
            <DialogTitle className="text-black dark:text-white font-serif text-base">{previewTitle}</DialogTitle>
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tabular-nums">
              {Math.round(previewZoom * 100)}%
            </span>
          </DialogHeader>
          <div
            ref={previewZoomContainerRef}
            data-preview-zoom-container
            className={`flex-1 min-h-0 overflow-hidden flex items-center justify-center mx-4 mb-2 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handlePreviewMouseDown}
          >
            {previewUrl && (
              <img
                src={previewUrl}
                alt={previewTitle}
                className={[
                  'object-contain select-none pointer-events-none',
                  previewZoom === 1 ? 'transition-transform duration-200' : '',
                  imageOrientation === 'portrait'
                    ? 'max-w-full max-h-full h-full w-auto'
                    : 'max-w-full max-h-full w-auto h-auto',
                ].join(' ')}
                style={{ transform: `translate(${previewPanX}px, ${previewPanY}px) scale(${previewZoom}) rotate(${previewRotate}deg)` }}
                draggable={false}
              />
            )}
          </div>
          <div className="flex items-center justify-center gap-1.5 px-4 pb-4 pt-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setPreviewZoom((z) => Math.min(5, z + 0.25))} className="rounded-full border-neutral-200 dark:border-neutral-600 h-8 px-3 text-xs" disabled={!previewUrl}>
              <ZoomIn className="h-3.5 w-3.5 mr-1" /> In
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPreviewZoom((z) => Math.max(0.3, z - 0.25))} className="rounded-full border-neutral-200 dark:border-neutral-600 h-8 px-3 text-xs" disabled={!previewUrl}>
              <ZoomOut className="h-3.5 w-3.5 mr-1" /> Out
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPreviewRotate((r) => (r + 90) % 360)} className="rounded-full border-neutral-200 dark:border-neutral-600 h-8 px-3 text-xs" disabled={!previewUrl}>
              <RotateCw className="h-3.5 w-3.5 mr-1" /> Rotate
            </Button>
            <Button variant="outline" size="sm" onClick={resetPreviewTransform} className="rounded-full border-neutral-200 dark:border-neutral-600 h-8 px-3 text-xs" disabled={!previewUrl}>
              <Minimize2 className="h-3.5 w-3.5 mr-1" /> Reset
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={verifyIdOpen} onOpenChange={setVerifyIdOpen} title={verifyIdAction === 'verified' ? 'Approve ID Verification' : 'Reject ID Verification'} description={verifyIdAction === 'verified' ? "This will mark the freelancer's ID as verified." : 'Please provide a reason for rejecting this ID verification.'} confirmLabel={verifyIdAction === 'verified' ? 'Approve' : 'Reject'} variant={verifyIdAction === 'rejected' ? 'destructive' : 'default'} isLoading={verifyIdLoading} onConfirm={handleVerifyId}>
        {verifyIdAction === 'rejected' && (<div className="py-2"><Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Reason for rejection..." className="bg-white border-neutral-200 text-black min-h-[80px] rounded-xl focus-visible:ring-neutral-300" /></div>)}
      </ConfirmDialog>
      <ConfirmDialog open={verifyClearanceOpen} onOpenChange={setVerifyClearanceOpen} title={clearanceAction === 'verified' ? 'Approve Police Clearance' : 'Reject Police Clearance'} description={clearanceAction === 'verified' ? 'This will mark the police clearance as verified.' : 'This will reject the police clearance document.'} confirmLabel={clearanceAction === 'verified' ? 'Approve' : 'Reject'} variant={clearanceAction === 'rejected' ? 'destructive' : 'default'} isLoading={clearanceLoading} onConfirm={handleVerifyClearance} />
    </div>
  );
};

export default AdminFreelancerDetail;
