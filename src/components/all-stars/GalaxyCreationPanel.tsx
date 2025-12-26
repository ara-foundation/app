import React, { useEffect, useState } from 'react';
import PageLikePanel from '@/components/panel/PageLikePanel';
import ProgressStep from '@/components/ProgressStep';
import { createGalaxyFromGit } from '@/client-side/galaxy';
import { Galaxy } from '@/types/galaxy';
import { RepositoryAnalysis } from '@/types/git-repository';

interface GalaxyCreationPanelProps {
    repositoryData: RepositoryAnalysis | null;
    readmeContent: string | null;
    onComplete: (data: Galaxy) => void;
    onError: (error: string) => void;
}

const GalaxyCreationPanel: React.FC<GalaxyCreationPanelProps> = ({
    repositoryData,
    readmeContent,
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
            title: 'Creating galaxy',
            description: 'Initializing galaxy creation...',
            status: 'in-progress',
            progress: 0,
        },
        {
            id: 2,
            title: 'AI analyzing name, description and tags',
            description: 'Generating galaxy metadata with AI...',
            status: 'pending',
            progress: 0,
        },
        {
            id: 3,
            title: 'Creating database record',
            description: 'Saving galaxy to database...',
            status: 'pending',
            progress: 0,
        },
        {
            id: 4,
            title: 'Created',
            description: 'Galaxy creation complete',
            status: 'pending',
            progress: 0,
        },
    ]);

    useEffect(() => {
        const createGalaxy = async (): Promise<Galaxy | undefined> => {
            // Helper function to animate progress
            const animateStepProgress = (
                stepId: number,
                targetProgress: number,
                delay: number,
                description: string,
                status: 'in-progress' | 'completed' = 'in-progress'
            ) => {
                return new Promise<void>((resolve) => {
                    setTimeout(() => {
                        updateStep(stepId, status, targetProgress, description);
                        resolve();
                    }, delay);
                });
            };

            // Generate random delays for each step (between 300ms and 2000ms)
            const randomDelay = (min: number, max: number) =>
                Math.floor(Math.random() * (max - min + 1)) + min;

            const step1Delay = randomDelay(300, 2400);
            const step3Delay = randomDelay(400, 3000);
            const step4Delay = randomDelay(500, 3600);
            const step2Delay = randomDelay(600, 3000);

            // Initialize all steps as in-progress
            updateStep(1, 'in-progress', 0, 'Preparing galaxy data...');
            updateStep(2, 'in-progress', 0, 'AI analyzing project...');
            updateStep(3, 'in-progress', 0, 'Saving to database...');
            updateStep(4, 'in-progress', 0, 'Finalizing...');

            // Start steps 1, 3, and 4 concurrently
            const step1Promise = animateStepProgress(
                1,
                100,
                step1Delay,
                'Galaxy data prepared',
                'completed'
            );

            // Step 2: Go to 99% first, then wait for API result
            const step2Promise = animateStepProgress(
                2,
                99,
                step2Delay,
                'AI analyzing project...',
                'in-progress'
            );

            const step3Promise = animateStepProgress(
                3,
                100,
                step3Delay,
                'Database record created',
                'completed'
            );

            const step4Promise = animateStepProgress(
                4,
                100,
                step4Delay,
                'Galaxy created successfully',
                'completed'
            );

            // Start API call concurrently
            const apiPromise = createGalaxyFromGit(repositoryData!, readmeContent!);

            // Wait for step 2 to reach 99% and API to complete
            const [result] = await Promise.all([apiPromise, step2Promise]);

            if (!result.success) {
                onError(result.error || 'Failed to create galaxy');
                return undefined;
            }

            // Complete step 2 after API result
            updateStep(2, 'completed', 100, 'AI analysis complete');

            // Wait for other steps to complete (if they haven't already)
            await Promise.all([step1Promise, step3Promise, step4Promise]);

            // Small delay before completing
            await new Promise(resolve => setTimeout(resolve, 250));
            return result.data;
        };

        createGalaxy().then((result) => {
            if (result) {
                onComplete(result);
            } else {
                onError('Failed to create galaxy');
            }
        }).catch((error) => {
            onError(error instanceof Error ? error.message : 'An error occurred');
        });
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
                    <span>Creating Galaxy</span>
                </div>
            }
            interactive={false}
        >
            <p className="text-slate-600 dark:text-slate-400 mb-4">
                Creating your galaxy with AI-powered analysis. This may take a moment.
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

export default GalaxyCreationPanel;

