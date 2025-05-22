import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const PublicRoutes = () => {
  const { isAuthenticated } = useAuthStore();

  // Redirect authenticated users to home page if they try to access public routes
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default PublicRoutes; 