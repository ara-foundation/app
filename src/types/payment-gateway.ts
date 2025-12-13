export interface Donation {
    _id?: string
    userId: string
    galaxy: string // galaxyId
    counter: number // Shared counter for imitate50Deposit and hyperpay
    initiateTxId: string // from imitate50Deposit.txHash
    hyperpayTxId: string // from hyperpay return value
    sunshinesAmount: number
    spendUsdAmount: number
    memo?: string
    createdAt?: number // Unix timestamp
}

