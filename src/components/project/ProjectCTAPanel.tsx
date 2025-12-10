import React, { useState, useEffect, useMemo } from 'react';
import Badge from '@/components/badge/Badge';
import { getDemo, changeRole, getDemoStep, obtainSunshines } from '@/client-side/demo';
import ObtainSunshinesDialog from './ObtainSunshinesDialog';
import ProjectCTAStepPanel from './ProjectCTAStepPanel';
import NumberFlow from '@number-flow/react';

interface ProjectCTAPanelProps {
  galaxyId: string;
  projectName: string;
}

const ProjectCTAPanel: React.FC<ProjectCTAPanelProps> = ({ galaxyId, projectName }) => {
  const [demoStep, setDemoStep] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStep, setIsLoadingStep] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogData, setDialogData] = useState<{
    sunshines: number;
    totalSunshines: number;
    galaxyId: string;
    projectName: string;
    uri: string;
  } | null>(null);

  const tooltipContent = (
    <div className="text-sm max-w-xs">
      <p>- Obtain sunshines, collaborate with maintainer on project issues. <br />
        - Turn sunshines to stars.<br />
        - Grow stars and turn it into a community owned project.<br />
        - The project will be owned by the community when it reaches 100 stars.</p>
    </div>
  );

  // Fetch demo step on mount
  useEffect(() => {
    const fetchDemoStep = async () => {
      const demo = getDemo();
      if (demo.email) {
        try {
          const step = await getDemoStep(demo.email);
          if (step !== null) {
            setDemoStep(step);
          }
        } catch (error) {
          console.error('Error fetching demo step:', error);
        } finally {
          setIsLoadingStep(false);
        }
      } else {
        setIsLoadingStep(false);
      }
    };

    fetchDemoStep();
  }, []);

  const handleObtainSunshines = async () => {
    setIsLoading(true);
    try {
      const demo = getDemo();
      if (!demo.email || !demo.users) {
        console.error('Demo not found');
        setIsLoading(false);
        return;
      }

      // Check and change role to 'user' if needed
      if (demo.role !== 'user') {
        changeRole('user');
      }

      // Get current user (user role or first user)
      const currentUser = demo.users.find(u => u.role === 'user') || demo.users[0];
      if (!currentUser || !currentUser._id) {
        console.error('User not found');
        setIsLoading(false);
        return;
      }

      // Get galaxy ID
      const uri = `/project/issues?galaxy=${galaxyId}`;

      // Call obtain sunshines action
      const result = await obtainSunshines({
        galaxyId,
        userId: currentUser._id.toString(),
        email: demo.email,
      });

      if (result.success && result) {
        setDialogData({
          sunshines: result.sunshines || 0,
          totalSunshines: result.totalSunshines || 0,
          galaxyId,
          projectName,
          uri,
        });
        setShowDialog(true);
        // Update step in local state
        setDemoStep(1);
      } else {
        const error = result.error || 'Failed to obtain sunshines';
        console.error('Failed to obtain sunshines:', error);
        alert(error);
      }
    } catch (error) {
      console.error('Error obtaining sunshines:', error);
      alert('An error occurred while obtaining sunshines');
    } finally {
      setIsLoading(false);
    }
  };

  // Define steps content (after handleObtainSunshines is defined)
  const stepsContent = useMemo(() => [
    {
      // Step 0: Obtain Sunshines
      title: 'Join this open source project',
      tooltipContent,
      hintText: (
        <>
          <Badge>demo</Badge> donating
          <NumberFlow value={50} locales="en-US" format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 2 }} /> to '{projectName}' maintainer.
        </>
      ),
      buttonText: 'Obtain Sunshines',
      buttonLoadingText: 'Processing...',
      onClick: handleObtainSunshines,
    },
    {
      // Step 1: Create Issue
      title: 'Create an issue',
      tooltipContent: (
        <div className="text-sm max-w-xs">
          <p>Create an issue to collaborate with the maintainer on the project.</p>
        </div>
      ),
      hintText: (
        <>
          <Badge>demo</Badge> Create an issue for '{projectName}' project.
        </>
      ),
      buttonText: 'Go to Issues',
      buttonLoadingText: 'Loading...',
      uri: `/project/issues?galaxy=${galaxyId}`,
    },
    {
      // Step 2: Assign Contributor
      title: 'Assign a contributor',
      tooltipContent: (
        <div className="text-sm max-w-xs">
          <p>Assign a contributor to work on the issue you created.</p>
        </div>
      ),
      hintText: (
        <>
          <Badge>demo</Badge> Assign a contributor to work on '{projectName}' issues.
        </>
      ),
      buttonText: 'Go to Issues',
      buttonLoadingText: 'Loading...',
      uri: `/project/issues?galaxy=${galaxyId}`,
    },
    {
      // Step 3: Move to Roadmap
      title: 'Move issue to roadmap',
      tooltipContent: (
        <div className="text-sm max-w-xs">
          <p>Move the assigned issue to the project roadmap.</p>
        </div>
      ),
      hintText: (
        <>
          <Badge>demo</Badge> Move issue to '{projectName}' roadmap.
        </>
      ),
      buttonText: 'Go to Roadmap',
      buttonLoadingText: 'Loading...',
      uri: `/project/roadmap?galaxy=${galaxyId}`,
    },
    {
      // Step 4: Create Patch
      title: 'Create a patch',
      tooltipContent: (
        <div className="text-sm max-w-xs">
          <p>Create a patch for the issue in the roadmap.</p>
        </div>
      ),
      hintText: (
        <>
          <Badge>demo</Badge> Create a patch for '{projectName}' issue.
        </>
      ),
      buttonText: 'Go to Roadmap',
      buttonLoadingText: 'Loading...',
      uri: `/project/roadmap?galaxy=${galaxyId}`,
    },
    {
      // Step 5: Mark Version Complete
      title: 'Resolve issues and complete the version',
      tooltipContent: (
        <div className="text-sm max-w-xs">
          <p>Mark the version as complete after the patch is ready.</p>
        </div>
      ),
      hintText: (
        <>
          <Badge>demo</Badge> Mark '{projectName}' version as complete.
        </>
      ),
      buttonText: 'Go to Roadmap',
      buttonLoadingText: 'Loading...',
      uri: `/project/roadmap?galaxy=${galaxyId}`,
    },
    {
      // Step 6: Test Completed
      title: 'Test the completed version',
      tooltipContent: (
        <div className="text-sm max-w-xs">
          <p>Test the completed version of the project.</p>
        </div>
      ),
      hintText: (
        <>
          <Badge>demo</Badge> Test the completed '{projectName}' version.
        </>
      ),
      buttonText: 'Go to Roadmap',
      buttonLoadingText: 'Loading...',
      uri: `/project/roadmap?galaxy=${galaxyId}`,
    },
    {
      // Step 7-9: Place Star in Galaxy
      title: 'Place your star in the galaxy',
      tooltipContent: (
        <div className="text-sm max-w-xs">
          <p>Place your star in the galaxy to show your contribution.</p>
        </div>
      ),
      hintText: (
        <>
          <Badge>demo</Badge> Place your star in the '{projectName}' galaxy.
        </>
      ),
      buttonText: 'Place Star',
      buttonLoadingText: 'Loading...',
      uri: `/project?galaxy=${galaxyId}&place=true`,
    },
  ], [galaxyId, projectName, tooltipContent, handleObtainSunshines]);

  // Get current step content (default to step 0 if undefined)
  const currentStep = demoStep !== undefined ? demoStep : 0;
  const stepContent = stepsContent[Math.min(currentStep, stepsContent.length - 1)];

  // Don't render if still loading step
  if (isLoadingStep) {
    return (
      <div className="w-full max-w-md mx-auto mt-1 p-6 text-center">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {stepContent && (
        <ProjectCTAStepPanel
          title={stepContent.title}
          tooltipContent={stepContent.tooltipContent}
          hintText={stepContent.hintText}
          buttonText={stepContent.buttonText}
          buttonLoadingText={stepContent.buttonLoadingText}
          onClick={stepContent.onClick}
          uri={stepContent.uri}
          isLoading={isLoading && currentStep === 0}
          disabled={isLoading}
        />
      )}

      {/* Success Dialog */}
      {showDialog && dialogData && (
        <ObtainSunshinesDialog
          isOpen={showDialog}
          sunshines={dialogData.sunshines}
          totalSunshines={dialogData.totalSunshines}
          galaxyId={dialogData.galaxyId}
          projectName={dialogData.projectName}
          uri={dialogData.uri}
          onClose={() => setShowDialog(false)}
        />
      )}
    </>
  );
};

export default ProjectCTAPanel;
