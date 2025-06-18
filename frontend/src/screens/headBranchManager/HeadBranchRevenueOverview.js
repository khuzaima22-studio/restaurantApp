import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClipLoader } from 'react-spinners';

function HeadBranchRevenueOverview() {
  const { userData } = useAuth(); // Keep userData here as this component needs to fetch data
  const [branches, setBranches] = useState([]);
  const [branchOrders, setBranchOrders] = useState({});
  const [revenueData, setRevenueData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedBranchId, setExpandedBranchId] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // The role check can be moved to the parent dashboard component if it's a wrapper for all HBM routes
      // For now, keep it here to ensure data fetching is role-dependent.
      if (!userData || userData.role !== 'head branch manager') {
        setError('Access Denied: You are not authorized to view this page.');
        setLoading(false);
        return;
      }

      try {
        const branchesRes = await fetch('https://restaurantapp-5mka.onrender.com/api/getBranches');
        if (!branchesRes.ok) throw new Error('Failed to fetch branches');
        const branchesData = await branchesRes.json();
        setBranches(branchesData);

        const newRevenueData = {};
        const allBranchOrders = {};

        for (const branch of branchesData) {
          console.log(`Fetching orders for branch ID: ${branch._id} (${branch.name})`);
          const ordersRes = await fetch(`https://restaurantapp-5mka.onrender.com/api/getOrder/${branch._id}`);
          
          if (!ordersRes.ok) {
            const errorText = await ordersRes.text();
            console.error(`Failed to fetch orders for branch ${branch.name}. Status: ${ordersRes.status}, Response: ${errorText}`);
            newRevenueData[branch._id] = 0;
            allBranchOrders[branch._id] = [];
            continue;
          }
          const ordersData = await ordersRes.json();
          console.log(`Orders data for branch ${branch.name}:`, ordersData);

          let totalRevenue = 0;
          if (Array.isArray(ordersData)) {
            ordersData.forEach(order => {
              totalRevenue += order.paid;
            });
            allBranchOrders[branch._id] = ordersData;
          } else {
            console.warn(`Expected array for ordersData for branch ${branch.name}, but received:`, ordersData);
            allBranchOrders[branch._id] = [];
          }
          newRevenueData[branch._id] = totalRevenue;
        }
        setRevenueData(newRevenueData);
        setBranchOrders(allBranchOrders);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(`Failed to load dashboard data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userData]);

  const handleToggleOrders = (branchId) => {
    setExpandedBranchId(prevId => (prevId === branchId ? null : branchId));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
        <ClipLoader color="#1976d2" size={50} />
        <p style={{ marginLeft: 10, fontSize: 18, color: '#555' }}>Loading Revenue Overview...</p>
      </div>
    );
  }

  if (error) {
    return <div style={{ textAlign: 'center', color: 'red', fontSize: 18, marginTop: 50 }}>{error}</div>;
  }

  return (
    <div style={{ padding: 40, minHeight: 500 }}> {/* Removed max-width and margin auto here */}
      <h3 style={{ marginBottom: 20, color: '#333' }}>Branch Revenue Overview</h3>
      {branches.length === 0 && <p style={{ textAlign: 'center', color: '#555' }}>No branches found.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 40 }}>
        {branches.map(branch => (
          <div key={branch._id} style={{ border: '1px solid #d0e7ff', borderRadius: 12, boxShadow: '0 4px 16px rgba(25, 118, 210, 0.08)', padding: 20, background: '#ffffff' }}>
            <h4 style={{ color: '#1976d2', marginBottom: 10 }}>{branch.name}</h4>
            <p style={{ fontSize: 16, color: '#555' }}>
              Total Revenue: <span style={{ fontWeight: 'bold', color: '#388e3c' }}>${(revenueData[branch._id] || 0).toFixed(2)}</span>
            </p>
            <button
              onClick={() => handleToggleOrders(branch._id)}
              style={{
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 5,
                padding: '8px 15px',
                cursor: 'pointer',
                marginTop: 15,
                fontSize: 14,
              }}
            >
              {expandedBranchId === branch._id ? 'Hide Orders' : 'Show Orders'}
            </button>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: 20, color: '#333' }}>All Branch Orders</h3>
      {branches.length === 0 && <p style={{ textAlign: 'center', color: '#555' }}>No orders found for any branch.</p>}
      {
        branches.map(branch => (
          expandedBranchId === branch._id && branchOrders[branch._id] && branchOrders[branch._id].length > 0 ? (
            <div key={branch._id} style={{ marginBottom: 40, border: '1px solid #d0e7ff', borderRadius: 12, boxShadow: '0 4px 16px rgba(25, 118, 210, 0.08)', padding: 20, background: '#ffffff' }}>
              <h4 style={{ color: '#1976d2', marginBottom: 15 }}>Orders for {branch.name}</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: '10px', border: '1px solid #eee', textAlign: 'left' }}>Order ID</th>
                    <th style={{ padding: '10px', border: '1px solid #eee', textAlign: 'left' }}>User ID</th>
                    <th style={{ padding: '10px', border: '1px solid #eee', textAlign: 'left' }}>Total Amount Paid</th>
                    <th style={{ padding: '10px', border: '1px solid #eee', textAlign: 'left' }}>Order Date</th>
                  </tr>
                </thead>
                <tbody>
                  {branchOrders[branch._id].map(order => (
                    <tr key={order._id}>
                      <td style={{ padding: '10px', border: '1px solid #eee' }}>{order._id}</td>
                      <td style={{ padding: '10px', border: '1px solid #eee' }}>{order.user || 'N/A'}</td>
                      <td style={{ padding: '10px', border: '1px solid #eee' }}>
                        ${(order.paid || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #eee' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            expandedBranchId === branch._id && <p style={{ textAlign: 'center', color: '#555', marginBottom: 40 }}>No orders found for this branch.</p>
          )
        ))
      }
    </div>
  );
}

export default HeadBranchRevenueOverview; 