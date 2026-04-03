import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * ToastNotification
 * Displays a stack of auto-dismissing toast messages.
 *
 * Usage:
 *   const { toasts, addToast } = useToasts();
 *   <ToastNotification toasts={toasts} onDismiss={removeToast} />
 */

let _nextId = 1;

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = _nextId++;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

/**
 * Individual toast item — auto-dismisses after `duration` ms.
 */
function Toast({ toast, onDismiss }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timerRef.current);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
      <span className="toast-message">{toast.message}</span>
      <button
        className="toast-close"
        onClick={() => onDismiss(toast.id)}
        aria-label="关闭通知"
      >
        ×
      </button>
    </div>
  );
}

export default function ToastNotification({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-label="通知">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
