import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from '../../context/AuthContext';
import { ClipLoader } from 'react-spinners';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function HeadBranchMonthlyGraph() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchGraphData = async () => {
      if (!userData || userData.role !== 'head branch manager') {
        setError('Access Denied: You are not authorized to view this page.');
        setLoading(false);
        return;
      }

      try {
        const branchesRes = await fetch('https://restaurantapp-5mka.onrender.com/api/getBranches');
        if (!branchesRes.ok) throw new Error('Failed to fetch branches');
        const branchesData = await branchesRes.json();

        const monthlyRevenue = {};

        for (const branch of branchesData) {
          const ordersRes = await fetch(`https://restaurantapp-5mka.onrender.com/api/getOrder/${branch._id}`);
          if (!ordersRes.ok) throw new Error(`Failed to fetch orders for branch ${branch.name}`);
          const ordersData = await ordersRes.json();

          if (Array.isArray(ordersData)) {
            ordersData.forEach(order => {
              const date = new Date(order.createdAt);
              const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              if (!monthlyRevenue[branch._id]) {
                monthlyRevenue[branch._id] = {};
              }
              monthlyRevenue[branch._id][month] =
                (monthlyRevenue[branch._id][month] || 0) + order.paid;
            });
          }
        }

        const allMonths = Array.from(new Set(Object.values(monthlyRevenue).flatMap(Object.keys))).sort();

        const datasets = branchesData.map((branch, index) => {
          const color = `hsl(${(index * 137 + 50) % 360}, 70%, 50%)`;
          return {
            label: branch.name,
            data: allMonths.map(month => monthlyRevenue[branch._id]?.[month] || 0),
            borderColor: color,
            backgroundColor: color,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
          };
        });

        setChartData({
          labels: allMonths,
          datasets: datasets,
        });

      } catch (err) {
        console.error('Error fetching graph data:', err);
        setError(`Failed to load graph data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [userData]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 14,
          padding: 12,
        },
      },
      title: {
        display: true,
        text: '📊 Monthly Revenue Per Branch',
        font: {
          size: 22,
          weight: 'bold',
        },
        padding: {
          top: 20,
          bottom: 30,
        },
        color: '#1976d2',
      },
      tooltip: {
        backgroundColor: '#ffffff',
        borderColor: '#1976d2',
        borderWidth: 1,
        titleColor: '#1976d2',
        bodyColor: '#333',
        padding: 10,
        bodyFont: { size: 14 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '500px',
      }}>
        <ClipLoader color="#1976d2" size={45} />
        <p style={{ marginTop: 15, fontSize: 18, color: '#555' }}>Loading Monthly Revenue Graph...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        color: 'red',
        fontSize: 18,
        marginTop: 50
      }}>{error}</div>
    );
  }

  return (
    <div style={{
      padding: '30px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      {chartData.labels.length > 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          padding: '40px',
        }}>
          <Line options={options} data={chartData} />
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#888' }}>No revenue data available to display a graph.</p>
      )}
    </div>
  );
}

export default HeadBranchMonthlyGraph;
