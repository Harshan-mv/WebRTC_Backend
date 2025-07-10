// models/Room.js
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  isPrivate: { type: Boolean, default: false },
  pin: { type: String }, // hashed if present
  hostId: { type: String, required: true },
  capacity: { type: Number, default: 6 },
  users: [{ name: String, email: String }],
});

module.exports = mongoose.model("Room", roomSchema);
