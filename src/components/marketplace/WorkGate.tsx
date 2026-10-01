import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import ApplicationStatusCard from '@/components/marketplace/ApplicationStatusCard';
import { MkPageHeader } from '@/components/marketplace/ui';

/** Freelancer-only pages: show the application status instead when the account has no freelancer profile. */
export default function WorkGate({ title, children }: { title: string; children: (freelancerId: string) => ReactNode }) {
  const { user } = useAuth();
  if (!user?.freelancerId) {
    return (
      <>
        <MkPageHeader back="/account" title={title} />
        <ApplicationStatusCard />
      </>
    );
  }
  return <>{children(user.freelancerId)}</>;
}
