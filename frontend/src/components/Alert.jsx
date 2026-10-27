const styles = {
  success: 'border-teal-200 bg-teal-50 text-teal-800',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-brand-200 bg-brand-50 text-brand-800',
};

const Alert = ({ type = 'info', children }) => {
  if (!children) return null;
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[type]}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
};

export default Alert;
