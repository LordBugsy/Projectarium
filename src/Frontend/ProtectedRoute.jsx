import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { localUserId, localUsername } = useSelector((state) => state.user.user);

  if (localUsername.trim() === "" || localUserId === "") return <Navigate to="/" />;
  
  // if username is set, allow access to the requested page
  return children;
};

export default ProtectedRoute;