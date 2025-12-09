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