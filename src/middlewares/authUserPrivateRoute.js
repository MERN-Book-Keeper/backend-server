/**
 * Normal User Authentication Middleware
 *
 * Verifies the user's authentication token and grants access only to normal users.
 * Sets user information in req.user for normal user access; otherwise, returns an error.
 *
 */

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/user");
dotenv.config({ path: "../.env" });

module.exports = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Unauthorized access!");

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const requestingUser = await User.findById(decodedToken.userId);

    // Checking if the user role is not admin
    if (requestingUser.role === "admin") {
      return res.status(401).send("Access denied! Admins are not allowed.");
    }

    // Checking if the user ID in the params matches the ID in the token
    if (req.params.id && req.params.id !== decodedToken.userId) {
      return res.status(401).send("Access denied! Different user.");
    }

    req.user = decodedToken;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};
