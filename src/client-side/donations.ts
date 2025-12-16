import { actions } from 'astro:actions';
import type { Transaction } from '@/types/transaction';
import type { Donation } from '@/types/crypto-sockets';
import { getUserById } from './user';
import { mockTransactionReceivers } from '@/types/mock-data';
import type { ReceiverInfoProps } from '@/types/transaction';

/**
 * Get donations for a galaxy and convert them to Transactions
 * @param galaxyId - The galaxy ID
 * @returns Array of Transaction objects with randomly assigned receivers
 */
export async function getDonations(galaxyId: string): Promise<Transaction[]> {
    try {
        // Fetch donations from server
        const result = await actions.getDonationsByGalaxyId({ galaxyId });
        if (!result.data?.success || !result.data.data) {
            return [];
        }

        const donations: Donation[] = result.data.data;
        const transactions: Transaction[] = [];

        // Convert each donation to a transaction
        for (const donation of donations) {
            // Fetch user info
            const user = await getUserById(donation.userId);
            if (!user) {
                // Skip if user not found
                continue;
            }

            // Randomly select one of 3 receiver configurations
            const randomIndex = Math.floor(Math.random() * mockTransactionReceivers.length);
            const receivers: ReceiverInfoProps[] | undefined = mockTransactionReceivers[randomIndex];

            // Convert Donation to Transaction
            const transaction: Transaction = {
                ...donation,
                // Map Donation fields to Transaction fields
                amount: donation.spendUsdAmount,
                date: donation.createdAt ? donation.createdAt * 1000 : Date.now(), // Convert Unix timestamp to milliseconds
                blockchainTx: donation.initiateTxId,
                // Add user info
                user: {
                    nickname: user.nickname || 'Unknown',
                    icon: user.src,
                    sunshines: user.sunshines || 0,
                    stars: user.stars || 0,
                    isMaintainer: user.role === 'maintainer',
                },
                // Add random receivers
                receivers,
            };

            transactions.push(transaction);
        }

        return transactions;
    } catch (error) {
        console.error('Error getting donations:', error);
        return [];
    }
}

