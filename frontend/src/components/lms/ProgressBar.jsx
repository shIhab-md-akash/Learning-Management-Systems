export default function ProgressBar({ value = 0, showLabel = true, size = 'md' }) {
  const clamped = Math.min(100, Math.max(0, value));
  const height = size === 'sm' ? '4px' : size === 'lg' ? '12px' : '8px';

  return (
    <div className="progress-wrapper">
      <div className="progress-bar-track" style={{ height }}>
        <div
          className="progress-bar-fill"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '4px',
            fontSize: '0.75rem',
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>Progress</span>
          <span
            style={{
              fontWeight: 700,
              color: clamped === 100 ? 'var(--success)' : 'var(--primary)',
            }}
          >
            {clamped}%
          </span>
        </div>
      )}
    </div>
  );
}
