import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';

const STATUS_OPTIONS = ['All', 'pending', 'approved', 'rejected', 'expired'];

function ManagerBookings() {
  const { userData, branchId } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchBranchBookings = async () => {
    if (!userData?.id) return;

    setLoading(true);
    try {
      const res = await fetch(`https://restaurantapp-5mka.onrender.com/api/getBranchBooking/${branchId}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setBookings(data);
        setError('');
      } else {
        console.error('API did not return an array:', data);
        setBookings([]);
        setError('Failed to fetch bookings: Invalid data format.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setBookings([]);
      setError('Failed to fetch bookings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchBookings();
  }, [userData]);

  // Filter bookings by status
  const filteredBookings = statusFilter === 'All'
    ? bookings
    : bookings.filter(b => b.status === statusFilter);

  // Group bookings by formatted date
  const groupedBookings = filteredBookings.reduce((acc, booking) => {
    const dateKey = new Date(booking.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(booking);
    return acc;
  }, {});

  const handleBookingStatus = async (e, id, status) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('https://restaurantapp-5mka.onrender.com/api/updateBooking', {
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
      fetchBranchBookings();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: "The Booking has been " + status,
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
        <h2 style={{ color: '#1976d2', marginBottom: 24, textAlign: 'center' }}>Restaurant Bookings</h2>

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

        {filteredBookings.length === 0 && !loading && (
          <p style={{ color: '#555', fontSize: 18, textAlign: 'center' }}>No bookings found.</p>
        )}

        {!loading && Object.keys(groupedBookings).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {Object.entries(groupedBookings).map(([date, bookingsOnDate]) => (
              <div key={date}>
                <h3 style={{ color: '#1976d2', marginTop: 20, marginBottom: 12 }}>{date}</h3>
                {bookingsOnDate.map(b => (
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
                        Booking for {b.seats} {b.seats > 1 ? 'Seats' : 'Seat'}
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          padding: '6px 12px',
                          borderRadius: 20,
                          color: '#fff',
                          background:
                            b.status === 'approved'
                              ? '#28a745' // green
                              : b.status === 'rejected'
                                ? '#F44336' // Red
                                : b.status === 'pending'
                                  ? '#FFC107' // Amber
                                  : b.status === 'completed'
                                    ? '#4CAF50' // Green
                                    : b.status === 'expired'
                                      ? '#9E9E9E' // Grey
                                      : '#607D8B',
                        }}
                      >
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>

                    </div>
                    <div style={{ color: '#333', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
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
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => handleBookingStatus(e, b._id, "approved")}
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
                        Approve
                      </button>

                      <button
                        onClick={(e) => handleBookingStatus(e, b._id, "rejected")}
                        disabled={b.status !== 'pending'}
                        style={{
                          backgroundColor: b.status !== 'pending' ? '#ccc' : '#F44336',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: b.status !== 'pending' ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default ManagerBookings;
