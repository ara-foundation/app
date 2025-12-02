import React, { useState, useEffect, useRef } from 'react';
import GalacticMeasurements from './GalacticMeasurements';
import GalaxyZoomControls from './GalaxyZoomControls';
import GalaxyNavigationDialog from './GalaxyNavigationDialog';

interface GalaxyZoomWrapperProps {
  projectName?: string;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
}

const GalaxyZoomWrapper: React.FC<GalaxyZoomWrapperProps> = ({
  projectName = 'Project Name',
  initialZoom = 100,
  minZoom = 25,
  maxZoom = 200,
}) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [showDialog, setShowDialog] = useState(false);
  const hasShownDialogRef = useRef(false);

  useEffect(() => {
    if (zoom <= minZoom && !hasShownDialogRef.current) {
      setShowDialog(true);
      hasShownDialogRef.current = true;
    } else if (zoom > minZoom) {
      hasShownDialogRef.current = false;
    }
  }, [zoom, minZoom]);

  useEffect(() => {
    const zoomScale = zoom / 100;
    
    // Apply transform to background container
    const backgroundContainer = document.querySelector('[data-galaxy-backgrounds]');
    if (backgroundContainer) {
      (backgroundContainer as HTMLElement).style.transform = `scale(${zoomScale})`;
      (backgroundContainer as HTMLElement).style.transformOrigin = 'center center';
    }

    // Apply transform to content container
    const contentContainer = document.querySelector('[data-galaxy-content]');
    if (contentContainer) {
      (contentContainer as HTMLElement).style.transform = `scale(${zoomScale})`;
      (contentContainer as HTMLElement).style.transformOrigin = 'center center';
    }
  }, [zoom]);

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
      <GalacticMeasurements zoom={zoom} />

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

