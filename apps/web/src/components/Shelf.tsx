import type { ReactNode } from 'react';

interface ShelfProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** A titled, horizontally scrolling row of cards. */
export function Shelf({ title, subtitle, children }: ShelfProps) {
  return (
    <section className="animate-fade-up">
      <div className="mb-2 px-3">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="no-scrollbar -mx-1 grid auto-cols-[minmax(150px,1fr)] grid-flow-col overflow-x-auto sm:auto-cols-[minmax(180px,200px)]">
        {children}
      </div>
    </section>
  );
}
