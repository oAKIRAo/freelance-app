import React from 'react';
import { FaChartBar, FaTable } from 'react-icons/fa';
import '../styles/SideBarAdmin.css'
const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <h2 className="title">React Admin</h2>
      <nav className="nav">
        <a href="/analytics" className="link">
          <FaChartBar className="icon" />
          Analytics
        </a>
        <a href="/tables" className="link">
          <FaTable className="icon" />
          Tables
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
