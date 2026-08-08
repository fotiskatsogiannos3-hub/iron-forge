import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import './layout.css'

export function AppLayout() {
  return (
    <div className="if-app-shell">
      <Sidebar />
      <main className="if-app-main">
        <Outlet />
      </main>
    </div>
  )
}
