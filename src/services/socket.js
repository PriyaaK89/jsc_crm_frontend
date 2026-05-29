import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"], 
});

// const socket = io("http://103.110.127.211:5001", {
//   transports: ["websocket"], 
// });

// Join admin room after connect
socket.on("connect", () => {
  console.log(" Connected to socket:", socket.id);

  socket.emit("joinAdmin");
});

export default socket;