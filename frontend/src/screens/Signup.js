import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Signup.module.css';
import { ClipLoader } from "react-spinners"
import Swal from "sweetalert2"

const roles = ['Customer', 'Worker'];

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(roles[0]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(name);
    setLoading(true);
    try {
      const response = await fetch('https://restaurantapp-5mka.onrender.com/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);

      }
      setLoading(false);

      // console.log('Signup successful:');
      Swal.fire({
        icon: 'success',
        title: "Success",
        text: "Signup Successful",
        timer: 2000,
        showConfirmButton: false,

      })
      navigate("/")
      // You can redirect or show success message here
    } catch (error) {
      console.error('Error during signup:', error);
      if (error.message === 'Failed to fetch' || error.message === 'NetworkError when attempting to fetch resource.') {
        Swal.fire({
          icon: 'error',
          title: 'Server Not Responding',
          text: 'The server is not responding. Please try again later.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Signup Failed',
          text: error.message || 'An error occurred during signup.',
        });
      }
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

      <div className={styles.signupBg}>
        <div className={styles.signupContainer}>
          <h2>Signup</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Name:</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label>Email:</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label>Password:</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div>
              <label>Role:</label>
              <select value={role} onChange={e => setRole(e.target.value)}>
                {roles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button type="submit">Signup</button>
          </form>
          <button className={styles.switchBtn} onClick={() => navigate('/')}>
            Already have an account? Login
          </button>
        </div>
      </div>
    </>
  );
}

export default Signup; 