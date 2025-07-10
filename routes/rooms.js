// routes/room.js
const express = require("express");
const router = express.Router();
const { createRoom, joinRoom } = require("../controllers/roomController");
const { verifyToken } = require("../middleware/auth");

router.post("/create", verifyToken, createRoom);
router.post("/join", verifyToken, joinRoom);

module.exports = router;
