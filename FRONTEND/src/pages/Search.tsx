import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import '../styles/searchResults.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  specialty?: string;
  price_per_hour?: number | string;
}

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const specialty = params.get('specialty') || '';

  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!specialty) return;

    const fetchResults = async () => {
      setLoading(true);
      setError('');
      setResults([]);

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/searchByspec?specialty=${encodeURIComponent(specialty)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Search failed');
        }

        const data: User[] = await res.json();
        setResults(data);
      } catch (err: any) {
        setError(err.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [specialty, token]);

  // Generate default 7-day date range for the URL
  const getDefaultDateRange = () => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 6);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    return `${formatDate(today)},${formatDate(endDate)}`;
  };

  return (
    <>
      <Navbar />
      <div className="search-results-container">
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && results.length === 0 && (
          <p>No results found for "{specialty}".</p>
        )}

        <div className="cards-container">
          {results.map(user => (
            <div className="user-card" key={user.id}>
              <h3 className="user-name">{user.name}</h3>
              <p className="user-specialty">
                <strong>Specialty:</strong> {user.specialty || '-'}
              </p>
              <p className="user-price">
                <strong>Price per Hour:</strong> {user.price_per_hour ?? '-'}$
              </p>
              <button
                className="view-planning-btn"
                onClick={() => {
                  const dateRange = getDefaultDateRange();
                  navigate(`/client/availability/${user.id}?dateRange=${dateRange}`);
                }}
              >
                View Planning
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SearchResults;
