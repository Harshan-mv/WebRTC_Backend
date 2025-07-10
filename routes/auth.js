// routes/auth.js
const express = require("express");
const router = express.Router();
const { verifyGoogleToken } = require("../controllers/authController");

router.post("/google", verifyGoogleToken);

module.exports = router;
