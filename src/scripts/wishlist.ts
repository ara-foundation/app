import { create, exists } from './db'

interface WishlistModel {
    email: string
    time: number
}

export async function isWishlisted(email: string): Promise<boolean> {
    return await exists<WishlistModel>('wishlist', { email })
}

export async function joinWishlist(email: string): Promise<boolean> {
    return await create<WishlistModel>('wishlist', { email, time: Date.now() })
}

