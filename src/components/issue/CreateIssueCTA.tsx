import React, { useState } from 'react';
import Button from '@/components/custom-ui/Button';
import CreateIssueForm from './CreateIssueForm';
import DemoAuthPanel from '@/components/demo/DemoAuthPanel';
import { cn } from '@/lib/utils';

interface CreateIssueCTAProps {
    galaxyId: string;
    onIssueCreated?: () => void;
}

const CreateIssueCTA: React.FC<CreateIssueCTAProps> = ({ galaxyId, onIssueCreated }) => {
    const [showForm, setShowForm] = useState(false);

    const handleSuccess = () => {
        setShowForm(false);
        // Trigger refresh after a short delay to ensure database is updated
        setTimeout(() => {
            onIssueCreated?.();
            // Also trigger a custom event for issue list refresh
            window.dispatchEvent(new CustomEvent('issue-created'));
        }, 500);
    };

    return (
        <>
            <DemoAuthPanel>
                <div className={cn(
                    "fixed bottom-4 right-1/2 translate-x-1/2 z-40",
                    "backdrop-blur-md bg-white/90 dark:bg-slate-900/90",
                    "border border-slate-200/50 dark:border-slate-700/50",
                    "rounded-lg shadow-lg",
                    "transition-all duration-300",
                    "hover:shadow-xl hover:scale-105"
                )}>
                    <Button
                        variant="primary"
                        outline={true}
                        size="lg"
                        onClick={() => setShowForm(true)}
                        className="px-6 py-3 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Create Issue</span>
                    </Button>
                </div>
            </DemoAuthPanel>

            {showForm && (
                <CreateIssueForm
                    galaxyId={galaxyId}
                    onSuccess={handleSuccess}
                    onCancel={() => setShowForm(false)}
                />
            )}
        </>
    );
};

export default CreateIssueCTA;

