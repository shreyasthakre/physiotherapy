const map = {
  booked: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-brand-50 text-brand-700',
  checked_in: 'bg-violet-50 text-violet-700',
  completed: 'bg-teal-50 text-teal-700',
  cancelled: 'bg-slate-100 text-slate-500 line-through',
  no_show: 'bg-rose-50 text-rose-700',
};

const labels = {
  checked_in: 'Checked in',
  no_show: 'Missed',
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${map[status] || 'bg-slate-100 text-slate-600'}`}>
    {labels[status] || status}
  </span>
);

export default StatusBadge;
