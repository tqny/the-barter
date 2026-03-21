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
        <main className="max-w-6xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
