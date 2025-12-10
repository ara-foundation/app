import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import Tabs from './Tabs';
import type { TabProps } from './Tabs';
import WorkStylePanel from '@/components/profile/WorkStyleContent';
import ProjectTimeAllocationPanel from '@/components/profile/ProjectTimeAllocationPanel';

const meta = {
    title: 'Components/Tabs',
    component: Tabs,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

// Sample content components for different stories
const SampleContent1 = () => (
    <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Sample Content 1</h3>
        <p className="text-gray-600 mb-4">
            This is the first tab content. It demonstrates how the tabs component works with different content.
        </p>
        <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">This is a sample info box within the tab content.</p>
        </div>
    </div>
);

const SampleContent2 = () => (
    <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Sample Content 2</h3>
        <p className="text-gray-600 mb-4">
            This is the second tab content with different styling and information.
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Feature item 1</li>
            <li>Feature item 2</li>
            <li>Feature item 3</li>
        </ul>
    </div>
);

const SampleContent3 = () => (
    <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Sample Content 3</h3>
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-3 rounded">
                <h4 className="font-medium">Card 1</h4>
                <p className="text-sm text-gray-600">Description for card 1</p>
            </div>
            <div className="bg-gray-100 p-3 rounded">
                <h4 className="font-medium">Card 2</h4>
                <p className="text-sm text-gray-600">Description for card 2</p>
            </div>
        </div>
    </div>
);

// Profile tabs using the actual ProfileMetricPanel components
const profileTabs: TabProps[] = [
    {
        label: 'Availability & Work Style',
        key: "workStyle",
        content: <WorkStylePanel />,
    },
    {
        label: 'Project Time Allocation',
        key: "projectTimeAllocation",
        content: <ProjectTimeAllocationPanel />,
    }
];

// Basic tabs with sample content
const basicTabs: TabProps[] = [
    {
        label: 'Overview',
        key: "overview",
        content: <SampleContent1 />,
    },
    {
        label: 'Details',
        key: "details",
        content: <SampleContent2 />,
    },
    {
        label: 'Settings',
        key: "settings",
        content: <SampleContent3 />,
    }
];

// Tabs with icons (using emoji as simple icons)
const tabsWithIcons: TabProps[] = [
    {
        label: (
            <div className="flex items-center space-x-2">
                <span>📊</span>
                <span>Analytics</span>
            </div>
        ),
        key: "analytics",
        content: <SampleContent1 />,
    },
    {
        label: (
            <div className="flex items-center space-x-2 ml-2">
                <span>⚙️</span>
                <span>Settings</span>
            </div>
        ),
        key: "settings",
        content: <SampleContent2 />,
    },
    {
        label: (
            <div className="flex items-center space-x-2">
                <span>👤</span>
                <span>Profile</span>
            </div>
        ),
        key: "profile",
        content: <SampleContent3 />,
    }
];

export const Default: Story = {
    args: {
        id: "default-tabs",
        activeTab: "overview",
        tabs: basicTabs,
    }
};

export const ProfileTabs: Story = {
    args: {
        id: "profile-metrics",
        activeTab: "workStyle",
        tabs: profileTabs,
    },
    parameters: {
        docs: {
            description: {
                story: 'This story demonstrates the Tabs component using the actual ProfileMetricPanel components, showing how it works in a real application context.',
            },
        },
    },
};

export const WithIcons: Story = {
    args: {
        id: "tabs-with-icons",
        activeTab: "analytics",
        tabs: tabsWithIcons,
    },
    parameters: {
        docs: {
            description: {
                story: 'This story shows how to use custom React nodes (including icons) as tab labels.',
            },
        },
    },
};

export const TwoTabs: Story = {
    args: {
        id: "two-tabs",
        activeTab: "first",
        tabs: [
            {
                label: 'First Tab',
                key: "first",
                content: <SampleContent1 />,
            },
            {
                label: 'Second Tab',
                key: "second",
                content: <SampleContent2 />,
            }
        ],
    },
    parameters: {
        docs: {
            description: {
                story: 'A simple two-tab configuration for basic use cases.',
            },
        },
    },
};

export const LongTabLabels: Story = {
    args: {
        id: "long-labels",
        activeTab: "very-long-tab-name",
        tabs: [
            {
                label: 'Very Long Tab Name That Might Wrap',
                key: "very-long-tab-name",
                content: <SampleContent1 />,
            },
            {
                label: 'Another Long Tab Label',
                key: "another-long-label",
                content: <SampleContent2 />,
            },
            {
                label: 'Short',
                key: "short",
                content: <SampleContent3 />,
            }
        ],
    },
    parameters: {
        docs: {
            description: {
                story: 'This story demonstrates how the tabs handle longer labels and mixed label lengths.',
            },
        },
    },
};
