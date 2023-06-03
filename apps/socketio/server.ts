import http from "http";
import { Server } from "socket.io";

// -- Create socketio server -- //
const server = http.createServer();
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected");
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});