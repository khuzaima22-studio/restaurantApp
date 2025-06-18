import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClipLoader } from 'react-spinners';

function MyBookings() {
  const { userData } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userData?.id) return;
    setLoading(true);
    fetch(`https://restaurantapp-5mka.onrender.com/api/getUserBooking/${userData.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBookings(data);
        } else {
          console.error('API did not return an array:', data);
          setError('Failed to fetch bookings: Invalid data format.');
          setBookings([]); // Ensure bookings is an empty array
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError('Failed to fetch bookings: ' + err.message);
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, [userData]);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px #e3f0ff', padding: 40, minHeight: 500 }}>
      <h2 style={{ color: '#1976d2', marginBottom: 24, textAlign: 'center' }}>My Bookings</h2>
      {loading && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}><ClipLoader color="#1976d2" /></div>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {bookings.length === 0 && !loading && <p style={{ color: '#555', fontSize: 18, textAlign: 'center' }}>No bookings found.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {bookings.map(b => (
          <div key={b._id} style={{ border: '1px solid #d0e7ff', borderRadius: 12, boxShadow: '0 4px 16px rgba(25, 118, 210, 0.08)', padding: 24, background: '#ffffff', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 20, color: '#1976d2' }}>
                Booking for {b.seats} {b.seats > 1 ? 'Seats' : 'Seat'}
              </span>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  padding: '6px 12px',
                  borderRadius: 20,
                  color: '#fff',
                  background: b.status === 'completed' ? '#4CAF50' : '#FFC107', // Green for completed, Amber for pending
                }}
              >
                {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
              </span>
            </div>
            <div style={{ color: '#333', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>Date:</span>
              <span>{new Date(b.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span style={{ margin: '0 8px', color: '#bbb' }}>|</span>
              <span style={{ fontWeight: 500 }}>Time:</span>
              <span>{b.time}</span>
            </div>
            <div style={{ color: '#555', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>Booker:</span>
              <span>{b.name}</span>
              <span style={{ margin: '0 8px', color: '#bbb' }}>|</span>
              <span style={{ fontWeight: 500 }}>Phone:</span>
              <span>{b.phone}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyBookings; 