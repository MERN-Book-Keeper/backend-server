const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth");

/* App Config */
dotenv.config({ path: "../.env" });
const app = express();
const port = process.env.PORT || 5000;

/* Middlewares */
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

/* MongoDB connection */
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB Database");
});

app.get("/", (req, res) => {
  res.status(200).send("Welcome to MERN Book Keeper App.");
});

/* API Routes */
app.use("/api/user", authRoutes);

/* Port Listening In */
app.listen(port, () => {
  console.log(`Server is running in PORT ${port}`);
});
