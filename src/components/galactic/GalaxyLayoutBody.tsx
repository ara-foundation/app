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
}

const VIRTUAL_SCREEN_STEP = 128; // 128px step for virtual screen size increments

const GalaxyZoomWrapper: React.FC<GalaxyZoomWrapperProps> = ({
  projectName = 'Project Name',
  initialZoom = 100,
  minZoom = 25,
  maxZoom = 100,
  maxGalaxyContent = 100,
}) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [showDialog, setShowDialog] = useState(false);
  const hasShownDialogRef = useRef(false);
  const [virtualScreenSize, setVirtualScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });


  // Initialize viewport size and virtual screen size
  useEffect(() => {
    const updateViewportSize = () => {
      setVirtualScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
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
    if (zoom <= minZoom && !hasShownDialogRef.current) {
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

    // Apply transform to content container
    const contentContainer = document.querySelector('[data-galaxy-content]');
    if (contentContainer) {
      (contentContainer as HTMLElement).style.transform = `scale(${contentScale})`;
      (contentContainer as HTMLElement).style.transformOrigin = 'center center';
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

