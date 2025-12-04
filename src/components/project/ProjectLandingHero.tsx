import React from 'react';
import BlurText from '@/components/BlurText';
import { ProjectInfoProps } from './ProjectLink';
import { getIcon } from '@/components/icon';
import Tooltip from '@/components/custom-ui/Tooltip';
import Link from '@/components/custom-ui/Link';

interface ProjectLandingHeroProps {
  projectData: ProjectInfoProps;
  projectUri?: string; // Project issues URI
  githubUrl?: string; // GitHub repository URL
  blockchainExplorerUrl?: string; // Blockchain explorer address URL
  documentationUrl?: string; // Documentation link URL
}

const ProjectLandingHero: React.FC<ProjectLandingHeroProps> = ({
  projectData,
  projectUri,
  githubUrl,
  blockchainExplorerUrl,
  documentationUrl,
}) => {
  const { title, description } = projectData;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 px-4">
      {/* Project Title with Blur Text Animation */}
      <div className="w-full max-w-4xl">
        <BlurText
          text={title}
          className="text-6xl md:text-7xl lg:text-8xl font-bold text-slate-800 dark:text-slate-200 justify-center"
          animateBy="words"
          direction="top"
          delay={100}
        />
      </div>

      {/* Icons for Sunshines and Action Links */}
      <div className="flex items-center justify-center gap-6 flex-wrap">
        {/* Issues Link */}
        {projectUri && (
          <Link uri={projectUri} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20 hover:bg-white/20 dark:hover:bg-slate-900/20 transition-colors">
            <Tooltip content="Show project issues">
              <div className="flex items-center gap-2">
                {getIcon({ iconType: 'ara', className: 'w-5 h-5 text-blue-500' })}
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Issues</span>
              </div>
            </Tooltip>
          </Link>
        )}

        {/* GitHub Source Link */}
        {githubUrl && (
          <Link uri={githubUrl} asNewTab={true} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20 hover:bg-white/20 dark:hover:bg-slate-900/20 transition-colors">
            <Tooltip content="Source">
              <div className="flex items-center gap-2">
                {getIcon({ iconType: 'github', className: 'w-5 h-5 text-slate-700 dark:text-slate-300' })}
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Source</span>
              </div>
            </Tooltip>
          </Link>
        )}

        {/* Blockchain Explorer Link */}
        {blockchainExplorerUrl && (
          <Link uri={blockchainExplorerUrl} asNewTab={true} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20 hover:bg-white/20 dark:hover:bg-slate-900/20 transition-colors">
            <Tooltip content="Blockchain Explorer">
              <div className="flex items-center gap-2">
                {getIcon({ iconType: 'wallet', className: 'w-5 h-5 text-blue-500' })}
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Explorer</span>
              </div>
            </Tooltip>
          </Link>
        )}

        {/* Documentation Link */}
        {documentationUrl && (
          <Link uri={documentationUrl} asNewTab={true} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20 hover:bg-white/20 dark:hover:bg-slate-900/20 transition-colors">
            <Tooltip content="Documentation">
              <div className="flex items-center gap-2">
                {getIcon({ iconType: 'new-file', className: 'w-5 h-5 text-purple-500' })}
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Docs</span>
              </div>
            </Tooltip>
          </Link>
        )}
      </div>

      {/* Description as Subtitle */}
      {description && (
        <div className="w-full max-w-2xl">
          <p className="text-xl md:text-3xl text-slate-600 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectLandingHero;

