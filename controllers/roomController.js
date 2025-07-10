// controllers/roomController.js
const Room = require("../models/Room");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

exports.createRoom = async (req, res) => {
  const { isPrivate, pin, capacity } = req.body;
  const host = req.user;

  try {
    const roomId = uuidv4();
    const hashedPin = pin ? await bcrypt.hash(pin, 10) : undefined;

    const newRoom = new Room({
      roomId,
      isPrivate,
      pin: hashedPin,
      hostId: host.email,
      capacity,
      users: [],
    });

    await newRoom.save();
    res.status(201).json({ roomId });
  } catch (err) {
    res.status(500).json({ message: "Error creating room" });
  }
};

exports.joinRoom = async (req, res) => {
  const { roomId, pin } = req.body;
  const user = req.user;

  try {
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.users.length >= room.capacity)
      return res.status(403).json({ message: "Room is full" });

    if (room.isPrivate && pin) {
      const isValid = await bcrypt.compare(pin, room.pin || "");
      if (!isValid) return res.status(401).json({ message: "Incorrect PIN" });
    }

    room.users.push({ name: user.name, email: user.email });
    await room.save();

    res.status(200).json({ message: "Joined room successfully", roomId });
  } catch (err) {
    res.status(500).json({ message: "Failed to join room" });
  }
};
