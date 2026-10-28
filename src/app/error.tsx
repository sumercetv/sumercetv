'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="container error-boundary"><h1>No pudimos cargar este contenido.</h1><p>Intenta de nuevo en unos momentos.</p><button className="button button-yellow" onClick={reset}>Reintentar</button></div>; }
