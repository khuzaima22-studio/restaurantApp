import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
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
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();

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
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 12px 32px rgba(0,0,0,0.05)',
        padding: 48,
        minHeight: 500,
        fontFamily: 'Georgia, serif'
      }}>
        <ToastContainer />

        <h2 style={{
          color: '#991b1b',
          marginBottom: 32,
          textAlign: 'center',
          fontSize: 30,
          fontWeight: 'bold',
          borderBottom: '2px solid #991b1b',
          paddingBottom: 12
        }}>
          Restaurant Menu
        </h2>

        {error && <p style={{ color: '#c62828', textAlign: 'center' }}>{error}</p>}

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 32,
          justifyContent: 'center'
        }}>
          {menu.length === 0 && !loading && (
            <p style={{ color: '#777', fontSize: 18 }}>No menu items found.</p>
          )}

          {menu.map(item => (
            <div
              key={item._id}
              style={{
                width: 260,
                background: '#fdfaf7',
                borderRadius: 18,
                boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.2s ease',
              }}
            >
              <img
                src={item.image ? `https://restaurantapp-5mka.onrender.com/uploads/${item.image}` : '/No_Image_Available.jpg'}
                alt={item.name}
                style={{
                  width: 120,
                  height: 120,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  marginBottom: 14,
                  border: '3px solid #e0e0e0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              />
              <div style={{ fontWeight: 700, fontSize: 20, color: '#991b1b', marginBottom: 6 }}>{item.name}</div>
              <div style={{ color: '#888', fontSize: 15, fontStyle: 'italic', marginBottom: 6 }}>{item.category}</div>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#444', marginBottom: 14 }}>${item.price}</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <input
                  type="number"
                  min={1}
                  value={quantities[item._id] || 1}
                  onChange={e => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                  style={{
                    width: 52,
                    padding: 6,
                    borderRadius: 8,
                    border: '1px solid #ccc',
                    textAlign: 'center',
                    fontWeight: 500
                  }}
                />
                <button
                  onClick={() => handleAddToCart(item, quantities[item._id] || 1)}
                  style={{
                    background: '#991b1b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {menu.length > 0 && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleCheckout}
              style={{
                marginTop: 40,
                padding: '14px 40px',
                background: cart.length ? '#991b1b' : '#bbb',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 18,
                cursor: cart.length ? 'pointer' : 'not-allowed',
                transition: 'background 0.3s ease',
              }}
              disabled={cart.length === 0}
            >
              Go to Checkout
            </button>
          </div>
        )}
      </div>

    </>
  );
}

export default RestaurantMenu; 