import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useFetch } from '../lib/useFetch.js';
import Toast from '../components/Toast.jsx';

const AdminDataContext = createContext(null);

/**
 * Fetches the core admin datasets once and shares them across all admin
 * sub-pages, along with refetch helpers and a global toast.
 */
export const AdminDataProvider = ({ children }) => {
  const users = useFetch('/admin/users', { select: (d) => d.users });
  const appointments = useFetch('/appointments', { select: (d) => d.appointments });
  const notifications = useFetch('/notifications', { select: (d) => d.notifications });
  const services = useFetch('/services', { select: (d) => d.services });
  const messages = useFetch('/contact', { select: (d) => d.messages });

  const [toast, setToast] = useState('');

  const refreshAppointments = useCallback(() => {
    appointments.refetch();
    notifications.refetch();
  }, [appointments, notifications]);

  const refreshUsers = useCallback(() => users.refetch(), [users]);

  const refreshAll = useCallback(() => {
    users.refetch();
    appointments.refetch();
    notifications.refetch();
    services.refetch();
    messages.refetch();
  }, [users, appointments, notifications, services, messages]);

  const value = useMemo(
    () => ({
      users: users.data || [],
      usersLoading: users.loading,
      appointments: appointments.data || [],
      appointmentsLoading: appointments.loading,
      notifications: notifications.data || [],
      notificationsLoading: notifications.loading,
      services: services.data || [],
      messages: messages.data || [],
      messagesLoading: messages.loading,
      patients: (users.data || []).filter((u) => u.role === 'patient'),
      physios: (users.data || []).filter((u) => u.role === 'physiotherapist'),
      refreshAppointments,
      refreshUsers,
      refreshAll,
      showToast: setToast,
    }),
    [
      users.data,
      users.loading,
      appointments.data,
      appointments.loading,
      notifications.data,
      notifications.loading,
      services.data,
      messages.data,
      messages.loading,
      refreshAppointments,
      refreshUsers,
      refreshAll,
    ],
  );

  return (
    <AdminDataContext.Provider value={value}>
      {children}
      <Toast message={toast} onClose={() => setToast('')} />
    </AdminDataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminData = () => {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used within an AdminDataProvider');
  return ctx;
};
