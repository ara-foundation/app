import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}


export function truncateStr(title: string, maxLength: number = 58): string {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength) + '...';
};

export function hexToRgba(hex: string, alpha = 1): string {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map(c => c + c)
      .join('');
  }
  const int = parseInt(h, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Helper function to capitalize first letter
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Get the blockchain explorer base URL for transactions
 * @returns The explorer URL prefix for transaction links
 */
export function getExplorerTxUrl(): string {
  return 'https://sepolia.basescan.org/tx/'
}

/**
 * Get the full transaction URL for a given transaction ID
 * @param txId - The transaction ID (with or without 0x prefix)
 * @returns The full explorer URL for the transaction
 */
export function getTransactionUrl(txId?: string): string {
  if (!txId) {
    return getExplorerTxUrl()
  }
  const explorerPrefix = getExplorerTxUrl()
  // If txId already starts with http, return as is
  if (txId.startsWith('http')) {
    return txId
  }
  // If it starts with 0x, use as is, otherwise prepend 0x
  const formattedTx = txId.startsWith('0x') ? txId : `0x${txId}`
  return `${explorerPrefix}${formattedTx}`
}