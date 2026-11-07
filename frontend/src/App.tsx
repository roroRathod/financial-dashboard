import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import MarketDetail from './pages/MarketDetail'
import { ThemeProvider } from './context/ThemeContext'

const router = createBrowserRouter([
  { path: '/', element: <Dashboard /> },
  { path: '/market/:region', element: <MarketDetail /> },
])

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
