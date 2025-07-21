// src/utils/sockets.ts
import { io, Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:5000"; // Replace with your deployed backend URL

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
  if (!socket) {
    socket = io(SERVER_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => socket;
