import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { VendorProvider } from '@/context/VendorContext'
import { AppShell } from '@/components/layout/AppShell'
import { Overview } from '@/pages/Overview'
import { Diagnostics } from '@/pages/Diagnostics'
import { GrowthPlan } from '@/pages/GrowthPlan'
import { About } from '@/pages/About'

export default function App() {
  return (
    <BrowserRouter basename="/the-barter">
      <VendorProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Overview />} />
            <Route path="diagnostics" element={<Diagnostics />} />
            <Route path="growth-plan" element={<GrowthPlan />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </VendorProvider>
    </BrowserRouter>
  )
}
