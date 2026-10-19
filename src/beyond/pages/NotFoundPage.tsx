import { Link, useLocation } from 'react-router-dom';
import { PAGES } from '@/beyond/content';
import { useBeyondPage } from '@/beyond/useBeyondPage';

export default function NotFoundPage() {
  const { pathname } = useLocation();
  useBeyondPage({ ...PAGES.notFound, path: pathname });

  return (
    <div className="by-wrap">
      <div className="by-intro">
        <p className="by-kicker">Beyond the App</p>
        <h1>This page is not in the section.</h1>
        <p className="by-lede">The address does not match a Beyond the App page.</p>
        <div className="by-actions">
          <Link to="/beyond" className="by-btn">
            Back to the overview
          </Link>
        </div>
      </div>
    </div>
  );
}
