import React from 'react';
import { Outlet } from 'react-router-dom';
import HeadBranchManagerSidebar from './HeadBranchManagerSidebar';
import { useAuth } from '../../context/AuthContext'; // To check user role for protection
import { Navigate } from 'react-router-dom';

function HeadBranchManagerDashboard() {
  const { userData } = useAuth();

  // Basic role check for the dashboard layout itself
  if (!userData || userData.role !== 'head branch manager') {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f5f7fa',
    }}>
      <HeadBranchManagerSidebar />
      <div style={{
        flexGrow: 1,
        padding: '20px',
        overflowY: 'auto',
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: 30, color: '#1976d2' }}>Head Branch Manager Dashboard</h2>
        <Outlet /> {/* This is where child routes will render */}
      </div>
    </div>
  );
}

export default HeadBranchManagerDashboard; 