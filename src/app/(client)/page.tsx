

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// This function renders static HTML from the server. It requires zero JavaScript.
// Users will see this content within 1 second of page load.
function StaticHeroShell() {
  return (
    <main className="bg-black min-h-screen text-white">
      <div className="flex flex-col items-center pt-12 px-6">
        <img src="/logo.png" alt="Flexology" width={80} height={80} />
        <h1 className="text-3xl font-bold mt-6">Unlock Your True Potential</h1>
        <p className="text-gray-400 mt-3 text-center">
          Premium sports recovery, targeted massage, and elite physical therapy.
        </p>
        <a
          href="/book"
          className="mt-8 w-full py-4 bg-white text-black font-bold rounded-xl text-center block"
        >
          BOOK A SESSION
        </a>
      </div>
    </main>
  );
}

// Animations load ONLY after the static shell has already been painted.
// ssr: false ensures this never blocks server-side rendering.
const AnimatedContent = dynamic(
  () => import('../../components/AnimatedHomepage'),
  { loading: () => null }
);

export default function HomePage() {
  return (
    <>
      <StaticHeroShell />
      <Suspense fallback={null}>
        <AnimatedContent />
      </Suspense>
    </>
  );
}
