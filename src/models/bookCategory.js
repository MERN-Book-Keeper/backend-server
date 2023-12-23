import mongoose from "mongoose";

const BookCategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const BookCategory = mongoose.model("BookCategory", BookCategorySchema);
module.exports = BookCategory;
