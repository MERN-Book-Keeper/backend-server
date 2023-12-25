/* User Authentication Middleware
 *
 * Verifies the user's authentication token and checks privileges to access routes.
 * Handles cases for both users and admins, setting user information in req.user when appropriate.
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

    // Check if the user role is admin
    if (requestingUser.role === "admin") {
      req.user = decodedToken; // Set user information in the request object
      return next(); // Admin has access to everything
    }

    // If param id is not present and the user is not an admin
    if (!req.params.id && requestingUser.role !== "admin") {
      req.user = decodedToken; // Set user information in the request object
      return res.status(401).send("Access denied! Only Admin have access.");
    }

    // If param id is present and not equal to decoded user ID
    if (req.params.id && req.params.id !== decodedToken.userId) {
      // If the route is for updating and the user is not found, handle it separately
      if (req.path.includes("/edit/") || req.path.includes("/update/")) {
        const userToUpdate = await User.findById(req.params.id);
        if (!userToUpdate) {
          return res.status(404).send("User not found");
        }
      } else {
        return res
          .status(401)
          .send("Access denied! You can only access your own data.");
      }
    }

    // If none of the above conditions are met, allow access
    req.user = decodedToken; // Set user information in the request object
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};
