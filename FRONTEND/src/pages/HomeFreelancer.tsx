import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import '../styles/home.css'; 

const FreelancerHome = () => {
  const navigate = useNavigate();

  const handleCreatePlanning = () => {
    navigate('/freelancer/planning');
  };

  return (
    <>
      <Navbar />
      <div className="home-container">
        <h1 className="home-title">
          Welcome to Your Freelance Dashboard
        </h1>
        <p className="home-subtitle">
          Manage your planning, organize your appointments, and control your schedule.
        </p>

        <button 
          onClick={handleCreatePlanning} 
          className="gradient-btn"
        >
          Create My Planning
        </button>
      </div>
    </>
  );
};

export default FreelancerHome;
