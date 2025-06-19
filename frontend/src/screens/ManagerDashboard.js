import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

function ManagerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    if (location.pathname === '/dashboard/admin') {
      navigate('/dashboard/admin/manage', { replace: true });
    }
  }, [location.pathname, navigate]);

  const sidebarBtn = (label, path) => (
    <li key={label}>
      <button
        onMouseEnter={() => setHoveredBtn(label)}
        onMouseLeave={() => setHoveredBtn(null)}
        onClick={() => navigate(path)}
        style={{
          width: '100%',
          background:
            location.pathname === path
              ? '#8B0000'
              : hoveredBtn === label
                ? '#e57373' // lighter red on hover
                : '#fff',
          color: location.pathname === path || hoveredBtn === label ? '#fff' : '#222',
          border: '1px solid #ddd',
          borderRadius: 10,
          fontWeight: 600,
          fontSize: 15,
          padding: '12px 16px',
          margin: '6px 0',
          boxShadow:
            location.pathname === path
              ? '0 4px 10px rgba(139, 0, 0, 0.2)'
              : hoveredBtn === label
                ? '0 2px 6px rgba(0,0,0,0.05)'
                : 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {label}
      </button>
    </li>
  );


  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: '"Playfair Display", Georgia, serif',
      }}
    >
      {/* ─────────── Sidebar ─────────── */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: 260,
          background: '#fff',
          boxShadow: '4px 0 12px rgba(0,0,0,0.05)',
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* {/ Scrollable section * */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <h3
            style={{
              marginBottom: 40,
              color: '#8B0000',
              fontSize: 22,
              fontWeight: 'bold',
              borderBottom: '2px solid #8B0000',
              paddingBottom: 10
            }}
          >
            Admin Panel
          </h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {sidebarBtn('Menu Management', '/dashboard/manager/menu')}
            {sidebarBtn('Bookings', '/dashboard/manager/bookings')}
          </ul>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fff3e0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
            style={{
              width: '100%',
              background: '#fff',
              color: '#d32f2f',
              border: '2px solid #ffd180',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 16,
              padding: '12px 0',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Logout
          </button>
        </div>
      </aside >

      {/* ─────────── Main content ─────────── */}
      <main
        style={{
          flex: 1,
          padding: 40,
          background: '#fffaf5',
          minHeight: '100vh',
          marginLeft: 270, // sidebar width + 10px breathing room
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default ManagerDashboard;
