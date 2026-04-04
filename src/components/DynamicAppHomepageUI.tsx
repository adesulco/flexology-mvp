"use client";


import dynamic from 'next/dynamic';

export const DynamicAppHomepageUI = dynamic(
  () => import('./AppHomepageUI').then(mod => mod.AppHomepageUI),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[100dvh] w-full flex items-center justify-center animate-pulse bg-gray-50">
        <div className="w-12 h-12 rounded-full bg-gray-200" />
      </div>
    )
  }
);
