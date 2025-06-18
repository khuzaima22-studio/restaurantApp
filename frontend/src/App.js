import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './screens/Login';
import Signup from './screens/Signup';
import CustomerDashboard from './screens/CustomerDashboard';
import AdminDashboard from './screens/AdminDashboard';
import ManagerDashboard from './screens/ManagerDashboard';
import WorkerDashboard from "./screens/WorkerDashboard";
import WorkerOrder from './screens/worker/WorkerOrder';
import HeadBranchManagerDashboard from './screens/headBranchManager/HeadBranchManagerDashboard';
import HeadBranchRevenueOverview from './screens/headBranchManager/HeadBranchRevenueOverview';
import HeadBranchMonthlyGraph from './screens/headBranchManager/HeadBranchMonthlyGraph';
import ApproveUsers from './screens/admin/ApproveUsers';
import ManageUsers from './screens/admin/ManageUsers';
import AddRestaurant from './screens/admin/AddRestaurant';
import ManageRestaurants from './screens/admin/ManageRestaurants';
import ManagerRevenue from './screens/manager/ManagerRevenue';
import ManagerMenu from './screens/manager/ManagerMenu';
import ManagerBookings from './screens/manager/ManagerBookings';
import RestaurantMenu from './screens/customer/RestaurantMenu';
import ViewRestaurants from './screens/customer/ViewRestaurants';
import MyBookings from './screens/customer/MyBookings';
import './App.css';
import { useAuth } from './context/AuthContext';
import Checkout from './screens/customer/Checkout';

function getUserRoleFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch {
    return null;
  }
}

function ProtectedRoute({ children, requiredRole }) {
  const { logout, isAuthenticated } = useAuth();
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const role = getUserRoleFromToken();

  if (role !== requiredRole) {
    logout();
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard/customer" element={<ProtectedRoute requiredRole="customer"><CustomerDashboard /></ProtectedRoute>}>
          <Route index element={<ViewRestaurants />} />
          <Route path="restaurant/:id" element={<RestaurantMenu />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="checkout" element={<Checkout />} />
        </Route>
        <Route path="/dashboard/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>}>
          <Route path="manage" element={<ManageUsers />} />
          <Route path="add-restaurant" element={<AddRestaurant />} />
          <Route path="manage-restaurants" element={<ManageRestaurants />} />
        </Route>
        <Route path="/dashboard/manager" element={<ProtectedRoute requiredRole="manager"><ManagerDashboard /></ProtectedRoute>}>
          <Route path="menu" element={<ManagerMenu />} />
          <Route path="bookings" element={<ManagerBookings />} />
        </Route>
        <Route path="/dashboard/head-branch-manager" element={<ProtectedRoute requiredRole="head branch manager"><HeadBranchManagerDashboard /></ProtectedRoute>}>
          <Route index element={<HeadBranchRevenueOverview />} />
          <Route path="revenue" element={<HeadBranchRevenueOverview />} />
          <Route path="graph" element={<HeadBranchMonthlyGraph />} />
        </Route>
        <Route path="/dashboard/worker" element={<ProtectedRoute requiredRole="worker"><WorkerDashboard /></ProtectedRoute>}>
          <Route index element={<WorkerOrder />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
