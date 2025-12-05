import React, { useEffect } from 'react';

interface GalaxyAutoZoomProps {
  galaxyX?: number;
  galaxyY?: number;
}

const GalaxyAutoZoom: React.FC<GalaxyAutoZoomProps> = ({ galaxyX, galaxyY }) => {
  useEffect(() => {
    if (galaxyX === undefined || galaxyY === undefined) return;

    // Ara is at (0, 0)
    const araX = 0;
    const araY = 0;

    // Calculate distance between Ara and galaxy
    const dx = galaxyX - araX;
    const dy = galaxyY - araY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const viewportDiagonal = Math.sqrt(viewportWidth * viewportWidth + viewportHeight * viewportHeight);

    // Calculate if we need to zoom out to fit both points
    // Add padding (20% on each side)
    const padding = 0.4; // 40% total padding
    const requiredDistance = distance * (1 + padding);

    // Calculate zoom level needed to fit both points
    // Zoom formula: if distance > viewport diagonal, we need to zoom out
    if (requiredDistance > viewportDiagonal) {
      // Calculate zoom percentage (lower zoom = more zoomed out)
      // We want to fit both points with padding
      const zoomRatio = viewportDiagonal / requiredDistance;
      const targetZoom = Math.max(25, Math.min(100, zoomRatio * 100));

      // Dispatch zoom event after a short delay to ensure the page is ready
      setTimeout(() => {
        const event = new CustomEvent('galaxy-zoom-to', {
          detail: { targetZoom },
        });
        window.dispatchEvent(event);
      }, 100);
    }
  }, [galaxyX, galaxyY]);

  return null; // This component doesn't render anything
};

export default GalaxyAutoZoom;

