import { NavLink } from 'react-router-dom';
import { useAdminData } from '../../context/AdminDataContext.jsx';
import { IconCalendar, IconHeart, IconBell } from '../icons.jsx';

const AdminSidebar = () => {
  const { appointments } = useAdminData();
  const today = new Date();
  const todaysActive = appointments.filter((appointment) => {
    const date = new Date(appointment.scheduled_at);
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate() &&
      !['completed', 'cancelled', 'no_show'].includes(appointment.status)
    );
  }).length;

  const items = [
    { to: '/admin', end: true, label: 'Today', Icon: IconCalendar, badge: todaysActive },
    { to: '/admin/appointments', label: 'Book', Icon: IconCalendar },
    { to: '/admin/patients', label: 'Patients', Icon: IconHeart },
    { to: '/admin/notifications', label: 'Sent messages', Icon: IconBell },
  ];

  return (
    <nav className="lg:sticky lg:top-24">
      <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {items.map(({ to, end, label, Icon, badge }) => (
          <li key={to} className="shrink-0">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {badge > 0 && (
                <span className="ml-auto hidden rounded-full bg-amber-400/90 px-1.5 py-0.5 text-[10px] font-bold text-white lg:inline">
                  {badge}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AdminSidebar;
