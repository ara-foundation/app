import React, { useState } from 'react';
import PageLikePanel from '@/components/panel/PageLikePanel';

interface GalaxyPlacementPanelProps {
    galaxyName: string;
    isPlaced?: boolean;
}

const GalaxyPlacementPanel: React.FC<GalaxyPlacementPanelProps> = ({
    galaxyName,
    isPlaced = false,
}) => {
    if (isPlaced) {
        return (
            <PageLikePanel
                icon="check"
                titleCenter={true}
                title="Galaxy Placed"
                interactive={false}
            >
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                        Your galaxy <span className="font-semibold">"{galaxyName}"</span> has been placed on the Cosmic map!
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                        It's now visible to others and can be discovered online.
                    </p>
                </div>
            </PageLikePanel>
        );
    }

    return (
        <PageLikePanel
            icon="influencer"
            titleCenter={true}
            title="Place Galaxy"
            interactive={false}
        >
            <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        Galaxy is not set yet. Not visible to others. Place in Cosmic around Ara so that people can visit and discover it online.
                    </p>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Your galaxy <span className="font-semibold">"{galaxyName}"</span> will be automatically placed at a default position around Ara.
                </p>

                {/* Button removed - stepper handles navigation */}
            </div>
        </PageLikePanel>
    );
};

export default GalaxyPlacementPanel;

