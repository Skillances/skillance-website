import { FLAT_CATEGORIES } from './categoriesData'

export const APP_INFO = {
  name: 'Skillance',
  tagline: 'Find trusted freelancers near you',
  description: 'A mobile marketplace platform that connects customers with verified freelancers for a wide range of services.',
  appStoreUrl: '#', // TODO: Add actual App Store URL when available
  playStoreUrl: '#', // TODO: Add actual Play Store URL when available
  status: 'Coming Soon', // Change to 'Available' when launched
}

export const APP_NAVIGATION = [
  { name: 'Home', path: '/' },
  { name: 'Features', path: '/features' },
  { name: 'Categories', path: '/categories' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
]

// Export flat categories for display
export const SERVICE_CATEGORIES = FLAT_CATEGORIES

export const CUSTOMER_FEATURES = [
  {
    id: 'browse-search',
    title: 'Find Skilled Professionals Instantly',
    description: 'No more asking around or relying on word of mouth. Find verified, skilled professionals in seconds',
    icon: 'Search',
    details: [
      'Category carousel on Home tab with animated category icons',
      'Proximity search with location permissions for nearby freelancers',
      'Debounced filter system (300ms) for smooth search experience',
      'Infinite-scroll search results with freelancer cards',
      'Filter by category, price range, distance, and ratings',
    ],
  },
  {
    id: 'service-categories',
    title: 'Comprehensive Service Categories',
    description: 'Access 13+ service categories with hierarchical organization',
    icon: 'Grid3x3',
    details: [
      'Category hierarchy from CategoryHierarchyConstants',
      'Animated category icons (assets/animations/*.json)',
      'One main category active at a time on home screen',
      'Categories include: Tutoring, Mechanics, Fitness, Pet Care, and more',
      'Easy navigation between categories and subcategories',
    ],
  },
  {
    id: 'booking-system',
    title: 'Intelligent Booking Flow',
    description: 'Select service details, schedule, and book with price transparency',
    icon: 'Calendar',
    details: [
      'SelectServiceScreen with date, time slot, and duration selection',
      'UI enforces min/max duration and available date constraints',
      'Real-time price calculation: rate × duration + platform fee',
      'Clear price breakdown before booking confirmation',
      'Booking status tracking: Pending, Confirmed, On-the-way, Completed',
    ],
  },
  {
    id: 'communication',
    title: 'Integrated Chat System',
    description: 'Message freelancers before, during, and after bookings',
    icon: 'MessageSquare',
    details: [
      'Chat accessible from profile, booking flow, and Bookings tab',
      'Messages persisted via app\'s chat service (provider-level)',
      'Chat threads linked to bookings for context',
      'Share photos and documents through chat',
      'Push and in-app notifications for new messages',
    ],
  },
  {
    id: 'payment-management',
    title: 'Flexible Payment Options',
    description: 'Multiple payment methods with secure processing',
    icon: 'CreditCard',
    details: [
      'Save multiple payment methods for quick checkout',
      'Mobile pay options (Apple Pay/Google Pay placeholders)',
      'Add payment methods through AddPaymentMethodScreen',
      'Secure payment gateway integration',
      'Payment held until service completion for protection',
    ],
  },
  {
    id: 'reviews-ratings',
    title: 'Verified Reviews & Ratings',
    description: 'Make informed decisions with authentic customer feedback',
    icon: 'Star',
    details: [
      'View freelancer ratings, reviews, and completion statistics',
      'Leave reviews after service completion',
      'Verified review system ensures authenticity',
      'Response rate and rating affect freelancer visibility',
      'Read detailed feedback from previous customers',
    ],
  },
]

export const FREELANCER_FEATURES = [
  {
    id: 'profile-management',
    title: 'Comprehensive Profile Builder',
    description: 'Create and manage your professional profile with all required details',
    icon: 'UserCircle',
    details: [
      'FreelancerProfileMenuScreen for profile editing',
      'Required: photo, description, services/categories, hourly rates, location/radius',
      'Profile completion provider tracks progress and shows completion banners',
      'Set hourly rates per category for different services',
      'Profile completeness affects visibility in search results',
    ],
  },
  {
    id: 'verification',
    title: 'ID Verification & KYC',
    description: 'Complete identity verification for trust and visibility',
    icon: 'ShieldCheck',
    details: [
      'Upload identity verification documents through ID upload flow',
      'Backend KYC checks process verification',
      'Verified badge displayed on profile',
      'Verification status affects search result ranking',
      'Verification reminders shown on Dashboard until complete',
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard & Performance Metrics',
    description: 'Track earnings, bookings, and key performance indicators',
    icon: 'BarChart3',
    details: [
      'FreelancerDashboardScreen with earnings breakdown (weekly/monthly/all-time)',
      'View response rate, rating, and upcoming bookings',
      'Quick actions: go to profile, view jobs, complete verification',
      'Performance metrics computed from booking and review data',
      'Surface verification reminders and profile completion status',
    ],
  },
  {
    id: 'booking-management',
    title: 'Job Management System',
    description: 'Receive, accept, and manage booking requests',
    icon: 'Calendar',
    details: [
      'JobsScreen lists Pending, Upcoming, and Completed bookings',
      'Accept or decline pending bookings (updates status via bookingListProvider)',
      'Mark booking status: On the way, Start job, Mark complete',
      'Receive push notifications for new requests and status changes',
      'Coordinate with customers through chat linked to bookings',
    ],
  },
  {
    id: 'financial-management',
    title: 'Earnings & Payout System',
    description: 'Track earnings, calculate payouts, and request withdrawals',
    icon: 'DollarSign',
    details: [
      'Automatic payout calculation: total minus platform fee',
      'Earnings aggregated in Earnings screen with breakdowns',
      'Request payouts via Payout screens/providers',
      'Backend payout flows to bank or third-party payout provider',
      'Earnings and payout providers manage balances and withdrawal records',
    ],
  },
  {
    id: 'availability-calendar',
    title: 'Availability & Scheduling',
    description: 'Set availability and manage your service calendar',
    icon: 'MapPin',
    details: [
      'Set availability in profile or accept/reject per incoming booking',
      'Optional calendar sync with external calendar integration',
      'Service radius defines where you\'re available',
      'Location-based job matching based on your service area',
      'Manage multiple service locations with individual radius settings',
    ],
  },
]

export const HOW_IT_WORKS_CUSTOMERS = [
  {
    number: '01',
    title: 'Discover Services',
    description: 'Browse categories, featured freelancers, and search with filters',
    icon: 'Search',
    details: 'Start on the Home tab with category carousel and featured freelancers. Browse by category (with animated category icons) or use the search box. Tapping a category sets filters and triggers an intelligent search. Use proximity search with location permissions to find freelancers near you. Filter by price range, distance, and ratings. Search results show freelancer cards with key information - tap any card to view the full profile.',
  },
  {
    number: '02',
    title: 'View Freelancer Profile',
    description: 'Explore services, rates, portfolio, reviews, and contact options',
    icon: 'UserCircle',
    details: 'View comprehensive freelancer profiles showing all services offered, hourly rates per category, portfolio samples, verified reviews, and ratings. See their response rate, completion statistics, and verification badges. Profile displays location and service radius. Use profile actions to message the freelancer, request a booking, or view more details. All profile data is cached for fast loading.',
  },
  {
    number: '03',
    title: 'Message & Book Service',
    description: 'Chat with freelancers, then select service details and schedule',
    icon: 'MessageSquare',
    details: 'Message freelancers directly from their profile to ask questions before booking. Chat is accessible from profile, booking flow, and the Bookings tab. When ready, tap "Book" or "Request" to start the booking flow. SelectServiceScreen lets you pick the specific service, date, time slot, and duration. UI enforces sensible constraints (min/max duration, available dates). See real-time price calculation: freelancer rate × duration + platform fee with clear breakdown.',
  },
  {
    number: '04',
    title: 'Secure Payment',
    description: 'Choose payment method and complete transaction',
    icon: 'CreditCard',
    details: 'PaymentScreen shows your saved payment methods from your account. Options include mobile pay (Apple Pay/Google Pay) or saved credit/debit cards. If you don\'t have a payment method saved, add one securely through AddPaymentMethodScreen. On confirmation, the app processes payment through our secure gateway integration. Payment is held securely until service completion. Receive instant payment confirmation and receipt.',
  },
  {
    number: '05',
    title: 'Manage Bookings',
    description: 'Track bookings, receive updates, and coordinate with freelancers',
    icon: 'CheckCircle',
    details: 'BookingConfirmationScreen shows your booking details and provides quick actions to message the freelancer or view booking. Your booking appears in the Bookings tab with status: Pending, Confirmed, On-the-way, or Completed. Receive push and in-app notifications for booking status changes. Manage upcoming bookings - cancel or request reschedule where allowed. After service completion, leave a review and rating. All booking data is synced across your devices.',
  },
]

export const HOW_IT_WORKS_FREELANCERS = [
  {
    number: '01',
    title: 'Sign Up & Choose Account Type',
    description: 'Register as a freelancer and access your dashboard',
    icon: 'UserPlus',
    details: 'Download the app and register choosing the freelancer account type. RegisterScreen collects your name, email, and stores your account type. After signup, you\'re navigated to the freelancer shell (FreelancerNavBar) with tabs: Dashboard, Jobs, Chat, Earnings, and Profile. The app checks your profile completion status and shows reminders to complete your profile for better visibility.',
  },
  {
    number: '02',
    title: 'Complete Profile & Verification',
    description: 'Build your profile and complete ID verification',
    icon: 'FileText',
    details: 'Complete your profile in FreelancerProfileMenuScreen with required items: professional photo, description, services/categories you offer, hourly rates per category, location and service radius. Upload identity verification documents to trigger backend KYC checks. Profile completion provider tracks your progress and shows completion banners on Dashboard. Verified freelancers get priority in search results and earn customer trust.',
  },
  {
    number: '03',
    title: 'Receive & Manage Bookings',
    description: 'Accept or decline booking requests from customers',
    icon: 'Bell',
    details: 'Customers create bookings that appear in your JobsScreen under Pending status. Review booking details: service type, date/time, duration, customer info, and total amount. Accept bookings to confirm (status changes to "Confirmed") or decline to free that time slot. Accepted bookings move to Upcoming. Receive push notifications for new booking requests, cancellations, and customer messages. Your response rate affects your profile visibility.',
  },
  {
    number: '04',
    title: 'Perform Work & Coordinate',
    description: 'Use chat to coordinate, mark job status, and complete work',
    icon: 'CheckCircle',
    details: 'Once a booking is confirmed, use Chat to coordinate address, time adjustments, and specific requirements. Chat threads are linked to bookings for easy reference. When ready, use booking actions: mark "On the way" to notify customer, "Start job" when you arrive, and "Mark complete" when finished. Update booking status through bookingListProvider. System tracks your completion rate and response time for your dashboard metrics.',
  },
  {
    number: '05',
    title: 'Earnings & Payouts',
    description: 'Track earnings, request payouts, and manage finances',
    icon: 'Banknote',
    details: 'Dashboard shows earnings breakdown: weekly, monthly, and all-time totals. Platform calculates payout amounts (total minus platform fee) automatically. Completed bookings add to your earnings balance. Use Payout screens to request withdrawals - trigger backend payout flows to your bank account or third-party payout provider. Earnings and payout providers manage your balances and withdrawal records. Track all financial activity in your Earnings tab.',
  },
]

export const TRUST_SECURITY = [
  {
    id: 'verification',
    title: 'ID Verification',
    description: 'All freelancers undergo secure identity verification to ensure authenticity and build trust',
    icon: 'ShieldCheck',
  },
  {
    id: 'secure-payments',
    title: 'Secure Payments',
    description: 'Bank-level encryption protects all transactions. Your payment information is never shared',
    icon: 'Lock',
  },
  {
    id: 'reviews',
    title: 'Verified Reviews',
    description: 'Only customers who have booked services can leave reviews, ensuring authenticity',
    icon: 'Star',
  },
  {
    id: 'support',
    title: '24/7 Support',
    description: 'Our customer support team is available around the clock to help with any issues',
    icon: 'Headphones',
  },
]

/**
 * APP STATS DATA
 * 
 * Add your stats data here following this structure:
 * 
 * export const APP_STATS = [
 *   { value: string, label: string },
 *   // ... more stats
 * ]
 * 
 * Example:
 * export const APP_STATS = [
 *   { value: '10k+', label: 'Active Freelancers' },
 *   { value: '50k+', label: 'Completed Jobs' },
 *   { value: '4.8', label: 'Average Rating' },
 *   { value: '14', label: 'Service Categories' },
 * ]
 * 
 * TODO: Add your stats data here
 */
export const APP_STATS = [] // Replace with your stats data array

export const APP_COMPANY_INFO = {
  name: 'Skillance',
  description: 'A mobile marketplace platform connecting customers with verified freelancers.',
  email: 'hello@skillance.app',
  phone: '+27 (0)11 234 5678',
  address: 'Johannesburg, South Africa',
}

export const FAQ_ITEMS = [
  {
    question: 'How do I find freelancers near me?',
    answer: 'Simply enable location services and browse by category. Our app will show you verified freelancers in your area, sorted by distance and rating.',
  },
  {
    question: 'Are all freelancers verified?',
    answer: 'Yes, all freelancers must complete ID verification before they can accept bookings. Verified freelancers display a badge on their profiles.',
  },
  {
    question: 'How does payment work?',
    answer: 'Payments are processed securely through the app. You can save multiple payment methods and receive receipts for all transactions.',
  },
  {
    question: 'Can I cancel a booking?',
    answer: 'Yes, you can cancel bookings according to our cancellation policy. The specific terms depend on how far in advance you cancel.',
  },
  {
    question: 'What if I have an issue with a service?',
    answer: 'Contact our 24/7 support team through the app. We take all concerns seriously and work to resolve issues quickly.',
  },
]

