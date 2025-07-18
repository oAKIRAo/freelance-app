import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashBoard';
import Home from './pages/Home';
import AvailabilityForm from './pages/Availability';
import SearchResults from './pages/Search';
import FreelancerAppointments from './pages/AppointmentsForFreelancer';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/client/availability/:freelancerId" element={<AvailabilityForm />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/freelancer/appointments" element={<FreelancerAppointments />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}
