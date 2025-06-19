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
      const res = await fetch(`http://localhost:3001/api/getBranchBooking/${branchId}`);
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
      const response = await fetch('http://localhost:3001/api/updateBooking', {
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
      <div style={{
        width: 780,
        margin: '40px auto',
        background: '#fffaf5',
        borderRadius: 20,
        boxShadow: '0 4px 32px rgba(181, 81, 63, 0.25)',
        padding: 48,
        fontFamily: 'Georgia, serif',
        border: '1px solid #f1e0d6'
      }}>
        <h2 style={{
          color: '#8B0000',
          marginBottom: 32,
          textAlign: 'center',
          fontSize: 32,
          letterSpacing: 1,
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          Restaurant Bookings
        </h2>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <label style={{ fontWeight: 600, marginRight: 10 }}>Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #ccc',
              fontSize: 15,
              fontFamily: 'inherit'
            }}
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {filteredBookings.length === 0 && !loading && (
          <p style={{ color: '#333', fontSize: 18, textAlign: 'center', fontStyle: 'italic' }}>
            No bookings found.
          </p>
        )}

        {!loading && Object.keys(groupedBookings).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {Object.entries(groupedBookings).map(([date, bookingsOnDate]) => (
              <div key={date}>
                <h3 style={{
                  color: '#A52A2A',
                  marginTop: 24,
                  marginBottom: 16,
                  fontSize: 20,
                  borderBottom: '1px solid #e4cfc3',
                  paddingBottom: 4
                }}>
                  {date}
                </h3>

                {bookingsOnDate.map(b => (
                  <div key={b._id} style={{
                    border: '1px solid #f1d0c2',
                    borderRadius: 14,
                    boxShadow: '0 4px 12px rgba(139, 0, 0, 0.08)',
                    padding: 28,
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    marginBottom: 16
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontWeight: 700,
                        fontSize: 20,
                        color: '#3e1f1f'
                      }}>
                        Booking for {b.seats} {b.seats > 1 ? 'Seats' : 'Seat'}
                      </span>
                      <span style={{
                        fontWeight: 600,
                        fontSize: 14,
                        padding: '6px 14px',
                        borderRadius: 20,
                        color: '#fff',
                        background:
                          b.status === 'approved' ? '#28a745'
                            : b.status === 'rejected' ? '#c62828'
                              : b.status === 'pending' ? '#d17f00'
                                : b.status === 'completed' ? '#388e3c'
                                  : '#9e9e9e',
                        textTransform: 'capitalize'
                      }}>
                        {b.status}
                      </span>
                    </div>

                    <div style={{ color: '#333', fontSize: 16 }}>
                      <strong>Time:</strong> {b.time}
                    </div>

                    <div style={{ color: '#555', fontSize: 15 }}>
                      <strong>Booker:</strong> {b.name}
                      <span style={{ margin: '0 8px', color: '#bbb' }}>|</span>
                      <strong>Phone:</strong> {b.phone}
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={(e) => handleBookingStatus(e, b._id, "approved")}
                        disabled={b.status !== 'pending'}
                        style={{
                          backgroundColor: b.status !== 'pending' ? '#ddd' : '#4CAF50',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '24px',
                          fontWeight: 600,
                          cursor: b.status !== 'pending' ? 'not-allowed' : 'pointer',
                          transition: '0.2s'
                        }}
                      >
                        Approve
                      </button>

                      <button
                        onClick={(e) => handleBookingStatus(e, b._id, "rejected")}
                        disabled={b.status !== 'pending'}
                        style={{
                          backgroundColor: b.status !== 'pending' ? '#ddd' : '#c62828',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '24px',
                          fontWeight: 600,
                          cursor: b.status !== 'pending' ? 'not-allowed' : 'pointer',
                          transition: '0.2s'
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
