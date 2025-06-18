import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function HeadBranchManagerSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{
      width: '250px',
      background: '#1976d2',
      color: '#fff',
      padding: '20px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>HBM Dashboard</h2>
      <nav style={{ flexGrow: 1 }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '15px' }}>
            <NavLink 
              to="/dashboard/head-branch-manager/revenue"
              style={({ isActive }) => ({
                color: isActive ? '#ffd700' : '#fff',
                textDecoration: 'none',
                fontSize: '18px',
                padding: '10px 15px',
                borderRadius: '8px',
                display: 'block',
                backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'background-color 0.3s ease, color 0.3s ease',
              })}
            >
              Revenue Overview
            </NavLink>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <NavLink 
              to="/dashboard/head-branch-manager/graph"
              style={({ isActive }) => ({
                color: isActive ? '#ffd700' : '#fff',
                textDecoration: 'none',
                fontSize: '18px',
                padding: '10px 15px',
                borderRadius: '8px',
                display: 'block',
                backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'background-color 0.3s ease, color 0.3s ease',
              })}
            >
              Monthly Graph
            </NavLink>
          </li>
        </ul>
      </nav>
      <button 
        onClick={handleLogout}
        style={{
          background: '#dc3545',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          cursor: 'pointer',
          fontSize: '16px',
          marginTop: 'auto',
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default HeadBranchManagerSidebar; 