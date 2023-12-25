const express = require("express");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = express.Router();
dotenv.config({ path: "../../.env" });

/**
 * @swagger
 * tags:
 *   name: Authentication
 *
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     description: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *               dob:
 *                 type: string
 *               email:
 *                 type: string
 *               contact:
 *                 type: string
 *               password:
 *                 type: string
 *               photo:
 *                 type: string
 *               role:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Bad request
 */

router.post("/register", async (req, res) => {
  try {
    // checking for already existing user
    const userExist = await User.findOne({ email: req.body.email });
    if (userExist) {
      return res
        .status(400)
        .send("User with the same email id already exists!");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      dob: req.body.dob,
      contact: req.body.contact,
      photo: req.body.photo,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role || "user",
    });

    const savedUser = await newUser.save();
    res
      .status(201)
      .json({ message: "User created Successfully", data: savedUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     description: Log in to the system
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: User logged in succesfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       '401':
 *         description: Invalid username or password
 *       '400':
 *         description: Bad request
 */

router.post("/login", async (req, res) => {
  console.log(process.env.JWT_SECRET);
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User does not exist." });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h", // Token expiration time
      }
    );

    res
      .header("Bearer", token)
      .send({ message: "Login successful", token: token, user: user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
