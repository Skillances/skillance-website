import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import { unwrap } from '@/lib/marketplace/apiHelpers';

/** Private profile from `GET /freelancers/user/:userId` (self only). */
export type MyFreelancerProfile = {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  profilePhotoUrl?: string | null;
  coverPhotoUrl?: string | null;
  bio?: string | null;
  categoryIds?: string[];
  categoryRates?: { categoryId: string; hourlyRate: number | string; bookingPricingMode?: 'hourly' | 'invoice' | string }[];
  certifications?: string[];
  idNumber?: string | null;
  idVerificationStatus?: string;
  idVerificationRejectionReason?: string | null;
  policeClearanceStatus?: string;
  policeClearanceExpiresAt?: string | null;
  policeClearanceRejectionReason?: string | null;
  categoryLimits?: {
    maxRootCategories?: number;
    maxServiceOffers?: number;
    currentRootCategories?: number;
    currentServiceOffers?: number;
    pendingRequest?: { id: string; status: string; requestedMaxRootCategories: number; requestedMaxServiceOffers: number; createdAt: string } | null;
  };
};

export const myFreelancerKey = (userId: string) => ['marketplace', 'me', 'freelancer', userId] as const;

export function useMyFreelancerProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: myFreelancerKey(user?.id ?? ''),
    enabled: !!user?.id && !!user.freelancerId,
    queryFn: async () => unwrap<MyFreelancerProfile>(await get(ApiPaths.marketplace.freelancerByUser(user!.id))),
  });
}
