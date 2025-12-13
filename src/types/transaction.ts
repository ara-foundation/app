import type { Donation } from './payment-gateway';
import type { ReceiverInfoProps } from '@/components/maintainer/ReceiverInfo';

// Re-export ReceiverInfoProps for convenience
export type { ReceiverInfoProps };

export interface Transaction extends Donation {
  // User info who made the donation
  user: {
    nickname: string;
    icon?: string;
    sunshines: number;
    stars: number;
    isMaintainer?: boolean;
  };
  // Optional cascade information
  cascadeLevel?: number;
  receivers?: ReceiverInfoProps[];
  maintainer?: {
    nickname: string;
    icon?: string;
    sunshines: number;
    stars: number;
  };
  // Additional fields for display
  blockchainTx?: string; // Maps to initiateTxId or hyperpayTxId
  receipt?: string;
  amount: number; // Maps to spendUsdAmount
  date: number; // Maps to createdAt (Unix timestamp in milliseconds)
  memo?: string; // Already in Donation, but kept for compatibility
}

