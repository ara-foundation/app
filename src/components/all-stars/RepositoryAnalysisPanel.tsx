import React, { useEffect, useState } from 'react';
import PageLikePanel from '@/components/panel/PageLikePanel';
import ProgressStep from '@/components/ProgressStep';
import { analyzeGitRepository } from '@/client-side/galaxy';
import { RepositoryAnalysis } from '@/types/git-repository';

interface RepositoryAnalysisPanelProps {
    gitUrl: string;
    onComplete: (data: RepositoryAnalysis) => void;
    onError: (error: string) => void;
}

const RepositoryAnalysisPanel: React.FC<RepositoryAnalysisPanelProps> = ({
    gitUrl,
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
            title: 'Analyzing metadata',
            description: 'Fetching repository information...',
            status: 'in-progress',
            progress: 0,
        },
        {
            id: 2,
            title: 'Discovering Social Links',
            description: 'Discovering project social links...',
            status: 'pending',
            progress: 0,
        },
        {
            id: 3,
            title: 'Detecting license',
            description: 'Analyzing license information...',
            status: 'pending',
            progress: 0,
        },
        {
            id: 4,
            title: 'Detecting dependency tree using SBOM',
            description: 'Building dependency graph...',
            status: 'pending',
            progress: 0,
        },
    ]);

    useEffect(() => {
        const analyzeRepository = async (): Promise<RepositoryAnalysis | undefined> => {
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

            // Generate random delays for each step (between 300ms and 1500ms)
            const randomDelay = (min: number, max: number) =>
                Math.floor(Math.random() * (max - min + 1)) + min;

            const step1Delay = randomDelay(300, 1600);
            const step2Delay = randomDelay(400, 2000);
            const step3Delay = randomDelay(500, 2400);
            const step4Delay = randomDelay(600, 2000);

            // Initialize all steps as in-progress
            updateStep(1, 'in-progress', 0, 'Fetching repository metadata...');
            updateStep(2, 'in-progress', 0, 'Discovering project links...');
            updateStep(3, 'in-progress', 0, 'Analyzing license...');
            updateStep(4, 'in-progress', 0, 'Building dependency tree...');

            // Start all steps concurrently
            const step1Promise = animateStepProgress(
                1,
                100,
                step1Delay,
                'Repository metadata retrieved',
                'completed'
            );

            const step2Promise = animateStepProgress(
                2,
                100,
                step2Delay,
                'Project links discovered',
                'completed'
            );

            const step3Promise = animateStepProgress(
                3,
                100,
                step3Delay,
                'Analyzing license...',
                'completed'
            );

            // Step 4: Go to 99% first, then wait for API result
            const step4Promise = animateStepProgress(
                4,
                99,
                step4Delay,
                'Building dependency tree...',
                'in-progress'
            );

            // Start API call concurrently
            const apiPromise = analyzeGitRepository(gitUrl);

            // Wait for step 4 to reach 99% and API to complete
            const [result] = await Promise.all([apiPromise, step4Promise]);

            if (!result.success) {
                onError(result.error || 'Failed to analyze repository');
                return;
            }

            // Update step 3 with license info if available
            if (result.data?.license) {
                updateStep(3, 'completed', 100, `License detected: ${result.data.license.license || result.data.license}`);
            }

            // Complete step 4 after API result
            updateStep(4, 'completed', 100, 'Dependency analysis complete');

            // Wait for other steps to complete (if they haven't already)
            await Promise.all([step1Promise, step2Promise, step3Promise]);

            // Small delay before completing
            await new Promise(resolve => setTimeout(resolve, 250));
            return result.data;
        };

        analyzeRepository().then((result) => {
            if (result) {
                onComplete(result);
            } else {
                onError('Failed to analyze repository');
            }
        }).catch((error) => {
            console.error('Error analyzing repository:', error);
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
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Analyzing Repository</span>
                </div>
            }
            interactive={false}
        >
            <p className="text-slate-600 dark:text-slate-400 mb-4">
                We're analyzing your Git repository and gathering information. This process may take a few moments.
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

export default RepositoryAnalysisPanel;

