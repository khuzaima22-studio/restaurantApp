import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../../context/AuthContext';

const Checkout = () => {
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem("cart");
        try {
            return saved ? JSON.parse(saved) : [];
        } catch {
            localStorage.removeItem("cart");
            return [];
        }
    });
    const branchId = localStorage.getItem("branchId")
    const navigate = useNavigate();
    const { userData } = useAuth()


    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
        console.log(cart)
    }, [cart]);

    const handleQtyChange = (item, qty) => {
        setCart(prev => prev.map(ci => ci.item._id === item ? { ...ci, qty: qty } : ci));
    };

    const handleRemoveFromCart = (item) => {
        setCart(prev => prev.filter(ci => ci.item._id !== item._id));
    };
    const total = cart.reduce((sum, ci) => sum + (ci.item.price || 0) * ci.qty, 0);


    const handleConfirmOrder = async () => {
        console.log(cart);

        try {
            if (cart.length === 0) {
                throw new Error("Cart is Empty");
            }
            setLoading(true);
            // console.log(userData)/
            const response = await fetch("http://localhost:3001/api/addOrder", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userData.id, total, branchId: branchId, cart }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            Swal.fire({
                icon: "success",
                title: "Order Placed",
                text: "You can pick your order from the branch.",
                timer: 2000,
                showConfirmButton: false
            })

            setCart([]);
            localStorage.setItem("cart", JSON.stringify(cart));
            localStorage.setItem("active", "View Restaurants")
            setTimeout(() => navigate("/dashboard/customer"), 2000)

        } catch (error) {
            console.error("Error during add:", error);
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
            <div style={{
                background: '#fefefe',
                padding: '50px 20px',
                display: 'flex',
                justifyContent: 'center',
                fontFamily: 'Georgia, serif',
            }}>
                <div style={{
                    display: 'flex',
                    maxWidth: '1100px',
                    width: '100%',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    background: '#ffffff',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.07)',
                    border: '1px solid #ddd',
                }}>

                    {/* Cart Table */}
                    <div style={{ flex: 2, padding: '40px' }}>
                        <h2 style={{
                            fontSize: '30px',
                            fontWeight: 'bold',
                            color: '#991b1b',
                            borderBottom: '2px solid #991b1b',
                            paddingBottom: 12,
                            marginBottom: 32,
                        }}>
                            Shopping Cart
                        </h2>

                        {cart.length > 0 ? (
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                borderRadius: 12,
                                overflow: 'hidden',
                            }}>
                                <thead style={{ background: '#f9f9f9', color: '#222' }}>
                                    <tr>
                                        <th style={thStyle}>Name</th>
                                        <th style={thStyle}>Quantity</th>
                                        <th style={thStyle}>Price</th>
                                        <th style={thStyle}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map(item => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={tdStyle}>{item.item.name}</td>
                                            <td style={tdStyle}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                }}>
                                                    <button onClick={() => handleQtyChange(item.item._id, Math.max(1, item.qty - 1))} style={qtyBtn}>−</button>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={item.qty}
                                                        onChange={e => handleQtyChange(item.item._id, Math.max(1, parseInt(e.target.value) || 1))}
                                                        style={qtyInput}
                                                    />
                                                    <button onClick={() => handleQtyChange(item.item._id, item.qty + 1)} style={qtyBtn}>+</button>
                                                </div>
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: 600 }}>${item.item.price * item.qty}</td>
                                            <td style={tdStyle}>
                                                <button onClick={() => handleRemoveFromCart(item.item)} style={removeBtn}>
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ color: '#666' }}>Your cart is empty.</p>
                        )}
                    </div>

                    {/* Summary */}
                    <div style={{
                        flex: 1,
                        background: '#fdfdfd',
                        padding: '40px',
                        borderLeft: '1px solid #eee',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <h3 style={{
                            fontSize: 22,
                            fontWeight: 700,
                            marginBottom: 24,
                            color: '#991b1b',
                            borderBottom: '1px solid #ddd',
                            paddingBottom: 10,
                        }}>
                            Summary
                        </h3>

                        <div style={summaryRow}><span>Subtotal:</span><span>${total}</span></div>
                        <div style={summaryRow}><span>Tax:</span><span>Free</span></div>
                        <div style={{ ...summaryRow, fontWeight: 700, fontSize: 18, marginTop: 16 }}><span>Total:</span><span>${total}</span></div>

                        <div style={{ flex: 1 }}></div>

                        <button
                            onClick={handleConfirmOrder}
                            disabled={cart.length === 0}
                            style={{
                                marginTop: 30,
                                padding: '12px 0',
                                width: '100%',
                                background: cart.length === 0 ? '#aaa' : '#991b1b',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: 600,
                                fontSize: 16,
                                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                                transition: 'background 0.3s',
                            }}
                        >
                            Confirm Order
                        </button>
                    </div>
                </div>
            </div>


        </>
    );
};

const thStyle = {
    padding: 14,
    fontWeight: 600,
    fontSize: 15,
    textAlign: 'center',
    borderBottom: '2px solid #ddd',
};

const tdStyle = {
    padding: 14,
    textAlign: 'center',
    fontSize: 15,
    color: '#333',
};

const qtyBtn = {
    padding: '6px 12px',
    fontSize: 16,
    background: '#fef2f2',
    border: '1px solid #e4e4e7',
    borderRadius: 6,
    cursor: 'pointer',
};

const qtyInput = {
    width: 50,
    padding: 6,
    textAlign: 'center',
    border: '1px solid #ccc',
    borderRadius: 6,
};

const removeBtn = {
    background: '#b91c1c',
    color: '#fff',
    padding: '6px 14px',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
};

const summaryRow = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
};


export default Checkout;

