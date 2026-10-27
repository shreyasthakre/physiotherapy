const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex items-center gap-3 text-slate-500" role="status" aria-live="polite">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
    <span className="text-sm">{label}</span>
  </div>
);

export default Spinner;
