import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

function ViewRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
    // eslint-disable-next-line
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://restaurantapp-5mka.onrender.com/api/getBranches');
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      setError('Failed to fetch restaurants');
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
      <div>
        <h2 style={{ color: '#1976d2', marginBottom: 24 }}>All Restaurants</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {restaurants.map(r => (
            <div
              key={r._id || r.id}
              style={{ width: 280, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e3f0ff', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => navigate(`/dashboard/customer/restaurant/${r._id}`)}
            >
              <img
                src={r.image ? `https://restaurantapp-5mka.onrender.com/uploads/${r.image}` : '/No_Image_Available.jpg'}
                alt={r.name}
                style={{ width: 220, height: 120, objectFit: 'contain', borderRadius: 8, marginBottom: 12 }}
              />
              <h3 style={{ color: '#1976d2', marginBottom: 8 }}>{r.name}</h3>
              <p style={{ color: '#555', marginBottom: 4 }}>{r.address}</p>
              <p style={{ color: '#888', fontSize: 15 }}>{r.cuisines && r.cuisines.join(', ')}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default ViewRestaurants; 