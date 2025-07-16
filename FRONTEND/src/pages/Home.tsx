import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import '../styles/home.css'; 

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?specialty=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="home-container">
        <h1 className="home-title">
          Welcome to Your Freelance Appointments & Planning Tool 
        </h1>
        <p className="home-subtitle">
          Manage your meetings, organize your schedule, and stay on top of your freelance work.
        </p>

        <form onSubmit={handleSearchSubmit} className="home-form">
          <input
            type="text"
            placeholder="Search for freelancers"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="home-search-input"
          />
        </form>
      </div>
    </>
  );
};

export default Home;
