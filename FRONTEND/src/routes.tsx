import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashBoard';
import HomeClient from './pages/HomeClient';
import AvailabilityForm from './pages/Availability';
import SearchResults from './pages/Search';
import FreelancerAppointments from './pages/AppointmentsForFreelancer';
import ClientAppointments from './pages/AppointmentsForClients';
import FreelancerPlanning from './pages/Planning';
import FreelancerHome from './pages/HomeFreelancer';
import UpdateProfile from './pages/UpdateProfil';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeClient />} />
        <Route path="/freelancer/home" element={<FreelancerHome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/client/availability/:freelancerId" element={<AvailabilityForm />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/freelancer/appointments" element={<FreelancerAppointments />} />
        <Route path="/client/appointments" element={<ClientAppointments />} />
        <Route path="/freelancer/planning" element={<FreelancerPlanning />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
      </Routes>
    </Router>
  );
}
