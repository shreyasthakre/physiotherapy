import { Navigate, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import ServiceDetail from './pages/ServiceDetail.jsx';
import Booking from './pages/Booking.jsx';
import Blog from './pages/Blog.jsx';
import BlogPost from './pages/BlogPost.jsx';
import Testimonials from './pages/Testimonials.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Portal from './pages/Portal.jsx';
import PortalHome from './pages/PortalHome.jsx';
import NotFound from './pages/NotFound.jsx';

// Admin panel (its own shell — no public navbar/footer).
import AdminPanel from './pages/AdminPanel.jsx';
import Today from './pages/portal/admin/Today.jsx';
import Appointments from './pages/portal/admin/Appointments.jsx';
import Patients from './pages/portal/admin/Patients.jsx';
import Notifications from './pages/portal/admin/Notifications.jsx';

const App = () => (
  <Routes>
    {/* Clinic handling app: deliberately outside the public website layout. */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      path="/admin"
      element={
        <ProtectedRoute roles={['admin']}>
          <AdminPanel />
        </ProtectedRoute>
      }
    >
      <Route index element={<Today />} />
      <Route path="today" element={<Navigate to="/admin" replace />} />
      <Route path="new" element={<Navigate to="/admin" replace />} />
      <Route path="appointments" element={<Appointments />} />
      <Route path="patients" element={<Patients />} />
      <Route path="notifications" element={<Notifications />} />
    </Route>
    <Route
      path="/portal"
      element={
        <ProtectedRoute>
          <Portal />
        </ProtectedRoute>
      }
    >
      <Route index element={<PortalHome />} />
      <Route path="booking" element={<Booking />} />
    </Route>

    {/* Public doctor website: marketing and contact pages only. */}
    <Route element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="services" element={<Services />} />
      <Route path="services/:slug" element={<ServiceDetail />} />
      <Route path="booking" element={<Booking />} />
      <Route path="blog" element={<Blog />} />
      <Route path="blog/:slug" element={<BlogPost />} />
      <Route path="testimonials" element={<Testimonials />} />
      <Route path="contact" element={<Contact />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default App;
