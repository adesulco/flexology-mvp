'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
        <p className="text-gray-400 mb-6">We encountered an unexpected error securely loading the portal. Please try again.</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-white text-black rounded-xl font-bold"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
