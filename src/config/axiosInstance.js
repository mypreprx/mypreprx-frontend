import axios from 'axios';

const baseURL = import.meta.env.PROD
    ? 'https://api.mypreprx.com/api'
    : 'http://localhost:4001/api';

const api = axios.create({
    // Base URL for all API requests. Ensure this matches your backend server address.
    baseURL: baseURL,
    // Important: Sends cookies (like the JWT token) with every request.
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Attach Authorization header if token exists in localStorage (fixes session loss on tab change/refresh)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Routes that must never trigger the paywall redirect.
// /pricing, /secure-payment and /confirmation render <Home /> behind a blurred
// overlay, and Home calls premium endpoints — redirecting from there would loop.
const PAYWALL_EXEMPT = ['/pricing', '/secure-payment', '/confirmation', '/subscriptions'];

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response && error.response.status === 401) {
            if (error.response.data?.code === 'SESSION_INVALIDATED') {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('token');
                import('react-hot-toast').then(({ default: toast }) => {
                    toast.error("Session Invalidated: You have logged in from another device.", {
                        duration: 6000,
                        position: 'top-center',
                        style: {
                            background: '#f44336',
                            color: '#fff',
                            fontWeight: 'bold',
                        },
                    });
                });
                
                // Optional: Force a small delay so the user sees the toast before reload/redirect
                setTimeout(() => {
                    const currentPath = window.location.pathname;
                    if (!currentPath.includes('/login')) {
                        if (currentPath.startsWith('/admin')) {
                            window.location.href = '/admin/login';
                        } else {
                            window.location.href = '/login';
                        }
                    }
                }, 2000);
            } else {
                console.error("Unauthorized access, possibly token expired.");
            }
        }

        // Backend paywall rejected the request. Entitlement is only revoked by
        // Stripe webhooks, so send the user back to the pricing flow.
        if (error.response && error.response.status === 402
            && error.response.data?.code === 'SUBSCRIPTION_REQUIRED') {
            const currentPath = window.location.pathname;
            const isExempt = PAYWALL_EXEMPT.some(
                (p) => currentPath === p || currentPath.startsWith(`${p}/`)
            );
            if (!isExempt) {
                window.location.href = '/pricing';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
