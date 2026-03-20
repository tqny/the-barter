import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { ErrorBoundary } from './ErrorBoundary'

export function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex items-center gap-2 px-4 py-2 md:hidden border-b border-border">
          <SidebarTrigger />
          <span className="text-sm font-medium">The Barter</span>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
