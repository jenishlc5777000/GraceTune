import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6 text-center">
      <div>
        <p className="font-display text-6xl text-highlight">404</p>
        <h1 className="mt-3 text-2xl font-bold">We couldn't find that page</h1>
        <p className="mt-2 text-muted">It may have been moved, or the link is wrong.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-fg px-6 py-2.5 font-bold text-bg transition hover:scale-105"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
