import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token'); // Sprawdzenie tokena

  return user || token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
