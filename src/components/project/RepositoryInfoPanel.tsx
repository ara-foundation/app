import React, { useState } from 'react';
import PageLikePanel from '@/components/panel/PageLikePanel';
import type { Project } from '@/types/project';
import type { Galaxy } from '@/types/galaxy';
import type { SBOM } from '@/types/sbom';

// Simple label-value display component
const LabelValue: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-1">
        <span className="text-slate-600 dark:text-slate-400 font-medium">{label}:</span>
        <span className="text-slate-800 dark:text-slate-200">{value}</span>
    </div>
);

interface RepositoryInfoPanelProps {
    project: Project;
    galaxy: Galaxy;
    sbom: SBOM | null;
}

const RepositoryInfoPanel: React.FC<RepositoryInfoPanelProps> = ({
    project,
    galaxy,
    sbom,
}) => {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['project', 'galaxy']));

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(section)) {
                next.delete(section);
            } else {
                next.add(section);
            }
            return next;
        });
    };

    const formatTimestamp = (timestamp?: number) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        return date.toLocaleString();
    };

    const formatRelativeTime = (timestamp?: number) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    return (
        <PageLikePanel
            className='mt-8 max-w-2xl mx-auto rounded-xl'
            icon="project"
            title="Repository Information"
            titleCenter={false}
            interactive={false}
        >
            {/* Project Information Section */}
            <div className="space-y-4">
                <button
                    onClick={() => toggleSection('project')}
                    className="w-full text-left flex items-center justify-between py-2 font-semibold text-slate-700 dark:text-slate-300"
                >
                    <span>Project Information</span>
                    <span>{expandedSections.has('project') ? '−' : '+'}</span>
                </button>
                {expandedSections.has('project') && (
                    <div className="space-y-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                        <LabelValue label="Created At" value={formatTimestamp(project.createdAt)} />
                        <LabelValue label="Last Commit ID" value={project.lastCommitId || 'N/A'} />
                        <LabelValue label="Last Commit Update" value={formatRelativeTime(project.lastCommitUpdateTime)} />
                        <LabelValue label="Branch Name" value={project.branchName || 'N/A'} />
                        <LabelValue label="Total Commits" value={project.totalCommits?.toString() || '0'} />
                        <LabelValue label="License" value={project.license || 'N/A'} />

                        {project.forkLines && project.forkLines.length > 0 && (
                            <div className="mt-3">
                                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Fork Lines</p>
                                {project.forkLines.map((forkLine, index) => (
                                    <div key={index} className="ml-4 mb-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                                        <LabelValue label="From" value={forkLine.from} />
                                        <LabelValue label="To" value={forkLine.to} />
                                        <LabelValue label="Via Issues" value={forkLine.via.length.toString()} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Galaxy Information Section */}
            <div className="space-y-4 mt-6">
                <button
                    onClick={() => toggleSection('galaxy')}
                    className="w-full text-left flex items-center justify-between py-2 font-semibold text-slate-700 dark:text-slate-300"
                >
                    <span>Galaxy Information</span>
                    <span>{expandedSections.has('galaxy') ? '−' : '+'}</span>
                </button>
                {expandedSections.has('galaxy') && (
                    <div className="space-y-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                        {galaxy.blockchainId && (
                            <LabelValue label="Blockchain ID" value={galaxy.blockchainId} />
                        )}
                        {galaxy.blockchainTx && (
                            <LabelValue label="Blockchain Transaction" value={galaxy.blockchainTx} />
                        )}
                    </div>
                )}
            </div>

            {/* SBOM Data Section */}
            {sbom && (
                <div className="space-y-4 mt-6">
                    <button
                        onClick={() => toggleSection('sbom')}
                        className="w-full text-left flex items-center justify-between py-2 font-semibold text-slate-700 dark:text-slate-300"
                    >
                        <span>SBOM Data</span>
                        <span>{expandedSections.has('sbom') ? '−' : '+'}</span>
                    </button>
                    {expandedSections.has('sbom') && (
                        <div className="space-y-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                            <LabelValue label="SBOM ID" value={sbom._id || 'N/A'} />
                            <LabelValue label="Provider" value={sbom.provider} />
                            <LabelValue label="Source" value={sbom.source} />
                            <LabelValue label="Completeness" value={sbom.completeness} />
                            <LabelValue label="Detected At" value={formatTimestamp(sbom.detectedAt)} />
                            <LabelValue label="Git URL" value={sbom.gitUrl} />
                            <LabelValue label="Dependencies Count" value={sbom.dependencies?.length?.toString() || '0'} />

                            {sbom.dependencies && sbom.dependencies.length > 0 && (
                                <div className="mt-3">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Dependencies ({sbom.dependencies.length})
                                    </p>
                                    <div className="max-h-60 overflow-y-auto space-y-1">
                                        {sbom.dependencies.slice(0, 20).map((dep: any, index: number) => (
                                            <div key={index} className="ml-4 p-2 bg-slate-50 dark:bg-slate-800/50 rounded text-xs">
                                                <div className="font-mono">
                                                    {dep.name || dep.purl || JSON.stringify(dep)}
                                                    {dep.version && <span className="text-slate-500">@{dep.version}</span>}
                                                </div>
                                            </div>
                                        ))}
                                        {sbom.dependencies.length > 20 && (
                                            <p className="text-xs text-slate-500 ml-4">
                                                ... and {sbom.dependencies.length - 20} more
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}


        </PageLikePanel>
    );
};

export default RepositoryInfoPanel;

