const mongoose = require("mongoose");

const BookTransactionTicketSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  borrowerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  transactionType: { type: String, enum: ["issue", "return"], required: true },
  issueDate: { type: Date, required: true },
  returnDate: { type: Date },
  dueDate: { type: Date },
  status: {
    type: String,
    enum: ["pending", "approved", "completed"],
    default: "pending",
  },
  issuerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const TransactionTicket = mongoose.model(
  "TransactionTicket",
  BookTransactionTicketSchema
);

module.exports = TransactionTicket;
