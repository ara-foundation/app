import React, { useState, useEffect } from 'react';
import ControlPanel from '@/components/panel/ControlPanel';
import Button from '@/components/custom-ui/Button';
import Tooltip from '@/components/custom-ui/Tooltip';
import NumberFlow from '@number-flow/react';

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
  maxZoom = 100,
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

  const handleReset = () => {
    setZoom(100);
  };

  return (
    <div className="fixed bottom-22 left-8 z-50">
      <ControlPanel className="p-3">
        <div className="flex items-center gap-2">
          {/* Zoom Out Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= minZoom}
            outline={true}
            className="p-1.5 min-w-[32px] h-8 flex items-center justify-center"
            aria-label="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </Button>

          {/* Zoom Display and Slider */}
          <div className="flex flex-col items-center gap-1 min-w-[120px]">
            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                <NumberFlow
                  value={zoom}
                  locales="en-US"
                  format={{ style: 'decimal', maximumFractionDigits: 0, useGrouping: false }}
                />
                %
              </div>
              {zoom !== 100 && (
                <Tooltip content="Reset to 100%">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleReset}
                    outline={true}
                    className="p-1 min-w-[24px] h-6 flex items-center justify-center"
                    aria-label="Reset to 100%"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </Button>
                </Tooltip>
              )}
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
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= maxZoom}
            outline={true}
            className="p-1.5 min-w-[32px] h-8 flex items-center justify-center"
            aria-label="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>
      </ControlPanel>

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

