import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

const RedirectAuthenticatedUser = ({ children }) => {
    const { isAuthenticated, user, isCheckingAuth, isLoading } = useAuthStore();

    // While auth is being verified or user profile is being fetched after login,
    // render nothing (App.jsx already shows LoadingScreen during isCheckingAuth).
    // The isLoading guard covers the brief gap after login where isAuthenticated
    // is true but user hasn't arrived yet — preventing the login page from flashing.
    if (isCheckingAuth || (isAuthenticated && isLoading)) {
        return null;
    }

    if (isAuthenticated && user) {
        // Not subscribed yet (or suspended) → always show the subscription flow first,
        // never the dashboard. Matches Google new-user behavior.
        if (user.subscription?.premium !== true) {
            return <Navigate to="/pricing" replace />;
        }
        if (user.interestTopic && user.interestTopic.length > 0) {
            return <Navigate to="/home" replace />;
        }
        return <Navigate to="/growth-zones" replace />;
    }

    return children ? children : <Outlet />;
};

export default RedirectAuthenticatedUser;
