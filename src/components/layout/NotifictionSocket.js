
// export default socket;
import { io } from "socket.io-client";
const socket = io(import.meta.env.VITE_BASE_URL, {
  transports: ["websocket"], 
});

// Join admin room after connect
socket.on("connect", () => {
  console.log(" Connected to socket:", socket.id);

  socket.emit("joinAdmin");
});

export default socket;