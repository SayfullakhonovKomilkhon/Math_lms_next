'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'sidebar:collapsed';

// Single source of truth across all dashboard sidebars (admin, super-admin,
// teacher, student, parent), persisted between sessions and synchronised
// across tabs/instances mounted on the same page so the layout never goes
// out of sync when the user toggles in one place.
export function useSidebarCollapsed(): readonly [boolean, () => void] {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === '1') setCollapsed(true);
      else if (stored === '0') setCollapsed(false);
    } catch {
      // localStorage may be blocked (private mode etc.) — ignore.
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setCollapsed(e.newValue === '1');
      }
    };
    const handleCustom = (e: Event) => {
      const detail = (e as CustomEvent<{ collapsed: boolean }>).detail;
      if (detail) setCollapsed(detail.collapsed);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('sidebar:collapsed-change', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sidebar:collapsed-change', handleCustom);
    };
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
        } catch {
          // ignore
        }
        // Notify any other sidebars mounted on the page (storage events do
        // not fire in the same window).
        window.dispatchEvent(
          new CustomEvent('sidebar:collapsed-change', {
            detail: { collapsed: next },
          }),
        );
      }
      return next;
    });
  }, []);

  return [collapsed, toggle] as const;
}
