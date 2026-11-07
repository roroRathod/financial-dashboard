import { createHashRouter, RouterProvider } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import MarketDetail from './pages/MarketDetail'
import { ThemeProvider } from './context/ThemeContext'

const router = createHashRouter([
  { path: '/', element: <Dashboard /> },
  { path: '/market/:region', element: <MarketDetail /> },
  { path: '*', element: <Dashboard /> },
])

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
