import { useVendor } from '@/context/VendorContext'

export function GrowthPlan() {
  const { selectedVendor } = useVendor()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Growth Plan & QBR Studio</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Action planning and business reviews for {selectedVendor.name}
      </p>
    </div>
  )
}
