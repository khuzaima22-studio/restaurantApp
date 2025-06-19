import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

function CustomerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(() => {
    return localStorage.getItem("active") || "View Restaurants";
  });
  const [hoveredBtn, setHoveredBtn] = useState(null);

  // Auto-navigate if needed (optional tweak — might not be necessary)
  useEffect(() => {
    if (location.pathname === '/dashboard/customer') {
      navigate('/dashboard/customer', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Sync active on route change
  useEffect(() => {
    const current = localStorage.getItem("active") || "View Restaurants";
    setActive(current);
  }, [location.pathname]);



  const sidebarBtn = (label, path) => (
    <li>
      <button
        onMouseEnter={() => setHoveredBtn(label)}
        onMouseLeave={() => setHoveredBtn(null)}
        style={{
          width: '100%',
          background:
            active === label
              ? '#991b1b'
              : hoveredBtn === label
                ? '#fcebea'
                : '#f9f9f9',
          color: active === label ? '#fff' : '#222',
          border: '1px solid #ddd',
          borderRadius: 10,
          fontWeight: 600,
          fontSize: 15,
          padding: '12px 16px',
          boxShadow:
            active === label
              ? '0 4px 10px rgba(0,0,0,0.1)'
              : hoveredBtn === label
                ? '0 2px 6px rgba(0,0,0,0.05)'
                : 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onClick={() => {
          navigate(path);
          setActive(label);
          localStorage.setItem('active', label);
        }}
      >
        {label}
      </button>
    </li>
  );



  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f8' }}>
      {/* Sidebar */}
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
          zIndex: 900,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Scrollable content area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h3
            style={{
              marginBottom: 40,
              color: '#991b1b',
              fontSize: 22,
              fontWeight: 'bold',
              borderBottom: '2px solid #991b1b',
              paddingBottom: 10
            }}
          >
            Customer Panel
          </h3>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {sidebarBtn('View Restaurants', '/dashboard/customer')}
            {sidebarBtn('My Bookings', '/dashboard/customer/bookings')}
            {sidebarBtn('Checkout', '/dashboard/customer/checkout')}
          </ul>
        </div>

        {/* Fixed logout at the bottom */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #eee',
            background: '#fff',
          }}
        >
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/';
            }}
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
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#fff3e0')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
          >
            Logout
          </button>
        </div>
      </aside>



      {/* Main Section */}
      <main style={{
        flex: 1,
        padding: "32px 48px",
        background: '#f9f9fb',
        minHeight: '100vh',
        marginLeft: 280,
        borderTopLeftRadius: 24,
        borderBottomLeftRadius: 24,
        boxShadow: 'inset 0 0 0 rgba(0,0,0,0.03)',
        position: 'relative'
      }}>
        <Outlet />
      </main>
    </div>

  );
}

export default CustomerDashboard; 