const express = require("express");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const router = express.Router();

dotenv.config({ path: "../../.env" });

router.post("/register", async (req, res) => {
  try {
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

router.post("/login", async (req, res) => {
  console.log(process.env.JWT_SECRET);
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h", // Token expiration time
      }
    );

    res
      .status(200)
      .json({ message: "Login successful", token: token, data: user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
