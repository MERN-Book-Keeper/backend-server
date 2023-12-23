import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    author: {
      type: String,
      require: true,
    },
    image: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "",
    },
    publisher: {
      type: String,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "BookCategory",
    },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model("Book", BookSchema);
module.exports = Book;
