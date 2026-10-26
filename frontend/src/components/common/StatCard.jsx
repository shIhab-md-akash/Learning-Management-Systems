export default function StatCard({ icon: Icon, value, label, color = 'var(--primary)', bg }) {
  const bgColor = bg || `${color}22`;
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bgColor }}>
        {Icon && <Icon size={24} style={{ color }} />}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
