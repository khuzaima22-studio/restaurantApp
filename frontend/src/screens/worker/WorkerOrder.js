import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';

const STATUS_OPTIONS = ['All', 'pending', 'completed'];

function WorkerOrder() {
    const { userData, branchId } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchOrders = async () => {
        if (!userData?.id) return;

        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/getOrder/${branchId}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                setOrders(data);
                console.log(data)
                setError('');
            } else {
                console.error('API did not return an array:', data);
                setOrders([]);
                setError('Failed to fetch orders: Invalid data format.');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setOrders([]);
            setError('Failed to fetch orders: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [userData]);

    // Filter orders by status
    const filteredorders = statusFilter === 'All'
        ? [...orders].sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return 0;
        })
        : orders.filter(b => b.status === statusFilter);








    const handleorderstatus = async (e, id, status) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/api/updateOrder', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, status }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }
            fetchOrders();
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: "The Order has been " + status,
                timer: 2000,
                showConfirmButton: false,
            })
        } catch (error) {
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
    }

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
            <div style={{ width: 700, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px #e3f0ff', padding: 40, minHeight: 500 }}>
                <h2 style={{ color: '#1976d2', marginBottom: 24, textAlign: 'center' }}>Restaurant orders</h2>

                {/* Status Filter Dropdown */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                    <label style={{ fontWeight: 500, marginRight: 8 }}>Filter by Status:</label>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}
                    >
                        {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                        ))}
                    </select>
                </div>

                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                {filteredorders.length === 0 && !loading && (
                    <p style={{ color: '#555', fontSize: 18, textAlign: 'center' }}>No orders found.</p>
                )}

                {!loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {filteredorders.map(b => (
                            <div
                                key={b._id}
                                style={{
                                    border: '1px solid #d0e7ff',
                                    borderRadius: 12,
                                    boxShadow: '0 4px 16px rgba(25, 118, 210, 0.08)',
                                    padding: 24,
                                    background: '#ffffff',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 10,
                                    marginBottom: 12
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, fontSize: 20, color: '#1976d2' }}>
                                        Order for Mr/Miss {b.user.name}
                                    </span>
                                    <span
                                        style={{
                                            fontWeight: 600,
                                            fontSize: 14,
                                            padding: '6px 12px',
                                            borderRadius: 20,
                                            color: '#fff',
                                            background: b.status === 'completed'
                                                ? '#28a745'
                                                : b.status === 'pending'
                                                    ? '#ffc107'
                                                    : '#6c757d', // default/fallback

                                        }}
                                    >
                                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                                    </span>

                                </div>
                                <div style={{ color: '#333', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, }}>
                                    <span style={{ fontWeight: 500 }}>
                                        {b.Order.map((o, idx) => (
                                            <p key={idx} style={{ margin: 0 }}>
                                                {o.name} x {o.qty}
                                            </p>
                                        ))}</span>
                                    <span>{b.time}</span>
                                </div>

                                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={(e) => handleorderstatus(e, b._id, "completed")}
                                        disabled={b.status !== 'pending'}
                                        style={{
                                            backgroundColor: b.status !== 'pending' ? '#ccc' : '#28a745',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            cursor: b.status !== 'pending' ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        Mark as Cooked
                                    </button>


                                </div>
                            </div>
                        ))}

                    </div>
                )}
            </div>
        </>
    );
}

export default WorkerOrder;

