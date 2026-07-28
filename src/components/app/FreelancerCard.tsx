import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { FreelancerSummary } from '@/types/product';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface FreelancerCardProps {
  freelancer: FreelancerSummary;
  showDistance?: boolean;
}

export function FreelancerCard({ freelancer, showDistance }: FreelancerCardProps) {
  const initials = freelancer.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      to={`/app/freelancer/${freelancer.id}`}
      className="block rounded-2xl border border-neutral-200 bg-white p-4 hover:border-neutral-300 hover:shadow-sm transition-all"
    >
      <div className="flex gap-3">
        <Avatar className="h-14 w-14 shrink-0">
          <AvatarImage src={freelancer.profilePhotoUrl ?? undefined} alt={freelancer.fullName} />
          <AvatarFallback className="bg-neutral-100 text-neutral-700">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-neutral-900 truncate">{freelancer.fullName}</h3>
            {freelancer.isVerified && (
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                Verified
              </Badge>
            )}
          </div>
          {freelancer.bio && (
            <p className="text-sm text-neutral-500 line-clamp-2 mt-0.5">{freelancer.bio}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-neutral-600">
            {freelancer.averageRating != null && (
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {freelancer.averageRating.toFixed(1)}
                {freelancer.reviewCount != null && (
                  <span className="text-neutral-400">({freelancer.reviewCount})</span>
                )}
              </span>
            )}
            {freelancer.hourlyRate != null && (
              <span>R{freelancer.hourlyRate}/hr</span>
            )}
            {showDistance && freelancer.distanceKm != null && (
              <span>{freelancer.distanceKm.toFixed(1)} km away</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
