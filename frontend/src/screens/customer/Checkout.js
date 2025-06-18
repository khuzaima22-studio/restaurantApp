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
            const response = await fetch("https://restaurantapp-5mka.onrender.com/api/addOrder", {
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
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '40px',
                    minHeight: '70vh',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        maxWidth: '1000px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        background: '#fff',
                        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    }}
                >
                    {/* Left Side - Cart Items */}
                    <div style={{ flex: 2, padding: '30px' }}>
                        <h2 style={{ fontSize: '22px', marginBottom: '25px' }}>Shopping Cart.</h2>

                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5' }}>
                                    <th style={{ padding: 10, border: '1px solid #eee' }}>Name</th>
                                    <th style={{ padding: 10, border: '1px solid #eee' }}>Quantity</th>
                                    <th style={{ padding: 10, border: '1px solid #eee' }}>Price</th>
                                    <th style={{ padding: 10, border: '1px solid #eee' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map(item => (
                                    <tr key={item.id}>
                                        <td style={{ padding: 10, border: '1px solid #eee', textAlign: "center" }}>
                                            {item.item.name}
                                        </td>


                                        <td style={{ padding: 10, border: '1px solid #eee' }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: 8
                                            }}>
                                                <button onClick={() => handleQtyChange(item.item._id, Math.max(1, item.qty - 1))}>−</button>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={item.qty}
                                                    onChange={e => handleQtyChange(item.item._id, Math.max(1, parseInt(e.target.value) || 1))}
                                                    style={{ width: 48, padding: 4, borderRadius: 6, border: '1px solid #b6c6e3', textAlign: 'center' }}
                                                />
                                                <button onClick={() => handleQtyChange(item.item._id, item.qty + 1)}>+</button>
                                            </div>
                                        </td>


                                        <td style={{ padding: 10, border: '1px solid #eee', textAlign: "center" }}>{item.item.price * item.qty}</td>

                                        <td style={{ padding: 10, border: '1px solid #eee', textAlign: "center" }}>
                                            <button
                                                onClick={() => handleRemoveFromCart(item.item)}
                                                style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer' }}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>


                    {/* Right Side - Summary */}
                    <div
                        style={{
                            flex: 1,
                            background: '#fafafa',
                            borderLeft: '1px solid #eee',
                            padding: '30px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                        }}
                    >
                        <h3 style={{ fontSize: '18px', marginBottom: '25px' }}>Summary</h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>Subtotal:</span>
                            <span>${total}</span>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '12px',
                                color: '#888',
                                marginBottom: '10px',
                            }}
                        >
                            <span>Tax:</span>
                            <span>Free</span>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                marginTop: '10px',
                            }}
                        >
                            <span>Total:</span>
                            <span>${total}</span>
                        </div>

                        {/* Spacer to push button down */}
                        <div style={{ flex: 1 }}></div>

                        <button
                            onClick={handleConfirmOrder}
                            style={{
                                width: '100%',
                                padding: '12px 0',
                                background: '#388e3c',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: 600,
                                fontSize: 16,
                                cursor: 'pointer',
                                marginTop: 18,
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

export default Checkout;

