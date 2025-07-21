import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {  User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);

  // Function to decode JWT token
  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    console.log('Debug: Token from localStorage:', token);

    if (token) {
      const decodedToken = decodeToken(token);
      console.log('Debug: Decoded token:', decodedToken);
      
      if (decodedToken && decodedToken.role) {
        setIsAuthenticated(true);
        setRole(decodedToken.role);
        console.log('Debug: Role from token:', decodedToken.role);
      } else {
        // Token is invalid or doesn't contain role
        setIsAuthenticated(false);
        setRole(null);
        localStorage.removeItem('token'); // Clean up invalid token
      }
    } else {
      setIsAuthenticated(false);
      setRole(null);
    }
  }, []);

  const handleLogout = () => {
    console.log('Debug: Logging out, clearing token from localStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('role'); // Clean up role too, if it exists
    setIsAuthenticated(false);
    setRole(null);
    navigate('/');
  };
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Debug: Home clicked');
    if (!isAuthenticated) {
      navigate('/login');
    } else if (role === 'freelancer') {
      navigate('/freelancer/home');
    } else if (role === 'client') {
      navigate('/');}}
  const handleAppointmentsClick = (e: React.MouseEvent) => {
    e.preventDefault();

    console.log('Debug: Appointments clicked');
    console.log('Debug: isAuthenticated:', isAuthenticated);
    console.log('Debug: role:', role);

    if (!isAuthenticated) {
      navigate('/login');
    } else if (role === 'freelancer') {
      navigate('/freelancer/appointments');
    } else if (role === 'client') {
      navigate('/client/appointments');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="w-full">
      <nav
        className="sticky top-0 z-50 w-full border-b px-6 py-3 shadow-sm"
        style={{
          background:
            'linear-gradient(to right, rgba(132, 250, 176, 1), rgba(143, 211, 244, 1))',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-gray-900 hover:text-gray-700 transition duration-300"
          >
            kalender
          </Link>

          <ul
            style={{
              display: 'flex',
              listStyle: 'none',
              padding: 0,
              margin: 0,
              color: 'black',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            <li style={{ marginRight: '1.5rem', cursor: 'pointer' }} onClick={handleHomeClick}>Home</li>
            <li style={{ marginRight: '1.5rem', cursor: 'pointer' }}>About Us</li>
            <li style={{ marginRight: '1.5rem', cursor: 'pointer' }}>Services</li>
            <li
              style={{ marginRight: '1.5rem', cursor: 'pointer' }}
              onClick={handleAppointmentsClick}
            >
              Appointments
            </li>
            <li style={{ cursor: 'pointer' }}>Contact Me</li>
          </ul>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-black hover:text-gray-600 text-sm cursor-pointer"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-black hover:text-gray-600 text-sm cursor-pointer"
                >
                  Register
                </Link>
                <User size={18} className="text-black cursor-pointer" />
              </>
            ) : (
              <>
                <button
                  onClick={handleLogout}
                  className="text-black hover:text-gray-600 text-sm cursor-pointer bg-transparent border-none p-0"
                >
                  Logout
                </button>
                <User size={18} className="text-black cursor-pointer" />
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};


export default Navbar;