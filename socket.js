const Room = require("./models/Room");

let usersInRoom = {}; // roomId: [{ socketId, user }]

function emitPublicRooms(io) {
  const publicRooms = [];

  for (const [roomId, users] of Object.entries(usersInRoom)) {
    const room = usersInRoom[roomId];
    const hostName = room[0]?.user?.name || "Unknown";

    const isPrivate = false; // Assume public unless stored in DB
    if (!isPrivate) {
      publicRooms.push({
        roomId,
        host: hostName,
        users: room.length,
      });
    }
  }

  io.emit("public-rooms", publicRooms);
}

module.exports = function (io) {
  io.on("connection", (socket) => {
    // User joins a room
    socket.on("join-room", ({ roomId, user }) => {
      socket.join(roomId);

      if (!usersInRoom[roomId]) usersInRoom[roomId] = [];
      usersInRoom[roomId].push({ socketId: socket.id, user });

      const users = usersInRoom[roomId].filter((u) => u.socketId !== socket.id);
      socket.emit("all-users", users.map(u => ({
        socketId: u.socketId,
        user: u.user  // <-- important
         })));
      

      socket.to(roomId).emit("user-joined", {
        signal: null,
        callerID: socket.id,
        user,
      });

      emitPublicRooms(io); // 💥 Update lobby
    });

    // WebRTC signaling
    socket.on("sending-signal", ({ userToSignal, callerID, signal }) => {
      io.to(userToSignal).emit("user-joined", { signal, callerID });
    });

    socket.on("returning-signal", ({ signal, callerID }) => {
      io.to(callerID).emit("receiving-returned-signal", {
        signal,
        id: socket.id,
      });
    });

    // User leaves a room
    socket.on("leave-room", ({ roomId }) => {
      socket.leave(roomId);
      if (usersInRoom[roomId]) {
        usersInRoom[roomId] = usersInRoom[roomId].filter(
          (u) => u.socketId !== socket.id
        );
        io.to(roomId).emit("room-users", usersInRoom[roomId]);
        emitPublicRooms(io);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      for (let roomId in usersInRoom) {
        usersInRoom[roomId] = usersInRoom[roomId].filter(
          (u) => u.socketId !== socket.id
        );
        io.to(roomId).emit("room-users", usersInRoom[roomId]);
      }
      emitPublicRooms(io);
    });

    // Raise/lower hand
    socket.on("raise-hand", ({ roomId, user, status }) => {
      io.to(roomId).emit("user-raised-hand", {
        peerID: socket.id,
        status,
      });
    });

    // Mute/unmute audio
    socket.on("mute-status", ({ roomId, status }) => {
      io.to(roomId).emit("user-muted", {
        peerID: socket.id,
        status,
      });
    });

    // Turn camera on/off
    socket.on("camera-status", ({ roomId, status }) => {
      io.to(roomId).emit("user-camera-updated", {
        peerID: socket.id,
        status, // true = camera off, false = camera on
      });
    });

    // Chat messaging
    socket.on("chat-message", (data) => {
      const { roomId, ...msg } = data;
      io.to(roomId).emit("chat-message", msg);
    });

    // Typing indicator
    socket.on("typing", ({ roomId, user }) => {
      socket.to(roomId).emit("user-typing", user.name);
    });

    // Handle manual request for public rooms
    socket.on("get-public-rooms", () => {
      emitPublicRooms(io);
    });
  });
};
