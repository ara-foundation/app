import React, { useState, useEffect, useRef } from 'react';
import BasePanel from '@/components/panel/Panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/animate-ui/components/radix/accordion';
import { getIcon } from '@/components/icon';
import Link from '@/components/custom-ui/Link';
import Tooltip from '@/components/custom-ui/Tooltip';
import NumberFlow from '@number-flow/react';
import type { Galaxy } from '@/types/galaxy';
import { BorderSize } from '@/types/eventTypes';
import { cn } from '@/lib/utils';

interface AllStarsLeaderboardPanelsProps {
    topGalaxies?: Galaxy[];
}

const AllStarsLeaderboardPanels: React.FC<AllStarsLeaderboardPanelsProps> = ({
    topGalaxies = [],
}) => {
    const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sort galaxies by stars for biggest, by sunshines for brightest
    const biggestGalaxies = [...topGalaxies].sort((a, b) => b.stars - a.stars);
    const brightestGalaxies = [...topGalaxies].sort((a, b) => b.sunshines - a.sunshines);

    // Handle click outside to collapse all panels
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setExpandedPanel(null);
            }
        };

        if (expandedPanel) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [expandedPanel]);

    const renderBiggestGalaxies = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-200/30 dark:border-slate-700/30">
                        <th className="text-left py-2 px-4 text-slate-600 dark:text-slate-400">#</th>
                        <th className="text-left py-2 px-4 text-slate-600 dark:text-slate-400">Project Name</th>
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

    // const renderTopLibraries = () => (
    //     <div className="overflow-x-auto">
    //         <table className="w-full text-sm">
    //             <thead>
    //                 <tr className="border-b border-slate-200/30 dark:border-slate-700/30">
    //                     <th className="text-left py-2 px-4 text-slate-600 dark:text-slate-400">#</th>
    //                     <th className="text-left py-2 px-4 text-slate-600 dark:text-slate-400">Library Name</th>
    //                     <th className="text-right py-2 px-4 text-slate-600 dark:text-slate-400">Depends on</th>
    //                 </tr>
    //             </thead>
    //             <tbody>
    //                 {topLibraries.slice(0, 10).map((library, index) => (
    //                     <tr key={library.id} className="border-b border-slate-200/20 dark:border-slate-700/20 hover:bg-white/5 dark:hover:bg-slate-900/5">
    //                         <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{index + 1}</td>
    //                         <td className="py-3 px-4">
    //                             <Tooltip content={`View '${library.name}' galaxy`}>
    //                                 <Link uri={`/all-stars?galaxy=${library.id}`} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">
    //                                     {library.name}
    //                                 </Link>
    //                             </Tooltip>
    //                         </td>
    //                         <td className="py-3 px-4 text-right">
    //                             <div className="flex items-center justify-end gap-1">
    //                                 <NumberFlow
    //                                     value={library.dependsOn}
    //                                     locales="en-US"
    //                                     format={{ style: 'decimal', maximumFractionDigits: 0 }}
    //                                     className="text-slate-800 dark:text-slate-200"
    //                                 />
    //                                 <Tooltip content={`Number of projects using this library`}>
    //                                     {getIcon({ iconType: 'info', className: 'w-4 h-4 text-slate-500' })}
    //                                 </Tooltip>
    //                             </div>
    //                         </td>
    //                     </tr>
    //                 ))}
    //             </tbody>
    //         </table>
    //     </div>
    // );

    const borderColor = 'border-slate-200 dark:border-slate-700/10';
    const blurredBorder = 'border-blur-xs';
    const textColor = 'text-gray-600 dark:text-gray-500';
    const titleColor = 'text-slate-600 dark:text-slate-400';
    const transparentBg = `bg-white/30 dark:bg-slate-900/30 backdrop-blur-lg border-none ${textColor}`;

    return (
        <div ref={containerRef} className="fixed bottom-40 left-8 z-40 w-96 space-y-3">
            <BasePanel
                border={{ size: BorderSize.border1, color: `${borderColor} ${blurredBorder}`, className: 'filter' }}
                bg="bg-transparent"
                className={cn('shadow-none', transparentBg, 'border border-slate-300/20 dark:border-slate-600/20 hover:bg-blue-500/10 hover:border-blue-500 dark:hover:bg-blue-500/20')}
            >
                <Accordion
                    value={expandedPanel === 'biggest' ? 'biggest' : undefined}
                    onValueChange={(value) => setExpandedPanel(value === 'biggest' ? 'biggest' as string : null)}
                    type='single'
                    collapsible={true}

                >
                    <AccordionItem value="biggest" className="w-88">
                        <AccordionTrigger className="flex items-center justify-between h-auto no-underline! p-0">
                            <div className="font-georgia font-semibold text-base flex items-center gap-2">
                                {getIcon({ iconType: 'star', fill: 'currentColor', className: titleColor })}
                                <span>Top Biggest</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="AccordionContent mt-4">
                            <div className="font-noto-sans">
                                <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                                    Galaxies (Open source projects) with the highest amount of the stars
                                </p>
                                {renderBiggestGalaxies()}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </BasePanel>

            <BasePanel
                border={{ size: BorderSize.border1, color: `${borderColor} ${blurredBorder}`, className: 'filter' }}
                bg="bg-transparent"
                className={cn('shadow-none', transparentBg, 'border border-slate-300/20 dark:border-slate-600/20 hover:bg-blue-500/10 hover:border-blue-500 dark:hover:bg-blue-500/20')}
            >
                <Accordion
                    value={expandedPanel === 'brightest' ? 'brightest' : undefined}
                    onValueChange={(value) => setExpandedPanel(value === 'brightest' ? 'brightest' as string : null)}
                    type='single'
                    collapsible={true}
                >
                    <AccordionItem value="brightest" className="w-88">
                        <AccordionTrigger className="flex items-center justify-between h-auto no-underline! p-0">
                            <div className="font-georgia font-semibold text-base flex items-center gap-2">
                                {getIcon({ iconType: 'sunshine', fill: 'currentColor', className: titleColor })}
                                <span>Top Brightest</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="AccordionContent mt-4">
                            <div className="font-noto-sans">
                                <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                                    Galaxies that produce most sunshines (donations)
                                </p>
                                {renderBrightestGalaxies()}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </BasePanel>

            {/* <BasePanel
                border={{ size: BorderSize.border1, color: `${borderColor} ${blurredBorder}`, className: 'filter' }}
                bg="bg-transparent"
                className={cn('shadow-none', transparentBg, 'border border-slate-300/20 dark:border-slate-600/20 hover:bg-blue-500/10 hover:border-blue-500 dark:hover:bg-blue-500/20')}
            >
                <Accordion
                    value={expandedPanel === 'libraries' ? 'libraries' : undefined}
                    onValueChange={(value) => setExpandedPanel(value === 'libraries' ? 'libraries' as string : null)}
                    type='single'
                    collapsible={true}
                >
                    <AccordionItem value="libraries" className="w-88">
                        <AccordionTrigger className="flex items-center justify-between h-auto no-underline! p-0">
                            <div className="font-georgia font-semibold text-base flex items-center gap-2">
                                {getIcon({ iconType: 'project', fill: 'currentColor', className: titleColor })}
                                <span>Top Libraries</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="AccordionContent mt-4">
                            <div className="font-noto-sans">
                                <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                                    the most used libraries by projects
                                </p>
                                {renderTopLibraries()}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </BasePanel> */}
        </div>
    );
};

export default AllStarsLeaderboardPanels;

