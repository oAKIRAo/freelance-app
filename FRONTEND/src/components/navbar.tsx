import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    Boolean(localStorage.getItem('token'))
  );

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem('token')));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div className="w-full">
     <nav className="sticky top-0 z-50 w-full border-b px-6 py-3 shadow-sm"
         style={{background: 'linear-gradient(to right, rgba(132, 250, 176, 1), rgba(143, 211, 244, 1))',}}
>        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold tracking-tight text-gray-900 hover:text-gray-700 transition duration-300">
            kalender
          </Link>

          {/* Center nav menu */}
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
            <li style={{ marginRight: '1.5rem', cursor: 'pointer' }}>Home</li>
            <li style={{ marginRight: '1.5rem', cursor: 'pointer' }}>About Us</li>
            <li style={{ marginRight: '1.5rem', cursor: 'pointer' }}>Services</li>
            <li style={{ marginRight: '1.5rem', cursor: 'pointer' }}>Featured</li>
            <li style={{ cursor: 'pointer' }}>Contact Me</li>
          </ul>

          {/* Right side icons + auth */}
          <div className="flex items-center gap-4">            
            {/* Profile / Auth */}
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-black hover:text-gray-600 text-sm cursor-pointer">
                  Login
                </Link>
                <Link to="/register" className="text-black hover:text-gray-600 text-sm cursor-pointer">
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
