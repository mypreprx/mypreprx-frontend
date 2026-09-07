import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.PROD
  ? 'https://api.mypreprx.com'
  : 'http://localhost:4001';

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

export default socket;
