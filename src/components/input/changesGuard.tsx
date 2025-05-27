'use client';

import { useEffect } from 'react';

export function ChangesGuard({
  shouldBlock,
  confirmMessage = 'Are you sure you want to leave this page?',
}: {
  shouldBlock: boolean;
  confirmMessage?: string;
}) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldBlock) {
        e.preventDefault();
        return confirmMessage;
      }
    };

    const handlePopState = () => {
      if (shouldBlock && !confirm(confirmMessage)) {
        history.pushState(null, '', location.href); // Cancel popstate navigation
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shouldBlock, confirmMessage]);

  return null;
}