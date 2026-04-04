"use client";


import dynamic from 'next/dynamic';

export const DynamicMarketplaceHomepageUI = dynamic(
  () => import('./MarketplaceHomepageUI').then(mod => mod.MarketplaceHomepageUI),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen w-full flex items-center justify-center animate-pulse bg-gray-50">
        <div className="w-12 h-12 rounded-full bg-gray-200" />
      </div>
    )
  }
);
