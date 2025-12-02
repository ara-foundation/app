import React, { useState, useEffect } from 'react';
import GalaxyZoomWrapper from '@/components/galactic/GalaxyZoomWrapper';

interface GalaxyLayoutBodyProps {
  projectName?: string;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  maxGalaxyContent?: number;
}

const GalaxyLayoutBody: React.FC<GalaxyLayoutBodyProps> = ({
  projectName,
  initialZoom,
  minZoom,
  maxZoom,
  maxGalaxyContent = 100,
}) => {
  const [initialViewportSize, setInitialViewportSize] = useState({ width: 0, height: 0 });
  const [currentZoom, setCurrentZoom] = useState(initialZoom || 100);
  const [virtualScreenSize, setVirtualScreenSize] = useState({ width: 0, height: 0 });

  // Initialize viewport size
  useEffect(() => {
    const updateViewportSize = () => {
      const size = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      setInitialViewportSize(size);
      setVirtualScreenSize(size);
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  const handleZoomChange = (zoom: number, virtualSize: { width: number; height: number }) => {
    setCurrentZoom(zoom);
    setVirtualScreenSize(virtualSize);

    // Dispatch custom event for GalaxyWrapper to listen
    const event = new CustomEvent('galaxy-zoom-change', {
      detail: {
        zoom,
        virtualScreenSize: virtualSize,
        initialViewportSize,
      },
    });
    window.dispatchEvent(event);
  };

  return (
    <GalaxyZoomWrapper
      projectName={projectName}
      initialZoom={initialZoom}
      minZoom={minZoom}
      maxZoom={maxZoom}
      maxGalaxyContent={maxGalaxyContent}
      onZoomChange={handleZoomChange}
    />
  );
};

export default GalaxyLayoutBody;

