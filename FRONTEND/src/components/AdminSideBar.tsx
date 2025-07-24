import React from 'react';
import { FaChartBar, FaTable,FaSignOutAlt  } from 'react-icons/fa';
import '../styles/SideBarAdmin.css';
import { useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="sidebar">
      <h2 className="title"> Admin </h2>
      <nav className="nav">
        <a href="/admin/dashboard/analytics" className="link">
          <FaChartBar className="icon" />
          Analytics
        </a>
        <a href="/admin/dashboard" className="link">
          <FaTable className="icon" />
          Tables
        </a>
        <a onClick={handleLogout} className="link" style={{ cursor: 'pointer' }}>
          <FaSignOutAlt className="icon" />
          Logout
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
