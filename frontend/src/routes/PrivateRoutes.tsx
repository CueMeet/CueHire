import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import DemoOrganizationCheck from '@/components/Auth/DemoOrganizationCheck';

const PrivateRoutes = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DemoOrganizationCheck>
      <Outlet />
    </DemoOrganizationCheck>
  );
};

export default PrivateRoutes; 