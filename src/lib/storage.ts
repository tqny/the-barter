import type { ActionItem } from '@/data/types'

const STORAGE_KEYS = {
  selectedVendor: 'the-barter:selected-vendor',
  actionItems: 'the-barter:action-items',
} as const

export function loadSelectedVendorId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.selectedVendor)
  } catch {
    return null
  }
}

export function saveSelectedVendorId(vendorId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.selectedVendor, vendorId)
  } catch {
    // localStorage unavailable — silent fail
  }
}

export function loadActionItems(): Record<string, ActionItem[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.actionItems)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveActionItems(items: Record<string, ActionItem[]>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.actionItems, JSON.stringify(items))
  } catch {
    // localStorage unavailable — silent fail
  }
}
