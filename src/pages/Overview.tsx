import { useVendor } from '@/context/VendorContext'

export function Overview() {
  const { selectedVendor } = useVendor()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Executive Overview</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Portfolio performance for {selectedVendor.name}
      </p>
    </div>
  )
}
