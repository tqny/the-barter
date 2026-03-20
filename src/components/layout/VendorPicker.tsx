import { useVendor } from '@/context/VendorContext'
import type { HealthStatus } from '@/data/types'
import { cn } from '@/lib/utils'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const healthColors: Record<HealthStatus, string> = {
  good: 'bg-status-good',
  warn: 'bg-status-warn',
  bad: 'bg-status-bad',
}

export function VendorPicker() {
  const { vendors, selectedVendor, setSelectedVendorId } = useVendor()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Vendors</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {vendors.map((vendor) => (
            <SidebarMenuItem key={vendor.id}>
              <SidebarMenuButton
                isActive={vendor.id === selectedVendor.id}
                tooltip={vendor.brand}
                onClick={() => setSelectedVendorId(vendor.id)}
              >
                <span
                  className={cn('h-2 w-2 rounded-full shrink-0', healthColors[vendor.healthStatus])}
                  aria-label={`Health: ${vendor.healthStatus}`}
                />
                <span>{vendor.brand}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
