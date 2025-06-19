import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import Modal from '../../Modal.js';

function ViewRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [branchId, setBranchId] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveDetails, setReserveDetails] = useState({ date: '', time: '', seats: '', name: '', phone: '' });
  const [reserveError, setReserveError] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const currentTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const { userData } = useAuth();

  useEffect(() => {
    fetchRestaurants();
    // eslint-disable-next-line
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://restaurantapp-csbk.onrender.com/api/getBranches');
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      setError('Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    setReserveError('');
    console.log(userData)
    const now = new Date();
    const selectedDateTime = new Date(`${reserveDetails.date}T${reserveDetails.time}`);
    if (!reserveDetails.date || !reserveDetails.time) {
      setReserveError('Please select both date and time.');
      return;
    }
    if (selectedDateTime < now) {
      setReserveError('Date and time must be in the future.');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`https://restaurantapp-csbk.onrender.com/api/addBooking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reserveDetails, userId: userData.id, branchId: branchId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Your Seats have been Reserved successfully!',
        timer: 2000,
        showConfirmButton: false,
      });
      setShowReserveModal(false);
      setReserveDetails({ date: '', time: '', seats: '', name: '', phone: '' });

    }
    catch (error) {
      console.error("Error during edit:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }

  };


  return (
    <>
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent black
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <ClipLoader color="#ffffff" />
        </div>
      )}
      <div style={{ padding: '40px 20px', maxWidth: 1200, margin: 'auto' }}>
        <div style={{ marginBottom: 60, textAlign: "center" }}>
          <h1 style={{
            fontSize: 42,
            fontWeight: 700,
            color: '#2c2c2c',
            marginBottom: 8,
            fontFamily: '"Playfair Display", serif'
          }}>
            Welcome to My Restaurant
          </h1>
          <p style={{ fontSize: 18, color: '#666', fontStyle: 'italic' }}>
            Explore. Taste. Reserve.
          </p>
        </div>

        <h2 style={{ color: '#d84315', marginBottom: 32, fontSize: 28, fontWeight: 600 }}>All Restaurants</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
          {restaurants.map(r => (
            <div
              key={r._id || r.id}
              style={{
                width: 300,
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <img
                src={r.image ? `https://restaurantapp-csbk.onrender.com/uploads/${r.image}` : '/No_Image_Available.jpg'}
                alt={r.name}
                style={{ width: '100%', height: 180, objectFit: 'cover' }}
              />
              <div style={{ padding: 20, textAlign: 'center' }}>
                <h3 style={{ color: '#c62828', margin: '8px 0', fontSize: 22 }}>{r.name}</h3>
                <p style={{ color: '#757575', marginBottom: 4 }}>{r.address}</p>
                <p style={{ color: '#aaa', fontSize: 15 }}>{r.cuisines?.join(', ')}</p>
                <div style={{ display: "flex", flexDirection: 'column', gap: 10, marginTop: 16 }}>
                  <button
                    style={{
                      background: '#d84315',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: 15,
                      padding: '10px 0',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/dashboard/customer/restaurant/${r._id}`)}
                  >
                    🍽 Order Food
                  </button>
                  <button
                    style={{
                      background: '#2e7d32',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: 15,
                      padding: '10px 0',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setShowReserveModal(true);
                      setBranchId(r._id);
                    }}
                  >
                    📅 Reserve Booking
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reserve Modal */}

      <Modal isOpen={showReserveModal} onClose={() => setShowReserveModal(false)}>
        <form onSubmit={handleReserve} style={{ borderRadius: 12, padding: 16 }}>
          <h3 style={{ color: '#1976d2', marginBottom: 18 }}>Reserve Booking</h3>
          {reserveError && <div style={{ color: 'red', marginBottom: 10 }}>{reserveError}</div>}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 500 }}>Your Name:</label>
            <input type="text" value={reserveDetails.name} placeholder='John' onChange={e => setReserveDetails(d => ({ ...d, name: e.target.value }))} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #b6c6e3', marginTop: 4 }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500 }}>Phone Number:</label>
            <input
              type="tel"
              pattern="[0-9]{11}"   // adjust for your required length
              value={reserveDetails.phone}
              onChange={e => setReserveDetails(d => ({ ...d, phone: e.target.value }))}
              required
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #b6c6e3', marginTop: 4 }}
              placeholder='03XXXXXXXXX'
              minLength={11}
              maxLength={11}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 500 }}>Number of Seats:</label>
            <input type="number" min="1" placeholder='1' value={reserveDetails.seats} onChange={e => setReserveDetails(d => ({ ...d, seats: e.target.value }))} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #b6c6e3', marginTop: 4 }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 500 }}>Date:</label>
            <input
              type="date"
              value={reserveDetails.date}
              min={todayStr}
              onChange={e => setReserveDetails(d => ({ ...d, date: e.target.value, time: '' }))}
              required
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #b6c6e3', marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 500 }}>Time:</label>
            <input
              type="time"
              value={reserveDetails.time}
              min={reserveDetails.date === todayStr ? currentTimeStr : undefined}
              onChange={e => setReserveDetails(d => ({ ...d, time: e.target.value }))}
              required
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #b6c6e3', marginTop: 4 }}
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '10px 0', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer', marginTop: 10 }}>Book</button>
        </form>
      </Modal>

    </>
  );
}

export default ViewRestaurants; 