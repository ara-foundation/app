import React, { useState } from 'react';
import Button from '@/components/custom-ui/Button';
import Tooltip from '@/components/custom-ui/Tooltip';
import PageLikePanel from '@/components/panel/PageLikePanel';
import SocialLink from '@/components/utilitified_decorations/SocialLink';
import { socialLinks } from '@/types/ara';

const NewGalaxyButton: React.FC = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleButtonClick = () => {
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    return (
        <>
            <Tooltip content="Add open-source repository to create it's galaxy">
                <Button
                    variant="secondary"
                    outline={true}
                    className="opacity-70 hover:opacity-100 text-slate-400 dark:text-slate-500 text-xs"
                    onClick={handleButtonClick}
                >
                    New Galaxy
                </Button>
            </Tooltip>

            {isDialogOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-[100]"
                        onClick={handleCloseDialog}
                    />

                    {/* Dialog */}
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] flex items-center justify-center">
                        <PageLikePanel title="Not Available Yet" titleCenter={true}>
                            <p className="text-slate-600 dark:text-slate-400 mb-4 text-lg text-center">
                                This feature is not available yet. Follow us on social media to stay updated!
                            </p>

                            <div className="flex items-center justify-center gap-4 mb-6">
                                <SocialLink link={socialLinks.github} className="flex rounded-sm w-10 h-10 items-center justify-center hover:opacity-80 transition-opacity" />
                                <SocialLink link={socialLinks.twitter} className="flex rounded-sm w-10 h-10 items-center justify-center hover:opacity-80 transition-opacity" />
                                <SocialLink link={socialLinks.telegram} className="flex rounded-sm w-10 h-10 items-center justify-center hover:opacity-80 transition-opacity" />
                                <SocialLink link={socialLinks.bluesky} className="flex rounded-sm w-10 h-10 items-center justify-center hover:opacity-80 transition-opacity" />
                            </div>

                            <div className="flex gap-3 justify-center">
                                <Button
                                    variant="primary"
                                    onClick={handleCloseDialog}
                                    size="md"
                                >
                                    Close
                                </Button>
                            </div>
                        </PageLikePanel>
                    </div>
                </>
            )}
        </>
    );
};

export default NewGalaxyButton;

