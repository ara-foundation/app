import '../../packages/blockchain-gateway/client-side/client';
import { imitate50Deposit } from "../../packages/blockchain-gateway/client-side/initiate-deposit";
import { hyperpay } from "../../packages/blockchain-gateway/client-side/hyperpay";
import { ObjectId } from 'mongodb';
import { getCollection, create } from './db';
import type { Donation } from '@/types/blockchain-gateway';

/**
 * Payment gateway simulation
 * Imitates a payment transaction
 */

export interface PaymentResult {
    success: boolean
    transactionId: string
    amount: number
    currency: string
    donation?: Donation
    error?: string
}

// Server-side DonationModel (uses ObjectId)
interface DonationModel {
    _id?: ObjectId
    userId: ObjectId
    galaxy: ObjectId // Reference to GalaxyModel
    counter: number // Shared counter for imitate50Deposit and hyperpay
    initiateTxId: string
    hyperpayTxId: string
    sunshinesAmount: number
    spendUsdAmount: number
    memo?: string
    createdAt?: Date // Stored as Date in database, converted to Unix timestamp in Donation type
}

// Serialization functions
function donationModelToDonation(model: DonationModel | null): Donation | null {
    if (!model) return null
    return {
        _id: model._id?.toString(),
        userId: model.userId.toString(),
        galaxy: model.galaxy.toString(), // Convert ObjectId to string
        counter: model.counter,
        initiateTxId: model.initiateTxId,
        hyperpayTxId: model.hyperpayTxId,
        sunshinesAmount: model.sunshinesAmount,
        spendUsdAmount: model.spendUsdAmount,
        memo: model.memo,
        createdAt: model.createdAt ? Math.floor(model.createdAt.getTime() / 1000) : undefined, // Convert Date to Unix timestamp
    }
}

/**
 * Get donation by user ID (for reentrancy check)
 */
export async function getDonationByUserId(userId: string | ObjectId): Promise<Donation | null> {
    try {
        const collection = await getCollection<DonationModel>('donations')
        const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId
        const result = await collection.findOne({ userId: objectId })
        return donationModelToDonation(result)
    } catch (error) {
        console.error('Error getting donation by user id:', error)
        return null
    }
}

/**
 * Get donations by galaxy ID
 */
export async function getDonationsByGalaxyId(galaxyId: string | ObjectId): Promise<Donation[]> {
    try {
        const collection = await getCollection<DonationModel>('donations')
        const objectId = typeof galaxyId === 'string' ? new ObjectId(galaxyId) : galaxyId
        const results = await collection.find({ galaxy: objectId }).sort({ createdAt: -1 }).toArray()
        return results.map(donationModelToDonation).filter((d): d is Donation => d !== null)
    } catch (error) {
        console.error('Error getting donations by galaxy id:', error)
        return []
    }
}

/**
 * Create a new donation record
 */
export async function createDonation(donation: DonationModel): Promise<Donation | null> {
    try {
        const donationWithDate = {
            ...donation,
            createdAt: donation.createdAt || new Date(),
        }
        const created = await create<DonationModel>('donations', donationWithDate)
        if (!created) {
            return null
        }
        // Fetch the created donation to return it with _id
        const collection = await getCollection<DonationModel>('donations')
        const result = await collection.findOne({
            userId: donation.userId,
            galaxy: donation.galaxy,
            counter: donation.counter,
            initiateTxId: donation.initiateTxId,
            hyperpayTxId: donation.hyperpayTxId,
        })
        return donationModelToDonation(result)
    } catch (error) {
        console.error('Error creating donation:', error)
        return null
    }
}

/**
 * Process a payment (simulated)
 * @param amount - Payment amount
 * @param userId - User ID making the payment
 * @param galaxyId - Galaxy ID
 * @param currency - Currency code (default: 'USD')
 * @param memo - Optional memo for the payment
 * @returns Payment result with transaction ID and donation
 */
export async function processPayment(
    amount: number,
    userId: string,
    galaxyId: string,
    currency: string = 'USD',
    memo?: string
): Promise<PaymentResult> {
    try {
        // Reentrancy check: Check if user already has a donation
        const existingDonation = await getDonationByUserId(userId)
        if (existingDonation) {
            return {
                success: false,
                transactionId: '',
                amount,
                currency,
                error: 'reentrancy. sunshines already obtained',
            }
        }

        // Generate a shared counter for both transactions
        const counter = Date.now()

        // Call imitate50Deposit with shared counter to get transaction hash
        const depositResult = await imitate50Deposit(counter)
        const initiateTxId = depositResult.txHash

        // Call hyperpay with the same shared counter to get transaction ID
        const hyperpayTxId = await hyperpay(counter)

        // Calculate sunshines amount (amount * 1.8)
        const sunshinesAmount = amount * 1.8

        // Create donation record
        const userIdObj = new ObjectId(userId)
        const galaxyIdObj = new ObjectId(galaxyId)
        const donationModel: DonationModel = {
            userId: userIdObj,
            galaxy: galaxyIdObj,
            counter,
            initiateTxId,
            hyperpayTxId,
            sunshinesAmount,
            spendUsdAmount: amount,
            memo,
            createdAt: new Date(),
        }

        const donation = await createDonation(donationModel)
        if (!donation) {
            return {
                success: false,
                transactionId: initiateTxId,
                amount,
                currency,
                error: 'Failed to create donation record',
            }
        }

        // Generate a transaction ID for backward compatibility
        const transactionId = initiateTxId

        return {
            success: true,
            transactionId,
            amount,
            currency,
            donation,
        }
    } catch (error) {
        console.error('Error processing payment:', error)
        return {
            success: false,
            transactionId: '',
            amount,
            currency,
            error: 'An error occurred while processing payment',
        }
    }
}

