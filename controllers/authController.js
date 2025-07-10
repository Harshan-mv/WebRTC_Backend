// controllers/authController.js
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt = require("jsonwebtoken"); 

exports.verifyGoogleToken = async (req, res) => {
  const { token } = req.body;
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const appToken = jwt.sign(
    {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  res.status(200).json({
    success: true,
    token: appToken,
    user: {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    },
  });
};