import React from 'react';
import Button from '@/components/custom-ui/Button';
import PageLikePanel from '@/components/panel/PageLikePanel';

interface GalaxyNavigationDialogProps {
    projectName: string;
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const GalaxyNavigationDialog: React.FC<GalaxyNavigationDialogProps> = ({
    projectName,
    isOpen,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="absolute top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-100"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 inset-0 z-101 flex items-center justify-center">
                <PageLikePanel title="Leave Galaxy?" titleCenter={true} >
                    <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
                        You are about to leave the <span className="font-semibold text-slate-800 dark:text-slate-200">"{projectName}"</span> galaxy to go to <span className="font-semibold text-slate-800 dark:text-slate-200">'Ara All Stars'</span>.
                    </p>

                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="secondary"
                            onClick={onCancel}
                            size="md"
                        >
                            No
                        </Button>
                        <Button
                            variant="primary"
                            onClick={onConfirm}
                            size="md"
                        >
                            Yes
                        </Button>
                    </div>
                </PageLikePanel>
            </div>
        </>
    );
};

export default GalaxyNavigationDialog;

