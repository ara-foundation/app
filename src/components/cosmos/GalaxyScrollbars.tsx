import React, { useState, useEffect } from 'react';

interface GalaxyScrollbarsProps {
  virtualScreenSize: { width: number; height: number };
  zoom: number;
}

const GalaxyScrollbars: React.FC<GalaxyScrollbarsProps> = ({ virtualScreenSize, zoom }) => {
  const [showScrollbars, setShowScrollbars] = useState(zoom !== 100);
  const backgroundContainerRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    setShowScrollbars(zoom !== 100);
  }, [zoom]);

  useEffect(() => {
    const backgroundContainer = document.querySelector('[data-galaxy-backgrounds]') as HTMLElement;
    if (!backgroundContainer) return;

    backgroundContainerRef.current = backgroundContainer;

    if (zoom !== 100 && virtualScreenSize.width > 0 && virtualScreenSize.height > 0) {
      // Enable scrolling when zoomed out
      backgroundContainer.style.overflow = 'auto';
      backgroundContainer.style.width = `${virtualScreenSize.width}px`;
      backgroundContainer.style.height = `${virtualScreenSize.height}px`;
      // Center the content initially
      setTimeout(() => {
        backgroundContainer.scrollLeft = (virtualScreenSize.width - window.innerWidth) / 2;
        backgroundContainer.scrollTop = (virtualScreenSize.height - window.innerHeight) / 2;
      }, 0);
    } else {
      // Disable scrolling at 100% zoom
      backgroundContainer.style.overflow = 'hidden';
      backgroundContainer.style.width = '100vw';
      backgroundContainer.style.height = '100vh';
      backgroundContainer.scrollLeft = 0;
      backgroundContainer.scrollTop = 0;
    }

    return () => {
      if (backgroundContainer) {
        backgroundContainer.style.overflow = '';
        backgroundContainer.style.width = '';
        backgroundContainer.style.height = '';
      }
    };
  }, [zoom, virtualScreenSize]);

  if (zoom === 100) {
    return null;
  }

  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        [data-galaxy-backgrounds] {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.1) transparent;
        }

        [data-galaxy-backgrounds]::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }

        [data-galaxy-backgrounds]::-webkit-scrollbar-track {
          background: transparent;
        }

        [data-galaxy-backgrounds]::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.1);
          border-radius: 6px;
          border: 2px solid transparent;
          background-clip: padding-box;
          transition: background 0.3s ease, backdrop-filter 0.3s ease;
        }

        [data-galaxy-backgrounds]:hover::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.4);
          backdrop-filter: blur(4px);
        }

        [data-galaxy-backgrounds]::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.6);
          backdrop-filter: blur(8px);
        }

        [data-galaxy-backgrounds]::-webkit-scrollbar-corner {
          background: transparent;
        }
      `
    }} />
  );
};

export default GalaxyScrollbars;

