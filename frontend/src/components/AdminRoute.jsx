import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" />;
  }

  if (!user.verified) {
    // User is not verified, redirect to pending page
    return <Navigate to="/registration-pending" />;
  }

  if (user.role !== 'admin') {
    // User is not an admin, redirect to home page
    return <Navigate to="/" />;
  }

  // Authorized admin, render component
  return children;
};

export default AdminRoute; 