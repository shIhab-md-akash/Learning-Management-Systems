import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';

const iconMap = {
  success: CheckCircle,
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function Alert({ type = 'info', message, dismissible = false, onDismiss }) {
  const [visible, setVisible] = useState(true);
  const Icon = iconMap[type] || Info;

  if (!visible || !message) return null;

  const dismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div className={`alert alert-${type}`} role="alert">
      <Icon size={18} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ flex: 1 }}>{message}</span>
      {dismissible && (
        <button
          onClick={dismiss}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
