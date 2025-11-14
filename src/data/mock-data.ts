import { type Transaction, type User } from '../types/influencer';

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
