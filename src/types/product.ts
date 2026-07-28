export type PreferredView = 'customer' | 'freelancer';

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  primaryRole?: string;
  preferredView?: PreferredView;
  customerId?: string | null;
  freelancerId?: string | null;
  phoneNumber?: string | null;
  profilePhotoUrl?: string | null;
}

export interface CategoryNode {
  id: string;
  slug?: string;
  name: string;
  description?: string | null;
  iconCode?: string | null;
  children?: CategoryNode[];
}

export interface FreelancerSummary {
  id: string;
  userId: string;
  fullName: string;
  profilePhotoUrl?: string | null;
  bio?: string | null;
  averageRating?: number | null;
  reviewCount?: number;
  hourlyRate?: number | null;
  categories?: Array<{ id: string; name: string; hourlyRate?: number }>;
  distanceKm?: number | null;
  isVerified?: boolean;
}

export interface CategoryRateRow {
  categoryId: string;
  hourlyRate?: number | null;
  bookingPricingMode?: string | null;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description?: string | null;
  imageUrls?: string[];
  displayOrder?: number;
}

export interface FreelancerServiceLocation {
  id: string;
  label?: string | null;
  city?: string | null;
  serviceRadius?: number | null;
  serviceDeliveryMode?: string | null;
  isPrimary?: boolean;
}

export interface FreelancerReview {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customer: {
    fullName: string;
    profilePhotoUrl?: string | null;
  };
}

export interface FreelancerDetail extends FreelancerSummary {
  tag?: string | null;
  coverPhotoUrl?: string | null;
  rating?: number | null;
  totalReviews?: number;
  responseRate?: number | null;
  totalBookingsCompleted?: number;
  categoryIds?: string[];
  categoryRates?: CategoryRateRow[];
  hourlyRate?: number | null;
  city?: string | null;
  serviceRadius?: number | null;
  certifications?: string[];
  credentialProofVerifiedNames?: string[];
  portfolioPhotos?: string[];
  portfolioProjects?: PortfolioProject[];
  portfolio?: PortfolioProject[];
  idVerificationStatus?: string | null;
  policeClearanceStatus?: string | null;
  acceptsRecurringBookings?: boolean;
  defaultSessionDurationMinutes?: number | null;
  serviceLocations?: FreelancerServiceLocation[];
  availability?: unknown;
}

export interface BookingSummary {
  id: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  category: string;
  categoryName?: string;
  freelancerId: string;
  freelancerName?: string;
  customerId?: string;
  customerName?: string;
  address?: string | null;
  notes?: string | null;
  pricingMode?: string;
  totalPrice?: number | null;
  connectionFeePaid?: boolean;
  connectionFeeStatus?: string | null;
  connectionFeeAmount?: number | null;
  bookingGroupId?: string | null;
  createdAt?: string;
}

export interface ChatSummary {
  id: string;
  bookingId: string;
  otherPartyName?: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string | null;
}

export interface RecurringSeries {
  id: string;
  status: string;
  pattern?: string;
  category?: string;
  categoryId?: string;
  freelancerName?: string;
  customerName?: string;
  nextOccurrence?: string | null;
  daysOfWeek?: number[];
  scheduledTime?: string;
  durationMinutes?: number;
}

export interface RecurringRequest {
  id: string;
  status: string;
  freelancerId: string;
  freelancerName?: string;
  customerName?: string;
  categoryId: string;
  categoryName?: string;
  initiatedBy: 'customer' | 'freelancer';
  daysOfWeek: number[];
  scheduledTime: string;
  durationMinutes: number;
  startDate: string;
  endDate?: string | null;
  message?: string | null;
  createdAt?: string;
}
