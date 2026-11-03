'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            // Service worker successfully registered
          })
          .catch(() => {
            // Ignore if service worker fails (e.g. non-HTTPS local dev)
          });
      });
    }
  }, []);

  return null;
}
