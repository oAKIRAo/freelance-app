import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    Boolean(localStorage.getItem('token'))
  );

  // State for search input
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem('token')));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Optional: handle search submit (for example, navigate to search results)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white px-6 py-3 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-gray-900">
          YourBrand
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
              <NavigationMenuContent className="rounded-md bg-white shadow-lg p-4 w-48">
                <ul className="space-y-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/freelancers" className="block hover:text-blue-500">
                        Freelancers
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/clients" className="block hover:text-blue-500">
                        Clients
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/about" className="hover:text-blue-500">
                  About
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuIndicator />
          <NavigationMenuViewport />
        </NavigationMenu>

        {/* Search bar (only visible on md and larger screens) */}
        <form
          onSubmit={handleSearchSubmit}
          className=" md:block mx-4 flex-grow max-w-xs"
        >
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-500">
                Login
              </Link>
              <Link
                to="/register"
                className="text-gray-700 hover:text-blue-500"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
