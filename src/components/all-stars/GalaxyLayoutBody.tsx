import React, { useState, useEffect, useRef } from 'react';
import GalacticMeasurements from './GalacticMeasurements';
import GalaxyZoomControls from './GalaxyZoomControls';
import GalaxyNavigationDialog from './GalaxyNavigationDialog';
import AllStarsLink from './AllStarsLink';

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
    const contentContainer = document.querySelector('[data-galaxy-content]');
    if (contentContainer) {
      const contentEl = contentContainer as HTMLElement;
      contentEl.style.transition = 'transform 0.4s ease-out';
      contentEl.style.transformOrigin = 'center center';
    }
  }, []);

  // Calculate virtual screen size based on zoom (128px step increments)
  useEffect(() => {
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
    const contentContainer = document.querySelector('[data-galaxy-content]');
    if (contentContainer) {
      const contentEl = contentContainer as HTMLElement;
      contentEl.style.transform = `scale(${contentScale})`;
    }

  }, [virtualScreenSize]);

  const handleZoomChange = (zoom: number, virtualSize: { width: number; height: number }) => {
    // Dispatch custom event for GalaxyWrapper to listen
    const event = new CustomEvent('galaxy-zoom-change', {
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

    window.addEventListener('galaxy-zoom-to', handleZoomTo as EventListener);
    return () => {
      window.removeEventListener('galaxy-zoom-to', handleZoomTo as EventListener);
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

