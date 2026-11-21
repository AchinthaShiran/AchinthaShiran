import { lazy, Suspense, useMemo } from 'react';
import { Classic } from './ui/Classic';
import { supportsWebGL, useHashRoute } from './ui/route';

const WorldApp = lazy(() => import('./ui/WorldApp'));

function Fallback() {
  return (
    <div className="loading" role="status">
      Loading WONDERLAND…
    </div>
  );
}

export function App() {
  const route = useHashRoute();
  const webgl = useMemo(supportsWebGL, []);
  if (route.view === 'classic' || !webgl) {
    return <Classic section={route.view === 'classic' ? route.section : null} webgl={webgl} />;
  }
  return (
    <Suspense fallback={<Fallback />}>
      <WorldApp />
    </Suspense>
  );
}
