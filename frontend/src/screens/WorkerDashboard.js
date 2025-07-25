import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {useAuth} from "../context/AuthContext.js"

function WorkerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth()
  const logggedout = () => {
    logout();
    navigate('/')
  }
  const sidebarBtn = (label, path) => (
    <li>
      <button
        style={{
          width: '100%',
          margin: '8px 0',
          background: location.pathname === path ? '#1976d2' : '#fff',
          color: location.pathname === path ? '#fff' : '#222',
          border: 'none',
          borderRadius: 6,
          fontWeight: 500,
          fontSize: 16,
          padding: '10px 0',
          boxShadow: location.pathname === path ? '0 2px 8px #1976d233' : '0 1px 4px #eee',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onClick={() => navigate(path)}
      >
        {label}
      </button>
    </li>
  );
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 240, background: '#f5f5f5', padding: 24, boxShadow: '2px 0 8px #eee', borderTopRightRadius: 16, borderBottomRightRadius: 16 }}>
        <h3 style={{ marginBottom: 32, color: '#1976d2', letterSpacing: 1 }}>Manager</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {sidebarBtn('See Order', '')}
          <li>
            <button
              style={{
                width: '100%',
                margin: '8px 0',
                background: '#fff',
                color: '#d32f2f',
                border: '1px solid #ffd180',
                borderRadius: 6,
                fontWeight: 500,
                fontSize: 16,
                padding: '10px 0',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={logggedout}
            >
              Logout
            </button>
          </li>
        </ul>
      </aside>
      <main style={{ flex: 1, padding: 32, background: '#f9f9fb', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default WorkerDashboard; 