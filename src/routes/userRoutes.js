const express = require("express");
const dotenv = require("dotenv");
const User = require("../models/user");
const router = express.Router();
const authUserAdminPrivateRoute = require("../middlewares/authUserAdminPrivateRoute");
dotenv.config({ path: "../../.env" });

/**
 * @swagger
 * tags:
 *   name: User Data
 *
 */

/**
 * @swagger
 * /api/user/getAll:
 *   get:
 *     description: Get all users data | JWT Autharization token required in the request header
 *     tags:
 *       - User Data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved all users
 *       '401':
 *         description: Unauthorized - JWT token is missing or invalid
 *       '400':
 *         description: Bad request
 */

router.get("/getAll", authUserAdminPrivateRoute, async (req, res) => {
  try {
    const users = await User.find({}).sort({ _id: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/user/get/{id}:
 *   get:
 *     description: Get user data by user ID | JWT Autharization token required in the request header
 *     tags:
 *       - User Data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to retrieve user data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved user data
 *       '401':
 *         description: Unauthorized - JWT token is missing or invalid
 *       '404':
 *         description: User not found
 */

router.get("/get/:id", authUserAdminPrivateRoute, async (req, res) => {
  try {
    const user = await User.findById(req?.params?.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/user/edit/{id}:
 *   put:
 *     description: Update user data by user ID | JWT Authorization token required in the request header
 *     tags:
 *       - User Data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update data
 *       - in: body
 *         name: userData
 *         required: true
 *         description: Object containing user data to be updated
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             age:
 *               type: number
 *             gender:
 *               type: string
 *             dob:
 *               type: string
 *             email:
 *               type: string
 *             contact:
 *               type: string
 *             role:
 *               type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully updated user data
 *       '401':
 *         description: Unauthorized - JWT token is missing or invalid
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal Server Error
 */

router.put("/edit/:id", authUserAdminPrivateRoute, async (req, res) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.params.id);
    // Update only the fields that are provided in the request and exclude "password"
    const allowedFields = [
      "name",
      "age",
      "gender",
      "dob",
      "email",
      "contact",
      "role",
    ];
    allowedFields.map((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Save the updated user
    await user.save();
    res.status(200).json({ message: "User data has been updated", data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/user/update/password/{id}:
 *   put:
 *     description: Update user password by user ID | JWT Authorization token required in the request header
 *     tags:
 *       - User Data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update password
 *       - in: body
 *         name: passwordUpdate
 *         required: true
 *         description: Object containing oldPassword and newPassword
 *         schema:
 *           type: object
 *           properties:
 *             oldPassword:
 *               type: string
 *               minLength: 6
 *               maxLength: 255
 *             newPassword:
 *               type: string
 *               minLength: 6
 *               maxLength: 255
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully updated user password
 *       '401':
 *         description: Unauthorized - JWT token is missing or invalid, or old password is incorrect
 *       '404':
 *         description: User not found
 *       '400':
 *         description: Bad request - New password must be between 6 and 255 characters
 *       '500':
 *         description: Internal Server Error
 */

router.put(
  "/update/password/:id",
  authUserAdminPrivateRoute,
  async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;

      // Checking if the provided newPassword meets length requirements
      if (!newPassword || newPassword.length < 6 || newPassword.length > 255) {
        return res
          .status(400)
          .json({ error: "New password must be between 6 and 255 characters" });
      }

      // Finding the user by ID
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verifying if the old password matches the stored hashed password
      const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        user.password
      );
      if (!isOldPasswordValid) {
        return res.status(401).json({ error: "Old password is incorrect" });
      }

      // Generating a salt to be used in password hashing
      const salt = await bcrypt.genSalt(10);

      // Hashing the new password using bcrypt
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      // Updating the user's password in the database
      const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        $set: { password: hashedNewPassword },
      });

      // If the update is successful, respond with a success message
      res.status(200).json("Password has been updated");
    } catch (err) {
      // If there's an error during the update, respond with an error status and message
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * @swagger
 * /api/user/delete/{id}:
 *   delete:
 *     description: Delete user data by user ID | JWT Authorization token required in the request header
 *     tags:
 *       - User Data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully deleted user data
 *       '401':
 *         description: Unauthorized - JWT token is missing or invalid
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal Server Error
 */

router.delete("/delete/:id", authUserAdminPrivateRoute, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json("User has been deleted");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
