import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../../context/AuthContext.js';
import Swal from 'sweetalert2';
import Modal from '../../Modal.js';
import { ToastContainer, toast, Bounce } from 'react-toastify';

function RestaurantMenu() {
  const { id } = useParams(); // restaurant/branch id
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    console.log("saved", localStorage.getItem("cart"))

    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      localStorage.removeItem("cart");
      return [];
    }
  }); // [{item, qty}]
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [reserveDetails, setReserveDetails] = useState({ date: '', time: '', seats: '', name: '', phone: '' });
  const [reserveError, setReserveError] = useState('');
  const { userData } = useAuth();
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const currentTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  useEffect(() => {
    if (!id) return;
    localStorage.setItem("branchId", id)
    setLoading(true);
    fetch(`https://restaurantapp-5mka.onrender.com/api/getMenu/${id}`)
      .then(res => res.json())
      .then(data => setMenu(data.items || []))
      .catch(() => setError('Failed to fetch menu'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (showCheckoutModal && cart.length === 0) {
      setShowCheckoutModal(false);
    }
  }, [cart, showCheckoutModal]);

  const notify = () => {
    toast.success('Added to cart', {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  };

  const handleAddToCart = (item, qty) => {
    console.log(qty);
    setCart(prev => {
      const existing = prev.find(ci => ci.item._id === item._id);
      if (existing) {
        return prev.map(ci => ci.item._id === item._id ? { ...ci, qty: ci.qty + qty } : ci);
      } else {
        return [...prev, { item, qty }];
      }
    });
    notify();
  };


  const handleQuantityChange = (itemId, value) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: value
    }));
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
      const res = await fetch(`https://restaurantapp-5mka.onrender.com/api/addBooking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reserveDetails, userId: userData.id, branchId: id }),
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

  const handleCheckout = () => {
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("active", "Checkout")

    navigate("/dashboard/customer/checkout")
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
      <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px #e3f0ff', padding: 40, minHeight: 500, position: 'relative' }}>
        <ToastContainer />
        {/* Reserve Booking Button */}
        <button
          style={{ position: 'absolute', top: 32, right: 40, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, padding: '10px 24px', cursor: 'pointer', zIndex: 2 }}
          onClick={() => setShowReserveModal(true)}
        >
          Reserve Booking
        </button>
        <h2 style={{ color: '#1976d2', marginBottom: 24, textAlign: 'center' }}>Restaurant Menu</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, }}>
          {menu.length === 0 && !loading && <p>No menu items found.</p>}
          {menu.map(item => {
            return (
              <div key={item._id} style={{ width: 240, background: '#fafdff', borderRadius: 12, boxShadow: '0 2px 8px #e3f0ff', padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                <img
                  src={item.image ? `https://restaurantapp-5mka.onrender.com/uploads/${item.image}` : '/No_Image_Available.jpg'}
                  alt={item.name}
                  style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 80, marginBottom: 12, boxShadow: '0 1px 4px #b6c6e3' }}
                />
                <div style={{ fontWeight: 600, fontSize: 18, color: '#1976d2', marginBottom: 4 }}>{item.name}</div>
                <div style={{ color: '#888', fontSize: 15, marginBottom: 4 }}>{item.category}</div>
                <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 10 }}>${item.price}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <input
                    type="number"
                    min={1}
                    value={quantities[item._id] || 1}
                    onChange={e => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                    style={{ width: 48, padding: 4, borderRadius: 6, border: '1px solid #b6c6e3', textAlign: 'center' }}
                  />
                  <button
                    onClick={() => handleAddToCart(item, quantities[item._id] || 1)}
                    style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {menu.length > 0 && (
          <button
            onClick={handleCheckout}
            style={{ marginTop: 32, padding: '12px 32px', background: cart.length ? '#1976d2' : '#aaa', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 18, cursor: cart.length ? 'pointer' : 'not-allowed' }}
            disabled={cart.length === 0}
          >
            Go to Checkout
          </button>
        )}

        {/* Reserve Modal */}
        {showReserveModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={handleReserve} style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 2px 16px #1976d233', position: 'relative' }}>
              <button type="button" onClick={() => setShowReserveModal(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>&times;</button>
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
                <input type="number" min="1" value={reserveDetails.seats} onChange={e => setReserveDetails(d => ({ ...d, seats: e.target.value }))} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #b6c6e3', marginTop: 4 }} />
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
          </div>
        )}

      </div>
    </>
  );
}

export default RestaurantMenu; 