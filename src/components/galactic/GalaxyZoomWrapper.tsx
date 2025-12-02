import React, { useState, useEffect, useRef } from 'react';
import GalacticMeasurements from './GalacticMeasurements';
import GalaxyZoomControls from './GalaxyZoomControls';
import GalaxyNavigationDialog from './GalaxyNavigationDialog';

interface GalaxyZoomWrapperProps {
  projectName?: string;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  maxGalaxyContent?: number;
  onZoomChange?: (zoom: number, virtualScreenSize: { width: number; height: number }) => void;
}

const VIRTUAL_SCREEN_STEP = 128; // 128px step for virtual screen size increments

const GalaxyZoomWrapper: React.FC<GalaxyZoomWrapperProps> = ({
  projectName = 'Project Name',
  initialZoom = 100,
  minZoom = 25,
  maxZoom = 100,
  maxGalaxyContent = 100,
  onZoomChange,
}) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [showDialog, setShowDialog] = useState(false);
  const hasShownDialogRef = useRef(false);
  const [initialViewportSize, setInitialViewportSize] = useState({ width: 0, height: 0 });
  const [virtualScreenSize, setVirtualScreenSize] = useState({ width: 0, height: 0 });

  // Initialize viewport size and virtual screen size
  useEffect(() => {
    const updateViewportSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setInitialViewportSize({ width, height });
      // Initialize virtual screen size to viewport size
      setVirtualScreenSize({ width, height });
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  // Calculate virtual screen size based on zoom (128px step increments)
  useEffect(() => {
    if (initialViewportSize.width === 0 || initialViewportSize.height === 0) return;

    const zoomDelta = zoom - 100;
    // Calculate virtual size: each 1% zoom change = 128px change in virtual screen size
    // Round to nearest 128px increment to ensure exact steps
    const virtualWidthRaw = initialViewportSize.width + (zoomDelta * VIRTUAL_SCREEN_STEP / 100);
    const virtualHeightRaw = initialViewportSize.height + (zoomDelta * VIRTUAL_SCREEN_STEP / 100);

    // Round to nearest 128px increment
    const virtualWidth = Math.round(virtualWidthRaw / VIRTUAL_SCREEN_STEP) * VIRTUAL_SCREEN_STEP;
    const virtualHeight = Math.round(virtualHeightRaw / VIRTUAL_SCREEN_STEP) * VIRTUAL_SCREEN_STEP;

    const newSize = {
      width: Math.max(0, virtualWidth),
      height: Math.max(0, virtualHeight),
    };
    setVirtualScreenSize(newSize)
    onZoomChange?.(zoom, newSize);
  }, [zoom, initialViewportSize]);

  useEffect(() => {
    if (zoom <= minZoom && !hasShownDialogRef.current) {
      setShowDialog(true);
      hasShownDialogRef.current = true;
    } else if (zoom > minZoom) {
      hasShownDialogRef.current = false;
    }
  }, [zoom, minZoom]);

  // Apply scaling based on virtual screen size
  useEffect(() => {
    if (virtualScreenSize.width === 0 || virtualScreenSize.height === 0) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate content scale (caps at maxGalaxyContent when zoom > 100%)
    const contentScale = zoom <= 100
      ? zoom / 100
      : Math.min(zoom / 100, maxGalaxyContent / 100);

    // Calculate background scale to match virtual screen size
    // Background canvas should be virtual screen size, but viewport shows 100% coverage
    const backgroundScaleX = virtualScreenSize.width / viewportWidth;
    const backgroundScaleY = virtualScreenSize.height / viewportHeight;

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

      // Viewport should always cover 100% of physical screen
      // If virtual > viewport, scale background to show viewport portion (scrollable)
      // The background is zoomed in (larger), but viewport shows portion of it
      // If virtual < viewport, canvas is extended, no scale needed (viewport shows all)
      if (virtualScreenSize.width > viewportWidth || virtualScreenSize.height > viewportHeight) {
        // Virtual screen is larger - scale background so viewport shows portion
        // Scale down the larger virtual screen to fit in viewport
        // This shows a "zoomed in" portion of the virtual screen
        const scaleX = viewportWidth / virtualScreenSize.width;
        const scaleY = viewportHeight / virtualScreenSize.height;
        // Use the smaller scale to ensure viewport is fully covered
        const scale = Math.min(scaleX, scaleY);
        bgEl.style.transform = `scale(${scale})`;
        bgEl.style.transformOrigin = 'center center';
      } else {
        // Virtual screen is smaller - canvas extended, no scale
        bgEl.style.transform = 'none';
      }
    }

    // Apply transform to content container
    const contentContainer = document.querySelector('[data-galaxy-content]');
    if (contentContainer) {
      (contentContainer as HTMLElement).style.transform = `scale(${contentScale})`;
      (contentContainer as HTMLElement).style.transformOrigin = 'center center';
    }
  }, [zoom, virtualScreenSize, maxGalaxyContent]);

  const handleConfirm = () => {
    setShowDialog(false);
    window.location.href = '/all-stars';
  };

  const handleCancel = () => {
    setShowDialog(false);
    setZoom(minZoom + 1);
    hasShownDialogRef.current = false;
  };

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

