import { useVendor } from '@/context/VendorContext'

export function Diagnostics() {
  const { selectedVendor } = useVendor()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Catalog & Diagnostics</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Product-level diagnostics for {selectedVendor.name}
      </p>
    </div>
  )
}
