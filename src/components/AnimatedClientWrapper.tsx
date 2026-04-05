"use client";
import dynamic from 'next/dynamic';

export const AnimatedHomepageClient = dynamic(
  () => import('./AnimatedHomepage'),
  { loading: () => null, ssr: false }
);
