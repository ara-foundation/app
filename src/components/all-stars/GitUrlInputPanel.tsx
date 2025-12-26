import React from 'react';
import PageLikePanel from '@/components/panel/PageLikePanel';
import Input from '@/components/Input';

interface GitUrlInputPanelProps {
    gitUrl?: string;
    onGitUrlChange?: (gitUrl: string) => void;
    error?: string;
}

const GitUrlInputPanel: React.FC<GitUrlInputPanelProps> = ({
    gitUrl = '',
    onGitUrlChange,
    error
}) => {
    return (
        <PageLikePanel
            icon="new-file"
            titleCenter={true}
            title="Add Git Repository"
            interactive={false}
        >
            <div className="mb-4 px-1">
                <label htmlFor="git-url" className="block text-sm text-slate-700 dark:text-slate-300 mb-2">
                    Repository URL
                </label>
                <Input
                    id="git-url"
                    type="text"
                    value={gitUrl}
                    onChange={(e) => {
                        onGitUrlChange?.(e.target.value);
                    }}
                    placeholder="https://github.com/username/repository or git@github.com:username/repository.git"
                    className="w-full"
                />
                <p className="mt-2 text-md text-slate-600 dark:text-slate-400">
                    Accepts https, ssh git repo (usually ends with .git). Supports GitHub and GitLab only.
                </p>
                {error && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
            </div>
        </PageLikePanel>
    );
};

export default GitUrlInputPanel;

