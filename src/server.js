const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerConfig = require("./configs/swaggerConfig");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bookRoutes = require("./routes/bookRoutes");
const bookCategoryRoutes = require("./routes/bookCategoryRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

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

/* Swagger  */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig));

/* API Routes */
app.use("/api/user", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/book", bookRoutes);
app.use("/api/book/category", bookCategoryRoutes);
app.use("/api/transaction", transactionRoutes);

/* Port Listening In */
app.listen(port, () => {
  console.log(`Server is running in PORT ${port}`);
});
