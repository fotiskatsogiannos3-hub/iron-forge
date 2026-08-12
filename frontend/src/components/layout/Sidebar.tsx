import { NavLink, useLocation } from 'react-router-dom'
import { Dumbbell, PieChart, Users, CreditCard, ShieldCheck, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import './layout.css'

export function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isAdmin = user?.role === 'ADMIN'

  // Keep Member List highlighted on member detail routes (/members/:id).
  const onMemberDetail = /^\/members\/\d+/.test(location.pathname)

  return (
    <aside className="if-sidebar">
      <div className="if-sidebar-logo">
        <Dumbbell size={26} color="#5b9bf5" strokeWidth={2.4} />
        <span>IRON FORGE</span>
      </div>

      <nav className="if-sidebar-nav">
        <NavItem to="/dashboard" icon={<PieChart size={19} />} label="Dashboard" />

        <NavGroup icon={<Users size={19} />} label="Members">
          <SubNavItem to="/members" label="Member List" forceActive={onMemberDetail} />
          <SubNavItem to="/members/new" label="New Member" />
        </NavGroup>

        <NavGroup icon={<CreditCard size={19} />} label="Subscriptions">
          <SubNavItem to="/subscriptions" label="Subscription List" />
          <SubNavItem to="/subscriptions/new" label="New Subscription" />
          {isAdmin && <SubNavItem to="/subscription-plans" label="Subscription plans" />}
        </NavGroup>

        {isAdmin && <NavItem to="/staff" icon={<ShieldCheck size={19} />} label="Staff | Roles" />}
      </nav>

      <div className="if-sidebar-footer">
        <div className="if-sidebar-user">
          <div className="if-sidebar-user-avatar">{user?.username?.slice(0, 1).toUpperCase()}</div>
          <div className="if-sidebar-user-meta">
            <span className="if-sidebar-user-name">{user?.username}</span>
            <span className="if-sidebar-user-role">{user?.role}</span>
          </div>
        </div>
        <button className="if-sidebar-logout" onClick={logout} title="Log out">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  )
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => `if-nav-item ${isActive ? 'active' : ''}`} end>
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}

function NavGroup({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="if-nav-group">
      <div className="if-nav-group-label">
        {icon}
        <span>{label}</span>
      </div>
      <div className="if-nav-subitems">{children}</div>
    </div>
  )
}

function SubNavItem({ to, label, forceActive }: { to: string; label: string; forceActive?: boolean }) {
  return (
    <NavLink to={to} className={({ isActive }) => `if-subnav-item ${isActive || forceActive ? 'active' : ''}`} end>
      {label}
    </NavLink>
  )
}