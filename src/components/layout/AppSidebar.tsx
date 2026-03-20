import { useLocation } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboardIcon,
  SearchIcon,
  TrendingUpIcon,
  InfoIcon,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { VendorPicker } from './VendorPicker'

const navItems = [
  { to: '/', label: 'Executive Overview', icon: LayoutDashboardIcon },
  { to: '/diagnostics', label: 'Catalog & Diagnostics', icon: SearchIcon },
  { to: '/growth-plan', label: 'Growth Plan', icon: TrendingUpIcon },
  { to: '/about', label: 'About This Project', icon: InfoIcon },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md text-sm font-bold">
                B
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold">The Barter</span>
                <span className="truncate text-xs text-muted-foreground">Vendor Growth OS</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.to)

                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      render={<NavLink to={item.to} end={item.to === '/'} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <VendorPicker />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
