import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Vendor, Product, VendorTrends, ActionItem } from '@/data/types'
import { vendors } from '@/data/vendors'
import { products } from '@/data/products'
import { getVendorTrends } from '@/data/trends'
import {
  loadSelectedVendorId,
  saveSelectedVendorId,
  loadActionItems,
  saveActionItems,
} from '@/lib/storage'

interface VendorContextValue {
  vendors: Vendor[]
  selectedVendor: Vendor
  vendorProducts: Product[]
  vendorTrends: VendorTrends | undefined
  setSelectedVendorId: (id: string) => void
  actionItems: Record<string, ActionItem[]>
  setVendorActions: (vendorId: string, items: ActionItem[]) => void
}

const VendorContext = createContext<VendorContextValue | null>(null)

function getInitialVendorId(): string {
  const stored = loadSelectedVendorId()
  if (stored && vendors.some((v) => v.id === stored)) {
    return stored
  }
  return vendors[0].id
}

export function VendorProvider({ children }: { children: ReactNode }) {
  const [selectedVendorId, setSelectedVendorIdState] = useState(getInitialVendorId)
  const [actionItems, setActionItemsState] = useState<Record<string, ActionItem[]>>(loadActionItems)

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId) ?? vendors[0]
  const vendorProducts = products.filter((p) => p.vendorId === selectedVendorId)
  const vendorTrends = getVendorTrends(selectedVendorId)

  const setSelectedVendorId = useCallback((id: string) => {
    setSelectedVendorIdState(id)
    saveSelectedVendorId(id)
  }, [])

  const setVendorActions = useCallback(
    (vendorId: string, items: ActionItem[]) => {
      setActionItemsState((prev) => {
        const next = { ...prev, [vendorId]: items }
        saveActionItems(next)
        return next
      })
    },
    [],
  )

  return (
    <VendorContext value={{
      vendors,
      selectedVendor,
      vendorProducts,
      vendorTrends,
      setSelectedVendorId,
      actionItems,
      setVendorActions,
    }}>
      {children}
    </VendorContext>
  )
}

export function useVendor(): VendorContextValue {
  const ctx = useContext(VendorContext)
  if (!ctx) {
    throw new Error('useVendor must be used within a VendorProvider')
  }
  return ctx
}
