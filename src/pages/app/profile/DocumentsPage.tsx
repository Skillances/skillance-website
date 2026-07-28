import { Link } from 'react-router-dom';

export default function DocumentsPage() {
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <Link to="/app/profile" className="text-sm text-neutral-500">
          Profile
        </Link>
        <h1 className="text-2xl font-semibold mt-1">My documents</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Purchased digital products and secure documents appear here.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-neutral-500 text-sm">
        No documents yet. Digital products you purchase will show up here.
      </div>
    </div>
  );
}
