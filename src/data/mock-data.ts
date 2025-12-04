import { type Transaction, type User } from '../types/influencer';
import { type UserStarData } from '../components/galactic/Space';

export const mockUser: User = {
  name: 'Ahmeton',
  avatar: 'https://dummyimage.com/32x32/4A90E2/ffffff?text=A',
  points: 230
};

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: 'Jan 21, 2023',
    comment: 'Thanks ...the work',
    reply: 'Appreciate much...',
    given: 24500,
    vp: 100,
    issues: 2,
    transactionId: '0x789...45612',
    rating: 2,
    ratingLeft: 5,
    user: {
      name: 'Ahmeton',
      avatar: 'https://dummyimage.com/24x24/4A90E2/ffffff?text=A'
    }
  },
  {
    id: '2',
    date: 'Jan 18, 2023',
    comment: 'No comment',
    reply: 'Appreciate much...',
    given: 12750,
    vp: 100,
    issues: 2,
    transactionId: '0x654...32198',
    rating: 2,
    ratingLeft: 5,
    user: {
      name: 'Ahmeton',
      avatar: 'https://dummyimage.com/24x24/4A90E2/ffffff?text=A'
    }
  },
  {
    id: '3',
    date: 'Jan 15, 2023',
    comment: 'No comment',
    reply: 'Appreciate much...',
    given: 36200,
    vp: 100,
    issues: 2,
    transactionId: '0x1234...5678',
    rating: 2,
    ratingLeft: 5,
    user: {
      name: 'Ahmeton',
      avatar: 'https://dummyimage.com/24x24/4A90E2/ffffff?text=A'
    }
  },
  {
    id: '4',
    date: 'Jan 12, 2023',
    comment: 'No comment',
    reply: 'Appreciate much...',
    given: 18300,
    vp: 100,
    issues: 2,
    transactionId: '0x8765...4321',
    rating: 2,
    ratingLeft: 5,
    user: {
      name: 'Ahmeton',
      avatar: 'https://dummyimage.com/24x24/4A90E2/ffffff?text=A'
    }
  },
  {
    id: '5',
    date: 'Jan 10, 2023',
    comment: 'No comment',
    reply: 'Appreciate much...',
    given: 42800,
    vp: 100,
    issues: 2,
    transactionId: '0x2468...1357',
    rating: 2,
    ratingLeft: 5,
    user: {
      name: 'Ahmeton',
      avatar: 'https://dummyimage.com/24x24/4A90E2/ffffff?text=A'
    }
  }
];

export const mockUserStars: UserStarData[] = [
  {
    x: 200,
    y: 150,
    nickname: 'Ahmeton',
    src: 'https://api.backdropbuild.com/storage/v1/object/public/avatars/9nFM8HasgS.jpeg',
    alt: 'Ahmeton Avatar',
    stars: 4.5,
    sunshines: 120,
    role: 'Maintainer',
    funded: 50000,
    received: 35000,
    issuesClosed: 45,
    issuesActive: 8,
    uri: '/data/profile?nickname=Ahmeton'
  },
  {
    x: 450,
    y: 300,
    nickname: 'Sarah Chen',
    src: 'https://dummyimage.com/64x64/4A90E2/ffffff?text=SC',
    alt: 'Sarah Chen Avatar',
    stars: 3.8,
    sunshines: 95,
    role: 'Contributor',
    funded: 25000,
    received: 18000,
    issuesClosed: 32,
    issuesActive: 5,
    uri: '/data/profile?nickname=SarahChen'
  },
  {
    x: 700,
    y: 200,
    nickname: 'Marcus Johnson',
    src: 'https://dummyimage.com/64x64/10B981/ffffff?text=MJ',
    alt: 'Marcus Johnson Avatar',
    stars: 4.2,
    sunshines: 150,
    role: 'Influencer',
    funded: 75000,
    received: 60000,
    issuesClosed: 28,
    issuesActive: 12,
    uri: '/data/profile?nickname=MarcusJohnson'
  },
  {
    x: 100,
    y: 400,
    nickname: 'Emma Wilson',
    src: 'https://dummyimage.com/64x64/EF4444/ffffff?text=EW',
    alt: 'Emma Wilson Avatar',
    stars: 3.5,
    sunshines: 80,
    role: 'Contributor',
    funded: 15000,
    received: 12000,
    issuesClosed: 18,
    issuesActive: 3,
    uri: '/data/profile?nickname=EmmaWilson'
  },
  {
    x: 850,
    y: 500,
    nickname: 'David Kim',
    src: 'https://dummyimage.com/64x64/8B5CF6/ffffff?text=DK',
    alt: 'David Kim Avatar',
    stars: 4.8,
    sunshines: 200,
    role: 'Maintainer',
    funded: 100000,
    received: 85000,
    issuesClosed: 67,
    issuesActive: 15,
    uri: '/data/profile?nickname=DavidKim'
  },
  {
    x: -100,
    y: 250,
    nickname: 'Lisa Anderson',
    src: 'https://dummyimage.com/64x64/F59E0B/ffffff?text=LA',
    alt: 'Lisa Anderson Avatar',
    stars: 3.2,
    sunshines: 65,
    role: 'Contributor',
    funded: 12000,
    received: 9000,
    issuesClosed: 15,
    issuesActive: 2,
    uri: '/data/profile?nickname=LisaAnderson'
  },
  {
    x: 1200,
    y: 100,
    nickname: 'James Taylor',
    src: 'https://dummyimage.com/64x64/06B6D4/ffffff?text=JT',
    alt: 'James Taylor Avatar',
    stars: 4.0,
    sunshines: 110,
    role: 'Influencer',
    funded: 60000,
    received: 45000,
    issuesClosed: 40,
    issuesActive: 10,
    uri: '/data/profile?nickname=JamesTaylor'
  },
  {
    x: 300,
    y: -50,
    nickname: 'Maria Garcia',
    src: 'https://dummyimage.com/64x64/EC4899/ffffff?text=MG',
    alt: 'Maria Garcia Avatar',
    stars: 3.9,
    sunshines: 88,
    role: 'Contributor',
    funded: 20000,
    received: 15000,
    issuesClosed: 25,
    issuesActive: 4,
    uri: '/data/profile?nickname=MariaGarcia'
  }
];

export interface UniverseStats {
  totalGalaxies: number;
  totalStars: number;
  totalUsers: number;
}

export interface GalaxyData {
  id: string;
  name: string;
  description: string;
  stars: number;
  sunshines: number;
  users: number;
  donationAmount: number;
  x: number;
  y: number;
  tags?: string[];
}

export interface ContestData {
  prizePool: number;
  fromDate: Date;
  toDate: Date;
  description: string;
}

export interface LibraryData {
  id: string;
  name: string;
  dependsOn: number; // Number of projects using this library
}

export const mockUniverseStats: UniverseStats = {
  totalGalaxies: 1247,
  totalStars: 45678.5,
  totalUsers: 8923,
};

export const mockContestData: ContestData = {
  prizePool: 125000,
  fromDate: new Date('2025-12-01'),
  toDate: new Date('2027-01-01'),
  description: 'Active, funded projects compete for 5% of donations pooled within the contest period. In the winning project it\'s shared by users, maintainers, and contributors according to their stars.',
};

export const mockTopGalaxies: GalaxyData[] = [
  {
    id: 'hyperpayment',
    name: 'Hyperpayment',
    description: 'A protocol and its implementation to transfer a resource between arbitrary amount parties. Used for example in Ara to distribute donations',
    stars: 3456.7,
    sunshines: 125000,
    users: 234,
    donationAmount: 450000,
    x: 1300,
    y: 100,
    tags: ['Payment', 'Protocol', 'Blockchain', 'Solidity', 'P2P'],
  },
  {
    id: 'reflect',
    name: 'Reflect',
    description: 'A modern reflection library for TypeScript and JavaScript',
    stars: 2890.3,
    sunshines: 98000,
    users: 189,
    donationAmount: 320000,
    x: 1200,
    y: 400,
    tags: ['TypeScript', 'JavaScript', 'Library', 'Reflection', 'Meta'],
  },
  {
    id: 'ara-app',
    name: 'Ara App',
    description: 'The frontend application for Ara platform',
    stars: 2156.2,
    sunshines: 87000,
    users: 156,
    donationAmount: 280000,
    x: 400,
    y: 200,
    tags: ['Frontend', 'React', 'Astro', 'Web3', 'Open Source'],
  },
  {
    id: 'blockchain-verify',
    name: 'Blockchain Verification Tool',
    description: 'An open-source tool for verifying software components on the blockchain',
    stars: 1890.5,
    sunshines: 76000,
    users: 142,
    donationAmount: 240000,
    x: 1000,
    y: 600,
    tags: ['Blockchain', 'Verification', 'Security', 'Tool', 'Ethereum'],
  },
  {
    id: 'galaxy-engine',
    name: 'Galaxy Engine',
    description: 'A rendering engine for creating beautiful galaxy visualizations',
    stars: 1678.9,
    sunshines: 65000,
    users: 128,
    donationAmount: 210000,
    x: 400,
    y: 500,
    tags: ['Graphics', 'WebGL', 'Visualization', '3D', 'Rendering'],
  },
];

export const mockTopLibraries: LibraryData[] = [
  { id: 'react', name: 'React', dependsOn: 892 },
  { id: 'typescript', name: 'TypeScript', dependsOn: 756 },
  { id: 'astro', name: 'Astro', dependsOn: 623 },
  { id: 'tailwindcss', name: 'Tailwind CSS', dependsOn: 589 },
  { id: 'nodejs', name: 'Node.js', dependsOn: 534 },
  { id: 'express', name: 'Express', dependsOn: 478 },
  { id: 'nextjs', name: 'Next.js', dependsOn: 445 },
  { id: 'vue', name: 'Vue.js', dependsOn: 412 },
];
