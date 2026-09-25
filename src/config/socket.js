import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.PROD
  ? 'https://api.mypreprx.com'
  : 'http://localhost:4001';

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  auth: (cb) => {
    // Pass current token so the server can join room `user_{id}` for notifications
    cb({ token: localStorage.getItem('token') || '' });
  },
});

export default socket;
