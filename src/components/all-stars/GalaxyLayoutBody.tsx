import React, { useState, useEffect, useRef } from 'react';
import GalacticMeasurements from './GalacticMeasurements';
import GalaxyZoomControls from './GalaxyZoomControls';
import GalaxyNavigationDialog from './GalaxyNavigationDialog';
import AllStarsLink from './AllStarsLink';
import { GALAXY_ZOOM_EVENTS } from '@/types/galaxy';

interface GalaxyZoomWrapperProps {
  projectName?: string;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  maxGalaxyContent?: number;
  projectId?: string;
}

const VIRTUAL_SCREEN_STEP = 128; // 128px step for virtual screen size increments

const GalaxyZoomWrapper: React.FC<GalaxyZoomWrapperProps> = ({
  projectName = 'Project Name',
  initialZoom = 100,
  minZoom = 25,
  maxZoom = 100,
  maxGalaxyContent = 100,
  projectId,
}) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [showDialog, setShowDialog] = useState(false);
  const hasShownDialogRef = useRef(false);
  const [virtualScreenSize, setVirtualScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isAllStarsPage, setIsAllStarsPage] = useState(false);
  const previousZoomRef = useRef(initialZoom);
  const scrollPositionRef = useRef({ x: 0, y: 0 });
  const isZoomingRef = useRef(false);

  // Check if we're on the all-stars page
  useEffect(() => {
    const checkPath = () => {
      setIsAllStarsPage(window.location.pathname.includes('/all-stars'));
    };
    checkPath();
    // Listen for navigation changes
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);


  // Initialize viewport size and virtual screen size
  useEffect(() => {
    const updateViewportSize = () => {
      setVirtualScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  // Set up smooth transition for content container on mount
  useEffect(() => {
    const contentContainer = document.querySelector('#galaxy-space');
    if (contentContainer) {
      const contentEl = contentContainer as HTMLElement;
      contentEl.style.transition = 'transform 0.4s ease-out';
      contentEl.style.transformOrigin = 'center center';
    }
  }, []);

  // Calculate virtual screen size based on zoom (128px step increments)
  useEffect(() => {
    // Save current scroll position before zoom changes
    scrollPositionRef.current = {
      x: window.scrollX || document.documentElement.scrollLeft,
      y: window.scrollY || document.documentElement.scrollTop,
    };

    const zoomDelta = 100 - zoom;
    const virtualWidth = Math.round(window.innerWidth + (zoomDelta * VIRTUAL_SCREEN_STEP / 10));
    const virtualHeight = Math.round(window.innerHeight + (zoomDelta * VIRTUAL_SCREEN_STEP / 10));

    const newSize = {
      width: Math.max(0, virtualWidth),
      height: Math.max(0, virtualHeight),
    };
    if (newSize.width !== virtualScreenSize.width || newSize.height !== virtualScreenSize.height) {
      setVirtualScreenSize(newSize)
    }
    handleZoomChange(zoom, newSize);
    previousZoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    // Don't show dialog on all-stars page (can't navigate to itself)
    if (zoom <= minZoom && !hasShownDialogRef.current && !isAllStarsPage) {
      setShowDialog(true);
      hasShownDialogRef.current = true;
    } else if (zoom > minZoom) {
      hasShownDialogRef.current = false;
    }

    // Apply scaling based on virtual screen size
    if (virtualScreenSize.width === 0 || virtualScreenSize.height === 0) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate content scale (caps at maxGalaxyContent when zoom > 100%)
    const contentScale = zoom <= 100
      ? zoom / 100
      : Math.min(zoom / 100, maxGalaxyContent / 100);

    // Handle background container
    const backgroundContainer = document.querySelector('[data-galaxy-backgrounds]');
    if (backgroundContainer) {
      const bgEl = backgroundContainer as HTMLElement;

      // Background canvas should match virtual screen size
      // But if virtual < viewport, extend canvas to fill viewport
      const canvasWidth = Math.max(virtualScreenSize.width, viewportWidth);
      const canvasHeight = Math.max(virtualScreenSize.height, viewportHeight);

      bgEl.style.width = `${canvasWidth}px`;
      bgEl.style.height = `${canvasHeight}px`;
    }

    // Apply transform to content container (transition is set on mount)
    const contentContainer = document.querySelector('#galaxy-space');
    if (contentContainer) {
      const contentEl = contentContainer as HTMLElement;

      // Preserve scroll position when zoom changes
      // Only adjust scroll if zoom actually changed (not initial render)
      if (previousZoomRef.current !== initialZoom && previousZoomRef.current !== zoom && !isZoomingRef.current) {
        isZoomingRef.current = true;

        // Temporarily disable transition for instant scroll adjustment
        const originalTransition = contentEl.style.transition;
        contentEl.style.transition = 'none';

        // Get current scroll position
        const scrollBefore = {
          x: window.scrollX || document.documentElement.scrollLeft,
          y: window.scrollY || document.documentElement.scrollTop,
        };

        // Get viewport center in document coordinates
        const viewportCenter = {
          x: scrollBefore.x + window.innerWidth / 2,
          y: scrollBefore.y + window.innerHeight / 2,
        };

        // Calculate previous scale
        const previousScale = previousZoomRef.current <= 100
          ? previousZoomRef.current / 100
          : Math.min(previousZoomRef.current / 100, maxGalaxyContent / 100);

        // Get content container's bounding box before transform
        const contentRectBefore = contentEl.getBoundingClientRect();
        const contentTopBefore = scrollBefore.y + contentRectBefore.top;
        const contentLeftBefore = scrollBefore.x + contentRectBefore.left;
        const contentCenterBefore = {
          x: contentLeftBefore + contentRectBefore.width / 2,
          y: contentTopBefore + contentRectBefore.height / 2,
        };

        // Calculate point relative to content center (transform origin is center center)
        const pointRelativeToCenter = {
          x: (viewportCenter.x - contentCenterBefore.x) / previousScale,
          y: (viewportCenter.y - contentCenterBefore.y) / previousScale,
        };

        // Apply the new transform
        contentEl.style.transform = `scale(${contentScale})`;

        // Wait for transform to be applied
        requestAnimationFrame(() => {
          // Get content container's bounding box after transform
          const contentRectAfter = contentEl.getBoundingClientRect();
          const scrollAfter = {
            x: window.scrollX || document.documentElement.scrollLeft,
            y: window.scrollY || document.documentElement.scrollTop,
          };
          const contentTopAfter = scrollAfter.y + contentRectAfter.top;
          const contentLeftAfter = scrollAfter.x + contentRectAfter.left;
          const contentCenterAfter = {
            x: contentLeftAfter + contentRectAfter.width / 2,
            y: contentTopAfter + contentRectAfter.height / 2,
          };

          // Calculate where the reference point is now in document coordinates
          const newDocumentPoint = {
            x: contentCenterAfter.x + (pointRelativeToCenter.x * contentScale),
            y: contentCenterAfter.y + (pointRelativeToCenter.y * contentScale),
          };

          // Calculate new scroll position to keep viewport center at the same document point
          const newScroll = {
            x: newDocumentPoint.x - window.innerWidth / 2,
            y: newDocumentPoint.y - window.innerHeight / 2,
          };

          // Scroll to maintain viewport position
          window.scrollTo({
            left: Math.max(0, newScroll.x),
            top: Math.max(0, newScroll.y),
            behavior: 'auto'
          });

          // Re-enable transition
          contentEl.style.transition = originalTransition;
          isZoomingRef.current = false;
        });
      } else {
        // Just apply transform without scroll adjustment (initial render or no zoom change)
        contentEl.style.transform = `scale(${contentScale})`;
        isZoomingRef.current = false;
      }
    }

  }, [virtualScreenSize, zoom, minZoom, maxGalaxyContent, isAllStarsPage, initialZoom]);

  const handleZoomChange = (zoom: number, virtualSize: { width: number; height: number }) => {
    // Dispatch custom event for GalaxyWrapper to listen
    const event = new CustomEvent(GALAXY_ZOOM_EVENTS.ZOOM_CHANGE, {
      detail: {
        zoom,
        virtualScreenSize: virtualSize,
      },
    });
    window.dispatchEvent(event);
  };


  const handleConfirm = () => {
    setShowDialog(false);
    const url = projectId ? `/all-stars?galaxy=${projectId}` : '/all-stars';
    window.location.href = url;
  };

  const handleCancel = () => {
    setShowDialog(false);
    setZoom(minZoom + 1);
    hasShownDialogRef.current = false;
  };

  // Smooth zoom animation function
  const animateZoomTo = (targetZoom: number, duration: number = 1500) => {
    const startZoom = zoom;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-in-out)
      const easeInOut = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentZoom = startZoom + (targetZoom - startZoom) * easeInOut;
      setZoom(currentZoom);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  // Listen for zoom-to events
  useEffect(() => {
    const handleZoomTo = (event: CustomEvent) => {
      const { targetZoom } = event.detail;
      if (typeof targetZoom === 'number') {
        animateZoomTo(targetZoom);
      }
    };

    window.addEventListener(GALAXY_ZOOM_EVENTS.ZOOM_TO, handleZoomTo as EventListener);
    return () => {
      window.removeEventListener(GALAXY_ZOOM_EVENTS.ZOOM_TO, handleZoomTo as EventListener);
    };
  }, [zoom]);

  return (
    <>
      {/* Galaxy Measurements - Not scaled, always at 100% */}
      <GalacticMeasurements virtualScreenSize={virtualScreenSize} />

      {/* Zoom Controls - Not scaled, always at 100% */}
      <GalaxyZoomControls
        initialZoom={zoom}
        onZoomChange={setZoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
      />

      {/* All Stars Link - Not scaled, always at 100% - Hidden on all-stars page */}
      {!isAllStarsPage && <AllStarsLink projectId={projectId} />}

      {/* Navigation Dialog - Not scaled, always at 100% */}
      <GalaxyNavigationDialog
        projectName={projectName}
        isOpen={showDialog}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default GalaxyZoomWrapper;

