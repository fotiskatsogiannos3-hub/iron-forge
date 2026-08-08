import './ui.css'

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="if-stat-card">
      <div className="if-stat-label">{label}</div>
      <div className="if-stat-value">{value}</div>
    </div>
  )
}
