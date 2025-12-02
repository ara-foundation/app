import React, { useState, useEffect, useRef } from 'react';
import GalacticMeasurements from './GalacticMeasurements';
import GalaxyZoomControls from './GalaxyZoomControls';
import GalaxyNavigationDialog from './GalaxyNavigationDialog';

interface GalacticUIProps {
  projectName?: string;
  initialZoom?: number;
  minZoom?: number;
}

const GalacticUI: React.FC<GalacticUIProps> = ({ projectName = 'Project Name', initialZoom = 100, minZoom = 25 }) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [showDialog, setShowDialog] = useState(false);
  const hasShownDialogRef = useRef(false);

  useEffect(() => {
    if (zoom <= minZoom && !hasShownDialogRef.current) {
      setShowDialog(true);
      hasShownDialogRef.current = true;
    } else if (zoom > minZoom) {
      // Reset the flag when zoom goes above 0
      hasShownDialogRef.current = false;
    }
  }, [zoom]);

  const handleConfirm = () => {
    setShowDialog(false);
    window.location.href = '/all-stars';
  };

  const handleCancel = () => {
    setShowDialog(false);
    setZoom(minZoom + 1); // Set zoom to 1% when user clicks No
    hasShownDialogRef.current = false; // Reset flag so dialog can show again if zoom goes to 0 again
  };

  return (
    <>
      {/* Border Ornaments
      <GalacticBorderOrnament position="top" />
      <GalacticBorderOrnament position="bottom" />
      <GalacticBorderOrnament position="left" />
      <GalacticBorderOrnament position="right" /> */}

      {/* Coordinate Measurements */}
      <GalacticMeasurements zoom={zoom} />

      {/* Zoom Controls */}
      <GalaxyZoomControls
        initialZoom={zoom}
        onZoomChange={setZoom}
      />

      {/* Navigation Dialog */}
      <GalaxyNavigationDialog
        projectName={projectName}
        isOpen={showDialog}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default GalacticUI;

