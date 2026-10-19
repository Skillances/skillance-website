import { Route, Routes } from 'react-router-dom';
import BeyondLayout from '@/beyond/BeyondLayout';
import ApproachPage from '@/beyond/pages/ApproachPage';
import ContactPage from '@/beyond/pages/ContactPage';
import HomePage from '@/beyond/pages/HomePage';
import NotFoundPage from '@/beyond/pages/NotFoundPage';
import ServicesPage from '@/beyond/pages/ServicesPage';
import WorkPage from '@/beyond/pages/WorkPage';

/**
 * Lazy entry for /beyond. Imported only via React.lazy from App.tsx.
 * Do not use Tailwind utility class names in this tree: the main CSS build
 * scans every source file, and new utilities would land in the marketplace bundle.
 */
export default function BeyondApp() {
  return (
    <Routes>
      <Route element={<BeyondLayout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="approach" element={<ApproachPage />} />
        <Route path="work" element={<WorkPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
