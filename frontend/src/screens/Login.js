import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../context/AuthContext.js';

const roles = ['Customer', 'Manager', 'Admin', 'head branch manager', 'worker'];

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(roles[0]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated, userData } = useAuth();

  // Redirect after login based on role
  useEffect(() => {
    if (isAuthenticated() && userData && userData.role) {
      if (userData.role === 'customer') {
        navigate('/dashboard/customer');
      } else if (userData.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (userData.role === 'manager' || userData.role === 'branch manager') {
        navigate('/dashboard/manager');
      } else if (userData.role === 'head branch manager') {
        navigate('/dashboard/head-branch-manager');
      } else if (userData.role === 'worker') {
        navigate('/dashboard/worker');
      }
    }
  }, [isAuthenticated, userData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://restaurantapp-5mka.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      setLoading(false);

      Swal.fire({
        icon: 'success',
        title: "Success",
        text: "Login Successful",
        timer: 2000,
        showConfirmButton: false,
      })

      // Store token and IDs in localStorage for authentication
      login(data.token, data.managerId, data.branchId);
      // Also store in userData for context
      if (data.managerId && data.branchId) {
        localStorage.setItem('managerId', data.managerId);
        localStorage.setItem('branchId', data.branchId);
      }
      // Navigation is now handled by useEffect
    } catch (error) {
      console.error('Error during login:', error);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.message,
        showConfirmButton: false,
        timer: 2000
      });

    }
    finally {
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
      <div className={styles.loginBg}>
        <div className={styles.loginContainer}>
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Email:</label>
              <input type="text" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label>Password:</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div>
              <label>Role:</label>
              <select value={role} onChange={e => setRole(e.target.value)}>
                {roles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button type="submit">Login</button>
          </form>
          <button className={styles.switchBtn} onClick={() => navigate('/signup')}>
            Don't have an account? Signup
          </button>
        </div>
      </div>
    </>
  );
}

export default Login; 