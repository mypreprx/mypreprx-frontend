import { Navigate, Outlet } from 'react-router-dom';
import useAdminAuthStore from '../store/adminAuthStore';

const AdminProtectedRoute = () => {
    const { isAuthenticated } = useAdminAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};

export default AdminProtectedRoute;
