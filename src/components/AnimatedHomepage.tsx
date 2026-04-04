"use client";

import { useEffect, useState } from 'react';
import { LandingPageUI } from './LandingPageUI';
import { AppHomepageUI } from './AppHomepageUI';
import { MarketplaceHomepageUI } from './MarketplaceHomepageUI';

export default function AnimatedHomepage({ type, user, lastBooking, tenant, brands, services }: any) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // GSAP and Framer-Motion are loaded here via dynamic import.
    // They will only start downloading AFTER the static shell is painted.
    Promise.all([
      import('framer-motion')
    ]).then(() => {
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  if (type === 'marketplace') {
      return <MarketplaceHomepageUI brands={brands} services={services} />;
  }
  
  if (type === 'app') {
      return <AppHomepageUI user={user} lastBooking={lastBooking} tenant={tenant} />;
  }

  return <LandingPageUI services={services} tenant={tenant} />;
}
