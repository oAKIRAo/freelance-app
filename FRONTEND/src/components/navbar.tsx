import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { decodeToken } from '../lib/decodeToken';

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = decodeToken(token);
      if (decodedToken && decodedToken.role) {
        setIsAuthenticated(true);
        setRole(decodedToken.role);
      } else {
        setIsAuthenticated(false);
        setRole(null);
        localStorage.removeItem('token');
      }
    } else {
      setIsAuthenticated(false);
      setRole(null);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setRole(null);
    navigate('/');
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
    } else if (role === 'freelancer') {
      navigate('/freelancer/home');
    } else if (role === 'client') {
      navigate('/');
    }
  };

  const handleAppointmentsClick = (e: React.MouseEvent) => {
    e.preventDefault();
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
  const handleAboutUsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/about-us');
  }
  const handleContactUsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/contact-us');
  };

  const handleUserIconClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
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
            <li style={{ marginRight: '1.5rem', cursor: 'pointer' }}onClick={handleAboutUsClick}>About Us</li>
            <li
              style={{ marginRight: '1.5rem', cursor: 'pointer' }}
              onClick={handleAppointmentsClick}
            >
              Appointments
            </li>
            <li style={{ cursor: 'pointer' }}onClick={handleContactUsClick}>Contact Us</li>
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
              </>
            ) : (
              <div className="relative dropdown-container" style={{ marginRight: '6rem' }}>
                <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors duration-200">
                  <User
                    size={18}
                    className="text-black cursor-pointer -translate-x-1"
                    onClick={handleUserIconClick}
                  />
                </div>
                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-40 rounded-lg shadow-md border overflow-visible"
                    style={{ 
                      zIndex: 9999,
                      background: 'linear-gradient(to right, rgba(132, 250, 176, 0.4), rgba(143, 211, 244, 0.4))',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                      color: '#000'
                    }}
                  >
                    <div className="py-1">
                      <Link
                        to="/update-profile"
                        className="block px-4 py-2 text-sm hover:bg-black hover:bg-opacity-10 transition-colors duration-150"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Modify Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left block px-4 py-2 text-sm hover:bg-black hover:bg-opacity-10 transition-colors duration-150"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
