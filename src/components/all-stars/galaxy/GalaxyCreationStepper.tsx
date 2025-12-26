import React, { useState, useEffect, use } from 'react';
import Stepper from '../../Stepper';
import GitUrlInputPanel from '@/components/all-stars/GitUrlInputPanel';
import RepositoryAnalysisPanel from '@/components/all-stars/RepositoryAnalysisPanel';
import GalaxyCreationPanel from '@/components/all-stars/GalaxyCreationPanel';
import GalaxyAgreementDialog from '@/components/all-stars/GalaxyAgreementDialog';
import BlockchainTransactionPanel from '@/components/all-stars/BlockchainTransactionPanel';
import { fetchReadmeContent, validateGitUrl } from '@/lib/git-repository';
import { Galaxy } from '@/types/galaxy';
import { RepositoryAnalysis } from '@/types/git-repository';
import GalaxyPlacementPanel from '../GalaxyPlacementPanel';
import PageLikePanel from '@/components/panel/PageLikePanel';

interface AddingStepperProps {
    onCancel: () => void;
    onComplete: () => void;
}

const GalaxyCreationStepper: React.FC<AddingStepperProps> = ({ onCancel, onComplete }) => {
    const [step1GitUrl, setStep1GitUrl] = useState<string>(''); // Step 1 git URL input
    const [step1Error, setStep1Error] = useState<string>(''); // Step 1 validation error
    const [gitUrl, setGitUrl] = useState(''); // Validated git URL used for analysis
    const [repositoryData, setRepositoryData] = useState<RepositoryAnalysis | null>(null);
    const [galaxyData, setGalaxyData] = useState<Galaxy | null>(null);
    const [readmeContent, setReadmeContent] = useState<string | null>(null);
    const [autoAdvanceStep, setAutoAdvanceStep] = useState<number | null>(null);
    const [agreementAccepted, setAgreementAccepted] = useState<boolean>(false);
    const [galaxyPlaced, setGalaxyPlaced] = useState<boolean>(false);

    // Auto-advance step when triggered
    useEffect(() => {
        if (autoAdvanceStep !== null) {
            const timer = setTimeout(() => {
                // Find and click the Next button
                const nextButton = document.querySelector('button[class*="bg-green-500"], button[class*="bg-indigo"]') as HTMLButtonElement;
                if (nextButton && !nextButton.disabled) {
                    nextButton.click();
                }
                setAutoAdvanceStep(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [autoAdvanceStep]);

    // Handle step 1 git URL change
    const handleStep1GitUrlChange = (url: string) => {
        setStep1GitUrl(url);
        setStep1Error(''); // Clear error when user types
    };

    const handleAnalysisComplete = (data: any) => {
        setRepositoryData(data);
        // Try to fetch README content
        fetchReadmeContent(data).then((content) => {
            setReadmeContent(content !== null ? content : '');
            console.log(`Set the repository data`, repositoryData, readmeContent)
            setAutoAdvanceStep(2);
        }).catch((error) => {
            alert(error);
            handleCancel();
        });
    };

    const handleGalaxyCreationComplete = (data: any) => {
        setGalaxyData(data);
        // Trigger auto-advance
        setAutoAdvanceStep(3);
    };

    const handleBlockchainComplete = () => {
        // Trigger auto-advance
        setAutoAdvanceStep(5);
    };

    const handlePlacement = () => {
        setGalaxyPlaced(true);
        // Trigger auto-advance
        setAutoAdvanceStep(6);
    };

    // Validate before allowing step navigation
    const handleBeforeStepChange = (currentStepNum: number, nextStepNum: number): boolean => {
        // If trying to advance from step 1, validate git URL first
        if (currentStepNum === 1 && nextStepNum === 2) {
            const error = validateGitUrl(step1GitUrl);
            if (error) {
                setStep1Error(error);
                return false; // Prevent navigation
            } else {
                // Valid - set the gitUrl for analysis
                setGitUrl(step1GitUrl.trim());
            }
        } else
            // If trying to advance from step 4 (agreement), auto-accept when proceeding
            if (currentStepNum === 4 && nextStepNum === 5) {
                if (!agreementAccepted) {
                    // User clicked Next - implicitly accepting the agreement
                    setAgreementAccepted(true);
                }
            } else
                // If trying to advance from step 6 (placement), check if placed
                if (currentStepNum === 6 && nextStepNum === 7) {
                    if (!galaxyPlaced) {
                        // Trigger placement
                        handlePlacement();
                        return false; // Prevent navigation, placement will auto-advance
                    }
                }
        return true; // Allow navigation
    };

    const handleCancel = () => {
        setStep1GitUrl('');
        setStep1Error('');
        setGitUrl('');
        setRepositoryData(null);
        setGalaxyData(null);
        setReadmeContent('');
        setAgreementAccepted(false);
        setGalaxyPlaced(false);
        onCancel();
    };

    const handleStepperComplete = () => {
        // Reset after completion
        setTimeout(() => {
            setStep1GitUrl('');
            setStep1Error('');
            setGitUrl('');
            setRepositoryData(null);
            setGalaxyData(null);
            setReadmeContent('');
            setAgreementAccepted(false);
            setGalaxyPlaced(false);
            onComplete();
        }, 3000);
    };

    return (
        <Stepper
            initialStep={1}
            onBeforeStepChange={handleBeforeStepChange}
            disableStepIndicators={true}
            onFinalStepCompleted={handleStepperComplete}
            backButtonText="Previous"
            nextButtonText="Next"
            stepCircleContainerClassName="shadow-none border-none bg-transparent"
            className="justify-start w-full rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md"
            stepContainerClassName="px-1 pt-1"
            contentClassName="p-0 w-full"
        >
            {/* Step 1: Git URL Input */}
            <GitUrlInputPanel
                gitUrl={step1GitUrl}
                onGitUrlChange={handleStep1GitUrlChange}
                error={step1Error}
            />

            {/* Step 2: Repository Analysis (auto-advances) */}
            <div>
                <RepositoryAnalysisPanel
                    gitUrl={gitUrl}
                    onComplete={handleAnalysisComplete}
                    onError={(error) => {
                        alert(error);
                        handleCancel();
                    }}
                />
            </div>

            {/* Step 3: Galaxy Creation (auto-advances) */}
            <div>
                <GalaxyCreationPanel
                    repositoryData={repositoryData}
                    readmeContent={readmeContent || ''}
                    onComplete={handleGalaxyCreationComplete}
                    onError={(error) => {
                        alert(error);
                        handleCancel();
                    }}
                />
            </div>

            {/* Step 4: Agreement Dialog */}
            <GalaxyAgreementDialog
                galaxyName={galaxyData?.name || 'Galaxy'}
            />

            {/* Step 5: Blockchain Transaction (auto-advances) */}
            <div>
                <BlockchainTransactionPanel
                    galaxyId={galaxyData?._id || ''}
                    onComplete={handleBlockchainComplete}
                    onError={(error) => {
                        alert(error);
                        handleCancel();
                    }}
                />
            </div>

            {/* Step 6: Placement */}
            <GalaxyPlacementPanel galaxyName={galaxyData?.name || 'Galaxy'} isPlaced={galaxyPlaced} />

            {/* Step 7: Complete */}
            <PageLikePanel
                icon="check"
                titleCenter={true}
                title="Galaxy Created Successfully!"
                interactive={false}
            >
                <p className="text-center text-slate-600 dark:text-slate-400">
                    Your galaxy has been created and placed on the Cosmic map.
                </p>
            </PageLikePanel>
        </Stepper>
    );
};

export default GalaxyCreationStepper;

