export function LoadingState({ admin = false }: { admin?: boolean }) {
  return <div className={admin ? 'route-loading' : 'container route-loading'} aria-busy="true">
    <p role="status" className="loading-label"><span className="spinner" aria-hidden="true"/>{admin ? 'Cargando panel…' : 'Cargando contenido…'}</p>
    <div className="loading-skeleton" aria-hidden="true"><div className="skeleton skeleton-title"/><div className="skeleton skeleton-line"/><div className="skeleton skeleton-line"/><div className="skeleton-grid"><div className="skeleton skeleton-card"/><div className="skeleton skeleton-card"/><div className="skeleton skeleton-card"/></div></div>
  </div>;
}
