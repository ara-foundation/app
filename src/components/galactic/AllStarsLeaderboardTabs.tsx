import React from 'react';
import Tabs from '@/components/Tabs';
import { getIcon } from '@/components/icon';
import Link from '@/components/custom-ui/Link';
import Tooltip from '@/components/custom-ui/Tooltip';
import NumberFlow from '@number-flow/react';
import { GalaxyData, LibraryData } from '@/data/mock-data';

interface AllStarsLeaderboardTabsProps {
    topGalaxies?: GalaxyData[];
    topLibraries?: LibraryData[];
}

const AllStarsLeaderboardTabs: React.FC<AllStarsLeaderboardTabsProps> = ({
    topGalaxies = [],
    topLibraries = [],
}) => {
    // Sort galaxies by stars for biggest, by sunshines for brightest
    const biggestGalaxies = [...topGalaxies].sort((a, b) => b.stars - a.stars);
    const brightestGalaxies = [...topGalaxies].sort((a, b) => b.sunshines - a.sunshines);

    const renderBiggestGalaxies = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-200/30 dark:border-slate-700/30">
                        <th className="text-left py-2 px-4 text-slate-600 dark:text-slate-400">#</th>
                        <th className="text-left py-2 px-4 text-slate-600 dark:text-slate-400">Galaxy Name</th>
                        <th className="text-right py-2 px-4 text-slate-600 dark:text-slate-400">Stars</th>
                    </tr>
                </thead>
                <tbody>
                    {biggestGalaxies.slice(0, 10).map((galaxy, index) => (
                        <tr key={galaxy.id} className="border-b border-slate-200/20 dark:border-slate-700/20 hover:bg-white/5 dark:hover:bg-slate-900/5">
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{index + 1}</td>
                            <td className="py-3 px-4">
                                <Tooltip content={`View '${galaxy.name}' galaxy`}>
                                    <Link uri={`/project?galaxy=${galaxy.id}`} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">
                                        {galaxy.name}
                                    </Link>
                                </Tooltip>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <NumberFlow
                                    value={galaxy.stars}
                                    locales="en-US"
                                    format={{ style: 'decimal', maximumFractionDigits: 2 }}
                                    className="text-slate-800 dark:text-slate-200"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderBrightestGalaxies = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-200/30 dark:border-slate-700/30">
                        <th className="text-left py-2 px-4 text-slate-600 dark:text-slate-400">#</th>
                        <th className="text-left py-2 px-4 text-slate-600 dark:text-slate-400">Galaxy Name</th>
                        <th className="text-right py-2 px-4 text-slate-600 dark:text-slate-400">Sunshines</th>
                        <th className="text-right py-2 px-4 text-slate-600 dark:text-slate-400">Donations</th>
                    </tr>
                </thead>
                <tbody>
                    {brightestGalaxies.slice(0, 10).map((galaxy, index) => (
                        <tr key={galaxy.id} className="border-b border-slate-200/20 dark:border-slate-700/20 hover:bg-white/5 dark:hover:bg-slate-900/5">
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{index + 1}</td>
                            <td className="py-3 px-4">
                                <Tooltip content={`View '${galaxy.name}' galaxy`}>
                                    <Link uri={`/project?galaxy=${galaxy.id}`} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">
                                        {galaxy.name}
                                    </Link>
                                </Tooltip>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <NumberFlow
                                    value={galaxy.sunshines}
                                    locales="en-US"
                                    format={{ style: 'decimal', maximumFractionDigits: 0 }}
                                    className="text-slate-800 dark:text-slate-200"
                                />
                            </td>
                            <td className="py-3 px-4 text-right">
                                <NumberFlow
                                    value={galaxy.donationAmount}
                                    locales="en-US"
                                    format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
                                    className="text-lg font-semibold text-green-600 dark:text-green-400"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderTopLibraries = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-200/30 dark:border-slate-700/30">
                        <th className="text-left py-2 px-4 text-slate-600 dark:text-slate-400">#</th>
                        <th className="text-left py-2 px-4 text-slate-600 dark:text-slate-400">Library Name</th>
                        <th className="text-right py-2 px-4 text-slate-600 dark:text-slate-400">Depends on</th>
                    </tr>
                </thead>
                <tbody>
                    {topLibraries.slice(0, 10).map((library, index) => (
                        <tr key={library.id} className="border-b border-slate-200/20 dark:border-slate-700/20 hover:bg-white/5 dark:hover:bg-slate-900/5">
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{index + 1}</td>
                            <td className="py-3 px-4">
                                <Tooltip content={`View '${library.name}' galaxy`}>
                                    <Link uri={`/all-stars?galaxy=${library.id}`} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">
                                        {library.name}
                                    </Link>
                                </Tooltip>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                    <NumberFlow
                                        value={library.dependsOn}
                                        locales="en-US"
                                        format={{ style: 'decimal', maximumFractionDigits: 0 }}
                                        className="text-slate-800 dark:text-slate-200"
                                    />
                                    <Tooltip content={`Number of projects using this library`}>
                                        {getIcon({ iconType: 'info', className: 'w-4 h-4 text-slate-500' })}
                                    </Tooltip>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="fixed bottom-40 left-8 z-40 w-96 max-h-96">
            <div className="backdrop-blur-lg bg-white/5 dark:bg-slate-900/5 border border-slate-300/20 dark:border-slate-600/20 rounded-lg p-4">
                <Tabs
                    id="all-stars-leaderboard-tabs"
                    activeTab="biggest"
                    tabs={[
                        {
                            key: 'biggest',
                            label: 'Top Biggest Galaxies',
                            content: (
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                                        Galaxies (Open source projects) with the highest amount of the stars
                                    </p>
                                    {renderBiggestGalaxies()}
                                </div>
                            ),
                            className: '',
                        },
                        {
                            key: 'brightest',
                            label: 'Top Brightest Galaxies',
                            content: (
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                                        Galaxies that produce most sunshines (donations)
                                    </p>
                                    {renderBrightestGalaxies()}
                                </div>
                            ),
                            className: '',
                        },
                        {
                            key: 'libraries',
                            label: 'Top Libraries',
                            content: (
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                                        the most used libraries by projects
                                    </p>
                                    {renderTopLibraries()}
                                </div>
                            ),
                            className: '',
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default AllStarsLeaderboardTabs;

