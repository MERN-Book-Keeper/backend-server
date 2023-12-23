import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
    },
    dob: {
      type: String,
    },
    contact: {
      type: Number,
      //   require: true,
    },
    photo: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      require: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      require: true,
      min: 6,
    },
    activeTransactions: [
      {
        type: mongoose.Types.ObjectId,
        ref: "BookTransaction",
      },
    ],
    prevTransactions: [
      {
        type: mongoose.Types.ObjectId,
        ref: "BookTransaction",
      },
    ],
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
