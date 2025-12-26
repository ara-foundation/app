import React from 'react';
import PageLikePanel from '@/components/panel/PageLikePanel';

interface GalaxyAgreementDialogProps {
    galaxyName: string;
}

const GalaxyAgreementDialog: React.FC<GalaxyAgreementDialogProps> = ({
    galaxyName,
}) => {
    return (
        <PageLikePanel
            icon="info"
            titleCenter={true}
            title="Agreement"
            interactive={false}
        >
            <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                        Requirement
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                        You must be owner of the project, otherwise funding or changing license is not valid.
                    </p>
                </div>

                <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Ara has two rules:
                    </p>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-2">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            <span className="font-semibold">Rule 1:</span> You forge stars for galaxy <span className="font-semibold">"{galaxyName}"</span>. 100,000 star tokens.
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-500">
                            Then it changes to star token holders.
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            <span className="font-semibold">Rule 2:</span> We have only rules and nothing else.
                        </p>
                    </div>
                </div>

                {/* Buttons removed - stepper handles navigation */}
            </div>
        </PageLikePanel>
    );
};

export default GalaxyAgreementDialog;

