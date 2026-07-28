import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function FreelancerApplyPage() {
  const { user } = useAuth();

  const { data: status, isPending } = useQuery({
    queryKey: ['freelancer', 'application-status'],
    queryFn: async () => {
      const res = await get(ApiPaths.freelancers.applicationStatus);
      return res?.data ?? res;
    },
  });

  if (user?.freelancerId) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">You already have a freelancer profile.</p>
        <Link to="/app/freelancer/dashboard">
          <Button className="rounded-full mt-4">Go to dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Become a freelancer</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Offer your skills on Skillance and grow your client base.
        </p>
      </div>

      {isPending ? (
        <Skeleton className="h-32 rounded-2xl" />
      ) : status?.status ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="font-medium">Application status: {status.status}</p>
          {status.message && <p className="text-sm text-neutral-500 mt-2">{status.message}</p>}
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4">
          <p className="text-neutral-600 text-sm">
            Register as a freelancer to list services, set your rates, and receive booking requests.
          </p>
          <Link to="/app/register">
            <Button className="rounded-full w-full">Create freelancer account</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
