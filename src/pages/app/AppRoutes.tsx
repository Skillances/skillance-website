import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import AppProtectedRoute from '@/components/common/AppProtectedRoute';
import { Skeleton } from '@/components/ui/skeleton';

const AppHomePage = lazy(() => import('@/pages/app/AppHomePage'));
const SearchPage = lazy(() => import('@/pages/app/SearchPage'));
const CategoryBrowsePage = lazy(() => import('@/pages/app/CategoryBrowsePage'));
const CategoryDetailPage = lazy(() => import('@/pages/app/CategoryDetailPage'));
const FreelancerProfilePage = lazy(() => import('@/pages/app/FreelancerProfilePage'));
const AppLoginPage = lazy(() => import('@/pages/app/auth/AppLoginPage'));
const AppRegisterPage = lazy(() => import('@/pages/app/auth/AppRegisterPage'));
const AppForgotPasswordPage = lazy(() => import('@/pages/app/auth/AppForgotPasswordPage'));
const BookingFlowPage = lazy(() => import('@/pages/app/bookings/BookingFlowPage'));
const BookingsPage = lazy(() => import('@/pages/app/bookings/BookingsPage'));
const BookingDetailPage = lazy(() => import('@/pages/app/bookings/BookingDetailPage'));
const ProfilePage = lazy(() => import('@/pages/app/profile/ProfilePage'));
const FavoritesPage = lazy(() => import('@/pages/app/profile/FavoritesPage'));
const DocumentsPage = lazy(() => import('@/pages/app/profile/DocumentsPage'));
const SettingsPage = lazy(() => import('@/pages/app/profile/SettingsPage'));
const ChatListPage = lazy(() => import('@/pages/app/chat/ChatListPage'));
const ChatThreadPage = lazy(() => import('@/pages/app/chat/ChatThreadPage'));
const FreelancerDashboardPage = lazy(() => import('@/pages/app/freelancer/DashboardPage'));
const FreelancerJobsPage = lazy(() => import('@/pages/app/freelancer/JobsPage'));
const FreelancerEarningsPage = lazy(() => import('@/pages/app/freelancer/EarningsPage'));
const FreelancerApplyPage = lazy(() => import('@/pages/app/freelancer/ApplyPage'));
const RecurringRequestPage = lazy(() => import('@/pages/app/recurring/RecurringRequestPage'));
const RecurringListPage = lazy(() => import('@/pages/app/recurring/RecurringPage'));
const RecurringDetailPage = lazy(() =>
  import('@/pages/app/recurring/RecurringPage').then((m) => ({ default: m.RecurringDetailPage })),
);
const RecurringRequestsPage = lazy(() =>
  import('@/pages/app/recurring/RecurringPage').then((m) => ({ default: m.RecurringRequestsPage })),
);

function AppPageFallback() {
  return (
    <div className="space-y-3 py-4">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <AppProtectedRoute>
      <AppLayout>
        <Suspense fallback={<AppPageFallback />}>
          <Routes>
            <Route index element={<AppHomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="categories" element={<CategoryBrowsePage />} />
            <Route path="category/:categoryId" element={<CategoryDetailPage />} />
            <Route path="freelancer/dashboard" element={<FreelancerDashboardPage />} />
            <Route path="freelancer/jobs" element={<FreelancerJobsPage />} />
            <Route path="freelancer/earnings" element={<FreelancerEarningsPage />} />
            <Route path="freelancer/apply" element={<FreelancerApplyPage />} />
            <Route path="freelancer/:freelancerId/book" element={<BookingFlowPage />} />
            <Route path="freelancer/:freelancerId" element={<FreelancerProfilePage />} />
            <Route path="login" element={<AppLoginPage />} />
            <Route path="register" element={<AppRegisterPage />} />
            <Route path="forgot-password" element={<AppForgotPasswordPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="bookings/:bookingId" element={<BookingDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="chat" element={<ChatListPage />} />
            <Route path="chat/:chatId" element={<ChatThreadPage />} />
            <Route path="recurring" element={<RecurringListPage />} />
            <Route path="recurring/requests" element={<RecurringRequestsPage />} />
            <Route path="recurring/request" element={<RecurringRequestPage />} />
            <Route path="recurring/:seriesId" element={<RecurringDetailPage />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </AppProtectedRoute>
  );
}
