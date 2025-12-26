import React, { useEffect, useState } from 'react';
import PageLikePanel from '@/components/panel/PageLikePanel';
import ProgressStep from '@/components/ProgressStep';
import { createGalaxyBlockchainTransaction } from '@/client-side/galaxy';

interface BlockchainTransactionPanelProps {
    galaxyId: string;
    onComplete: (data: any) => void;
    onError: (error: string) => void;
}

const BlockchainTransactionPanel: React.FC<BlockchainTransactionPanelProps> = ({
    galaxyId,
    onComplete,
    onError,
}) => {
    const [steps, setSteps] = useState<Array<{
        id: number;
        title: string;
        description: string;
        status: 'pending' | 'in-progress' | 'completed';
        progress: number;
    }>>([
        {
            id: 1,
            title: 'Creating blockchain ID',
            description: 'Generating unique blockchain identifier...',
            status: 'in-progress',
            progress: 0,
        },
        {
            id: 2,
            title: 'Waiting for transaction confirmation',
            description: 'Submitting transaction to blockchain...',
            status: 'pending',
            progress: 0,
        },
    ]);

    useEffect(() => {
        const createTransaction = async () => {
            try {

                // Step 1: Creating blockchain ID
                updateStep(1, 'in-progress', 50, 'Generating blockchain ID...');
                await new Promise(resolve => setTimeout(resolve, 500));
                updateStep(1, 'completed', 100, 'Blockchain ID generated');

                // Step 2: Transaction confirmation
                updateStep(2, 'in-progress', 50, 'Submitting transaction...');

                console.warn(`Creating blockchain transaction for galaxy ${galaxyId}`);
                const result = await createGalaxyBlockchainTransaction(galaxyId);

                if (!result.success) {
                    onError(result.error || 'Failed to create blockchain transaction');
                    return;
                }

                updateStep(2, 'completed', 100, `Transaction confirmed: ${result.data.blockchainTx?.substring(0, 16)}...`);

                onComplete(result.data);
            } catch (error) {
                console.error('Error creating blockchain transaction:', error);
                onError(error instanceof Error ? error.message : 'An error occurred');
            }
        };

        createTransaction();
    }, []);

    const updateStep = (id: number, status: 'pending' | 'in-progress' | 'completed', progress: number, description: string) => {
        setSteps(prev => prev.map(step =>
            step.id === id ? { ...step, status, progress, description } : step
        ));
    };

    return (
        <PageLikePanel
            title={
                <div className="flex justify-left items-center gap-2">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Public Ledger</span>
                </div>
            }
            interactive={false}
        >
            <p className="text-slate-600 dark:text-slate-400 mb-4">
                Creating blockchain transaction for your galaxy. This will record it on the public ledger.
            </p>

            <div className="space-y-6 mb-8">
                {steps.map((step) => (
                    <ProgressStep
                        key={step.id}
                        title={step.title}
                        description={step.description}
                        status={step.status}
                        progress={step.progress}
                    />
                ))}
            </div>
        </PageLikePanel>
    );
};

export default BlockchainTransactionPanel;

