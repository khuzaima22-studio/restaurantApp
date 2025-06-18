import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [managerId, setManagerId] = useState(localStorage.getItem('managerId') || null);
  const [branchId, setBranchId] = useState(localStorage.getItem('branchId') || null);
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    const fetchUserData = async () => {
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('https://restaurantapp-5mka.onrender.com/api/verifyToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: storedToken }),
        });

        const data = await response.json();

        // console.log('Data from API:', response.data);
        setUserData(data.values);
      } catch (error) {
        console.error('API Error:', error);
        if (error.response && error.response.status === 401) {
          logout();
          setTimeout(() => {
            <Navigate to="/admin" replace />;
          }, 0);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLoggedIn]);

  const login = (token, managerId, branchId) => {
    localStorage.setItem('token', token);
    if (managerId) {
      localStorage.setItem('managerId', managerId);
      setManagerId(managerId);
    }
    if (branchId) {
      localStorage.setItem('branchId', branchId);
      setBranchId(branchId);
    }
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUserData(null);
    setIsLoggedIn(false);
    setManagerId(null);
    setBranchId(null);
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider
      value={{ userData, login, logout, isAuthenticated, setUserData, managerId, branchId, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
