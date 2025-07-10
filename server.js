// server/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*", // Set frontend URL in prod
    methods: ["GET", "POST"]
  }
});

// Connect to Mongo
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

// Routes
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
app.use("/api/auth", authRoutes);
app.use("/api/room", roomRoutes);

// Socket.IO events
require("./socket")(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
