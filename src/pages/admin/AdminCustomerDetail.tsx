import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get } from '@/lib/api';
import { ArrowLeft, CalendarDays, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/admin/PageHeader';
import DetailCard, { type DetailField } from '@/components/admin/DetailCard';
import StatusBadge from '@/components/admin/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const bookingStatusMap: Record<string, string> = {
  pending: 'warning',
  confirmed: 'info',
  inProgress: 'info',
  completed: 'success',
  cancelled: 'error',
  rejected: 'rejected',
};

const AdminCustomerDetail: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsOffset, setBookingsOffset] = useState(0);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const BOOKINGS_PAGE = 5;

  useEffect(() => { const fetch = async () => { try { setIsLoading(true); const res = await get(`/admin/customers/${customerId}`); if (res.success) setCustomer(res.data); } catch { toast.error('Failed to load customer'); } finally { setIsLoading(false); } }; if (customerId) fetch(); }, [customerId]);

  useEffect(() => {
    get('/admin/categories?includeInactive=true&limit=500')
      .then((res) => {
        if (res.success && Array.isArray(res.data?.categories)) {
          const map: Record<string, string> = {};
          for (const c of res.data.categories) map[c.id] = c.name;
          setCategoryMap(map);
        }
      })
      .catch(() => {});
  }, []);

  const fetchBookings = useCallback(async (offset: number, append = false) => {
    if (!customerId) return;
    try {
      setBookingsLoading(true);
      const res = await get(`/admin/customers/${customerId}/bookings?limit=${BOOKINGS_PAGE}&offset=${offset}`);
      if (res.success) {
        setBookings((prev) => append ? [...prev, ...res.data.bookings] : res.data.bookings);
        setBookingsTotal(res.data.total);
        setBookingsOffset(offset);
      }
    } catch { /* silent */ } finally {
      setBookingsLoading(false);
    }
  }, [customerId]);

  useEffect(() => { if (customerId) fetchBookings(0); }, [customerId, fetchBookings]);

  const hiredFreelancers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; photo: string | null; count: number }>();
    for (const b of bookings) {
      const fl = b.freelancer;
      if (!fl) continue;
      const userId = fl.user?.id || fl.userId;
      const existing = map.get(userId);
      if (existing) {
        existing.count++;
      } else {
        map.set(userId, {
          id: fl.id,
          name: fl.user?.fullName || 'Unknown',
          photo: fl.user?.profilePhotoUrl || null,
          count: 1,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [bookings]);

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

      {/* Booking History */}
      <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden">
        <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 py-5 px-6">
          <CardTitle className="text-lg font-semibold text-black dark:text-white tracking-tight flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-700">
              <CalendarDays className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
            </span>
            Booking History
            {bookingsTotal > 0 && <span className="text-xs font-normal text-neutral-400 dark:text-neutral-500 ml-1">({bookingsTotal})</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Hired Freelancers summary */}
          {hiredFreelancers.length > 0 && (
            <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-700/80">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 shrink-0">
                  <Users className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Hired {hiredFreelancers.length} freelancer{hiredFreelancers.length !== 1 ? 's' : ''}:</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {hiredFreelancers.map((fl) => (
                    <button
                      key={fl.id}
                      type="button"
                      onClick={() => navigate(`/admin/freelancers/${fl.id}`)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                    >
                      {fl.photo ? (
                        <img src={fl.photo} alt={fl.name ? `Photo of ${fl.name}` : 'Freelancer photo'} className="w-5 h-5 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center text-[9px] font-bold text-black dark:text-white shrink-0">{fl.name.charAt(0)}</div>
                      )}
                      <span className="text-xs font-medium text-black dark:text-white">{fl.name}</span>
                      {fl.count > 1 && <span className="text-[10px] text-neutral-400 dark:text-neutral-500">x{fl.count}</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {bookingsLoading && bookings.length === 0 ? (
            <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-lg bg-neutral-100 dark:bg-neutral-700" />)}</div>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-8">No bookings yet</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-700">
                      <th className="text-left text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-6 py-3">Date</th>
                      <th className="text-left text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-4 py-3">Freelancer</th>
                      <th className="text-left text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-4 py-3">Category</th>
                      <th className="text-left text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-4 py-3">Status</th>
                      <th className="text-right text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-6 py-3">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b: any) => {
                      const isExpanded = expandedBooking === b.id;
                      const flName = b.freelancer?.user?.fullName || 'Unknown';
                      const flPhoto = b.freelancer?.user?.profilePhotoUrl;
                      return (
                        <React.Fragment key={b.id}>
                          <tr
                            className="border-b border-neutral-50 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
                            onClick={() => setExpandedBooking(isExpanded ? null : b.id)}
                          >
                            <td className="px-6 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-neutral-400 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-neutral-400 shrink-0" />}
                                <span className="text-neutral-600 dark:text-neutral-300">{new Date(b.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {flPhoto ? (
                                  <img src={flPhoto} alt={flName ? `Photo of ${flName}` : 'Freelancer photo'} className="w-6 h-6 rounded-full object-cover shrink-0" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center text-[10px] font-semibold text-black dark:text-white shrink-0">{flName.charAt(0)}</div>
                                )}
                                <span className="text-black dark:text-white font-medium truncate">{flName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{categoryMap[b.category] || b.category}</td>
                            <td className="px-4 py-3"><StatusBadge status={(bookingStatusMap[b.status] || b.status) as any} label={b.status} /></td>
                            <td className="px-6 py-3 text-right font-medium text-black dark:text-white tabular-nums">R{Number(b.totalPrice).toFixed(0)}</td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-neutral-50/80 dark:bg-neutral-800/30">
                              <td colSpan={5} className="px-6 py-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                  <div><span className="text-neutral-400 dark:text-neutral-500 block mb-0.5">Time</span><span className="text-black dark:text-white">{b.scheduledTime || '--'}</span></div>
                                  <div><span className="text-neutral-400 dark:text-neutral-500 block mb-0.5">Duration</span><span className="text-black dark:text-white">{b.durationMinutes ? `${b.durationMinutes} min` : '--'}</span></div>
                                  <div><span className="text-neutral-400 dark:text-neutral-500 block mb-0.5">Address</span><span className="text-black dark:text-white truncate block">{b.address || '--'}</span></div>
                                  <div><span className="text-neutral-400 dark:text-neutral-500 block mb-0.5">Payment</span><span className="text-black dark:text-white">{b.paymentStatus || '--'}</span></div>
                                  {b.notes && <div className="col-span-2 md:col-span-4"><span className="text-neutral-400 dark:text-neutral-500 block mb-0.5">Notes</span><span className="text-black dark:text-white">{b.notes}</span></div>}
                                  {b.confirmedAt && <div><span className="text-neutral-400 dark:text-neutral-500 block mb-0.5">Confirmed</span><span className="text-black dark:text-white">{new Date(b.confirmedAt).toLocaleString()}</span></div>}
                                  {b.startedAt && <div><span className="text-neutral-400 dark:text-neutral-500 block mb-0.5">Started</span><span className="text-black dark:text-white">{new Date(b.startedAt).toLocaleString()}</span></div>}
                                  {b.completedAt && <div><span className="text-neutral-400 dark:text-neutral-500 block mb-0.5">Completed</span><span className="text-black dark:text-white">{new Date(b.completedAt).toLocaleString()}</span></div>}
                                  {b.cancelledAt && <div><span className="text-neutral-400 dark:text-neutral-500 block mb-0.5">Cancelled</span><span className="text-black dark:text-white">{new Date(b.cancelledAt).toLocaleString()}{b.cancelledBy ? ` (by ${b.cancelledBy})` : ''}</span></div>}
                                  {b.cancellationReason && <div className="col-span-2 md:col-span-4"><span className="text-neutral-400 dark:text-neutral-500 block mb-0.5">Cancellation Reason</span><span className="text-black dark:text-white">{b.cancellationReason}</span></div>}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {bookings.length < bookingsTotal && (
                <div className="p-4 text-center border-t border-neutral-100 dark:border-neutral-700">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                    onClick={() => fetchBookings(bookingsOffset + BOOKINGS_PAGE, true)}
                    disabled={bookingsLoading}
                  >
                    {bookingsLoading ? 'Loading...' : `Show more (${bookingsTotal - bookings.length} remaining)`}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCustomerDetail;
