import { io } from "socket.io-client";

const socketUrl =
  import.meta.env.VITE_SOCKET_URL?.replace(/\/$/, "") ||
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

export const socket = io(socketUrl, {
  autoConnect: false,
  withCredentials: true,
});

export function connectSocket(token) {
  if (!token) return;
  socket.auth = { token };
  if (!socket.connected) socket.connect();
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect();
}

