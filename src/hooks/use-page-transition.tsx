import { useState, useEffect, useRef, useCallback } from 'react';

interface UsePageTransitionReturn {
  isTransitioning: boolean;
  targetUrl: string;
  showOverlay: boolean;
}

const MIN_DELAY_MS = 1000;

export function usePageTransition(): UsePageTransitionReturn {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const transitionStartTimeRef = useRef<number | null>(null);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const overlayShownRef = useRef(false);
  const isInitialMountRef = useRef(true);

  const handleAfterNavigate = useCallback(() => {
    // Clear the delay timeout if navigation completes quickly
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }

    // If overlay was shown, wait a bit before hiding for smooth transition
    if (overlayShownRef.current) {
      // Small delay to allow the exit animation
      setTimeout(() => {
        setShowOverlay(false);
        setIsTransitioning(false);
        setTargetUrl('');
        transitionStartTimeRef.current = null;
        overlayShownRef.current = false;
      }, 100);
    } else {
      // If overlay wasn't shown (fast navigation), reset immediately
      setIsTransitioning(false);
      setTargetUrl('');
      transitionStartTimeRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Mark initial mount as complete after a short delay
    const initialMountTimeout = setTimeout(() => {
      isInitialMountRef.current = false;
    }, 1000);

    const handleBeforeNavigate = (event: Event) => {
      // Don't show overlay on initial page load
      if (isInitialMountRef.current) {
        return;
      }

      const customEvent = event as CustomEvent<{ to?: URL | string; from?: URL | string }>;
      let urlPath = '';

      // Try to get URL from event detail
      if (customEvent.detail?.to) {
        const toUrl = customEvent.detail.to;
        if (toUrl instanceof URL) {
          urlPath = toUrl.pathname + toUrl.search;
        } else if (typeof toUrl === 'string') {
          try {
            const url = new URL(toUrl, window.location.origin);
            urlPath = url.pathname + url.search;
          } catch {
            urlPath = toUrl;
          }
        }
      } else {
        // Fallback: try to get from current location or use a default
        urlPath = window.location.pathname + window.location.search;
      }

      if (urlPath) {
        setTargetUrl(urlPath);
        setIsTransitioning(true);
        transitionStartTimeRef.current = Date.now();
        overlayShownRef.current = false;

        // Set minimum delay before showing overlay
        delayTimeoutRef.current = setTimeout(() => {
          setShowOverlay(true);
          overlayShownRef.current = true;
        }, MIN_DELAY_MS);
      }
    };

    // Listen to Astro's transition events
    // Astro 5 uses these event names
    document.addEventListener('astro:before-preparation', handleBeforeNavigate);
    document.addEventListener('astro:after-swap', handleAfterNavigate);
    document.addEventListener('astro:page-load', handleAfterNavigate);

    // Also listen to navigation events (fallback)
    document.addEventListener('astro:before-navigation', handleBeforeNavigate);
    document.addEventListener('astro:after-navigation', handleAfterNavigate);

    return () => {
      clearTimeout(initialMountTimeout);
      document.removeEventListener('astro:before-preparation', handleBeforeNavigate);
      document.removeEventListener('astro:after-swap', handleAfterNavigate);
      document.removeEventListener('astro:page-load', handleAfterNavigate);
      document.removeEventListener('astro:before-navigation', handleBeforeNavigate);
      document.removeEventListener('astro:after-navigation', handleAfterNavigate);

      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
    };
  }, [handleAfterNavigate]);

  return {
    isTransitioning,
    targetUrl,
    showOverlay
  };
}
