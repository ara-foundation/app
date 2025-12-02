import React, { useState, useEffect } from 'react';

interface GalaxyZoomControlsProps {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  onZoomChange?: (zoom: number) => void;
  stepSize?: number;
}

const GalaxyZoomControls: React.FC<GalaxyZoomControlsProps> = ({
  initialZoom = 100,
  minZoom = 25,
  maxZoom = 200,
  stepSize = 10,
  onZoomChange,
}) => {
  const [zoom, setZoom] = useState(initialZoom);

  useEffect(() => {
    setZoom(initialZoom);
  }, [initialZoom]);

  useEffect(() => {
    onZoomChange?.(zoom);
  }, [zoom, onZoomChange]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + stepSize, maxZoom));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - stepSize, minZoom));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(Number(e.target.value));
  };

  return (
    <div className="fixed bottom-20 left-4 z-50 backdrop-blur-lg bg-slate-900/30 dark:bg-slate-100/20 border border-slate-500/30 rounded-xs p-3 shadow-lg">
      <div className="flex items-center gap-3">
        {/* Zoom Out Button */}
        <button
          onClick={handleZoomOut}
          disabled={zoom <= minZoom}
          className="p-1.5 rounded hover:bg-slate-700/50 dark:hover:bg-slate-300/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Zoom out"
        >
          <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        {/* Zoom Display and Slider */}
        <div className="flex flex-col items-center gap-1 min-w-[120px]">
          <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            {zoom}%
          </div>
          <input
            type="range"
            min={minZoom}
            max={maxZoom}
            value={zoom}
            onChange={handleSliderChange}
            className="w-full h-1.5 bg-slate-700/50 dark:bg-slate-300/30 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${((zoom - minZoom) / (maxZoom - minZoom)) * 100}%, rgb(51 65 85 / 0.5) ${((zoom - minZoom) / (maxZoom - minZoom)) * 100}%, rgb(51 65 85 / 0.5) 100%)`,
            }}
          />
        </div>

        {/* Zoom In Button */}
        <button
          onClick={handleZoomIn}
          disabled={zoom >= maxZoom}
          className="p-1.5 rounded hover:bg-slate-700/50 dark:hover:bg-slate-300/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Zoom in"
        >
          <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: rgb(59 130 246);
          cursor: pointer;
          border: 2px solid rgb(30 41 59);
          box-shadow: 0 0 4px rgba(59, 130, 246, 0.5);
        }

        .slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: rgb(59 130 246);
          cursor: pointer;
          border: 2px solid rgb(30 41 59);
          box-shadow: 0 0 4px rgba(59, 130, 246, 0.5);
        }
      ` }} />
    </div>
  );
};

export default GalaxyZoomControls;

