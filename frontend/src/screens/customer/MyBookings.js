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
    fetch(`http://localhost:3001/api/getUserBooking/${userData.id}`)
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
    <div style={{
      maxWidth: 780,
      margin: '0 auto',
      background: '#ffffff',
      borderRadius: 24,
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.06)',
      padding: 48,
      minHeight: 500,
      fontFamily: 'Georgia, serif',
    }}>
      <h2 style={{
        color: '#991b1b',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 36,
        textAlign: 'center',
        borderBottom: '2px solid #991b1b',
        paddingBottom: 12
      }}>
        My Bookings
      </h2>

      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        }}>
          <ClipLoader color="#991b1b" />
        </div>
      )}

      {error && (
        <p style={{ color: '#c62828', textAlign: 'center', fontSize: 16 }}>{error}</p>
      )}

      {bookings.length === 0 && !loading && (
        <p style={{ color: '#777', fontSize: 18, textAlign: 'center' }}>
          No bookings found.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {bookings.map(b => {
          const statusColors = {
            approved: '#388e3c',
            rejected: '#d32f2f',
            expired: '#757575',
            pending: '#f9a825',
            completed: '#1976d2'
          };

          return (
            <div
              key={b._id}
              style={{
                background: '#fcfcfc',
                border: '1px solid #f0f0f0',
                borderLeft: `5px solid ${statusColors[b.status.toLowerCase()] || '#ccc'}`,
                borderRadius: 16,
                boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
                padding: 28,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {/* Status Badge */}
              <span style={{
                position: 'absolute',
                top: 18,
                right: 20,
                background: statusColors[b.status.toLowerCase()] || '#ccc',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: 20,
                textTransform: 'capitalize',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}>
                {b.status}
              </span>

              {/* Heading */}
              <div style={{
                fontWeight: 'bold',
                fontSize: 22,
                color: '#991b1b',
              }}>
                Booking for {b.seats} {b.seats > 1 ? 'Seats' : 'Seat'}
              </div>

              {/* Date & Time */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                color: '#333',
                fontSize: 15,
              }}>
                <span><strong>Date:</strong> {new Date(b.date).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}</span>
                <span><strong>Time:</strong> {b.time}</span>
              </div>

              {/* Booker Info */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                color: '#555',
                fontSize: 15,
              }}>
                <span><strong>Booker:</strong> {b.name}</span>
                <span><strong>Phone:</strong> {b.phone}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>


  );
}

export default MyBookings; 