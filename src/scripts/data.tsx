import { motion } from "framer-motion";
import { getIcon } from "@/components/icon";

export enum Accent {
    monetizationPrimaryAccent = "monetizationPrimaryAccent",
    formalResponsibleCollaborationAccent = "formalResponsibleCollaborationAccent",
    questSystemAccent = "questSystemAccent",
    timeSavedProjectManagementAccent = "timeSavedProjectManagementAccent",
    // visionaryAccent = "visionaryAccent",
}

export const data: Record<Accent, {
    icon: string;
    title: string;
    subtitle: string;
    description: string;
    howTo?: React.ReactNode;
}> = {
    [Accent.monetizationPrimaryAccent]: {
        icon: 'money',
        title: "Get help with branding and monetization",
        subtitle: "Turning open-source development into a recognized, collaborative, and financially sustainable pursuit.",
        description: "For maintainers, helping with PRs and monetization.",
        howTo: <div>Ara is a collaboration platform with the standardized work cycle.<br />
            <br />Here, the achivements are awarded for the resolved issues and patches to all participants. We represent them as project coins.<br /><br />These coins highlight everyone's contribution, boosts project trust, user engagement, and acts as proof of traction.</div>,
    },
    [Accent.formalResponsibleCollaborationAccent]: {
        icon: 'project',
        title: "Collaborate in standardized work cycle",
        subtitle: "Formal definition, and requirements for issues, and adapted century old practice for responsible collaboration. Inspired by government/private contractlike work cycles.",
        description: "Formal definition, and requirements for issues, and adapted century old practice for responsible collaboration. Inspired by government/private contractlike work cycles.",
        howTo: <motion.ul className="space-y-3">
            <motion.li className="flex items-start gap-3 ml-4">
                <span className="mt-1 flex-shrink-0">
                    {getIcon({ iconType: 'project', className: 'w-5 h-5 text-blue-500' })}
                </span>
                <span>Turn your open-source projects into structured, accountable collaborations:</span>
            </motion.li>
            <motion.li className="flex items-start gap-3 ml-4">
                <span className="mt-1 flex-shrink-0">
                    {getIcon({ iconType: 'issue', className: 'w-5 h-5 text-purple-500' })}
                </span>
                <span>Users open issues, contributors submit patches, and maintainers review and release them.</span>
            </motion.li>
            <motion.li className="flex items-start gap-3 ml-4">
                <span className="mt-1 flex-shrink-0">
                    {getIcon({ iconType: 'work', className: 'w-5 h-5 text-green-500' })}
                </span>
                <span>A self-checking to-do automates the routine, making formal process seamless.</span>
            </motion.li>
        </motion.ul>,
    },
    [Accent.questSystemAccent]: {
        icon: 'play',
        title: "Use gamified guide",
        subtitle: "Turning open-source development into a recognized, collaborative, and financially sustainable pursuit.",
        description: "Turning open-source development into a recognized, collaborative, and financially sustainable pursuit.",
        howTo: <motion.div className="space-y-3">
            Here is how collaboration is implemented as a gamified guide within Ara:
            <ul className="space-y-3 mt-2">
                <li>🔌 Todo Tasks are automatically generated after certain user actions. 😌 You don't have to create them yourself.</li>
                <li>🎮 Web pages show these tasks inside an interactive mini-player.</li>
                <li>
                    🚀 When you "play":
                    <ul className="ml-6 mt-2 space-y-2 list-disc">
                        <li>the system opens the exact page 📄</li>
                        <li>scrolls to the correct section ✍️</li>
                        <li>and focuses the required element ⚡</li>
                        <li>might add three quick solutions by 🤖</li>
                        <li>
                            after you:
                            <div className="ml-6 mt-1 space-y-1">
                                <div>wrote the data  | choose one of the options</div>
                            </div>
                            the task is automatically checked off ✅.
                        </li>
                    </ul>
                </li>
                <li>⏭️ The player automatically proceeds to the next task, letting you keep momentum without interruption.</li>
            </ul>
        </motion.div>
    },
    [Accent.timeSavedProjectManagementAccent]: {
        icon: 'ten-pm-ten-min',
        title: "Manage projects with self-checking todo list",
        subtitle: "Turning open-source development into a recognized, collaborative, and financially sustainable pursuit.",
        description: "Turning open-source development into a recognized, collaborative, and financially sustainable pursuit.",
        howTo: <motion.div className="space-y-3">
            In Ara collaboration is done using todo tasks.
            <ul className="space-y-3 mt-2">
                <li>🔌 Todo Tasks are automatically generated after certain user actions. 😌 You don't have to create them yourself.</li>
                <li>🎮 Web pages show these tasks inside an interactive mini-player.</li>
                <li>
                    🚀 When you "play":
                    <ul className="ml-6 mt-2 space-y-2 list-disc">
                        <li>the system opens the exact page 📄</li>
                        <li>scrolls to the correct section ✍️</li>
                        <li>and focuses the required element ⚡</li>
                        <li>might show solutions by 🤖</li>
                        <li>
                            after you:
                            <div className="ml-6 mt-1 space-y-1">
                                <div>wrote the data  | choose one of the options</div>
                            </div>
                            the task is automatically checked off ✅.
                        </li>
                    </ul>
                </li>
                <li>⏭️ The player automatically proceeds to the next task, letting you keep momentum without interruption.</li>
            </ul>
        </motion.div>
    },
    // [Accent.visionaryAccent]: {
    // title1: "The first platform for maintainers to grow PRs and support",
    // title2: "Turning open-source development into a recognized, collaborative, and financially sustainable pursuit.",
    // },
}


export const features = [
    {
        // icon: <Code2 className="w-8 h-8" />,
        title: "Collaborative Platform",
        description: "Unified workspace for developers, contributors, and users",
        platform: "github"
    },
    {
        // icon: <Users className="w-8 h-8" />,
        title: "Gamified System",
        description: "Collaboration is two click tasks. Project management = 10 minutes of daily guided tasks.",
        platform: "bitbucket"
    },
    {
        // icon: <Users className="w-8 h-8" />,
        title: "Non-competitive Rating",
        description: "Rating represents how you work with others and on which types of projects.",
        platform: "github"
    },
    {
        // icon: <Zap className="w-8 h-8" />,
        title: "Sustainable Growth",
        description: "Financial sustainability through innovative gamified paywall.",
        platform: "bitbucket"
    }
]

export const accentToUrl: Record<Accent, string> = {
    [Accent.monetizationPrimaryAccent]: '/',
    [Accent.formalResponsibleCollaborationAccent]: '/meta/collaboration',
    [Accent.questSystemAccent]: '/meta/quests',
    [Accent.timeSavedProjectManagementAccent]: '/meta/management',
    // [Accent.visionaryAccent]: '/meta/vision',
}

export type SocialLinkType = 'github' | 'telegram' | 'twitter' | 'bluesky'

export interface SocialLink {
    url: string
    type: SocialLinkType
    useCustomIcon?: boolean // true for bluesky (uses getIcon), false for react-icons
}

export const socialLinks: Record<SocialLinkType, SocialLink> = {
    github: {
        url: 'https://github.com/ara-foundation/app',
        type: 'github',
        useCustomIcon: false,
    },
    telegram: {
        url: 'https://t.me/arasangha',
        type: 'telegram',
        useCustomIcon: false,
    },
    twitter: {
        url: 'https://x.com/ara_foundation_',
        type: 'twitter',
        useCustomIcon: false,
    },
    bluesky: {
        url: 'https://bsky.app/profile/cascadefund.bsky.social',
        type: 'bluesky',
        useCustomIcon: true,
    },
} as const