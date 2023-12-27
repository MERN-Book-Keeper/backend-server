const express = require("express");
const router = express.Router();
const moment = require("moment");
const authUserAdminPrivateRoute = require("../middlewares/authUserAdminPrivateRoute");
const authUserPrivateRoute = require("../middlewares/authUserPrivateRoute");
const authAdminPrivateRoute = require("../middlewares/authAdminPrivateRoute");
const Book = require("../models/book");
const TransactionTicket = require("../models/transaction");

/**
 * @swagger
 * tags:
 *   name: Transaction Data
 *
 */

/**
 * @swagger
 * /api/transaction/ticket/issue:
 *   post:
 *     description: Raise a transaction ticket to issue a book
 *     tags:
 *       - Transaction Ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookId:
 *                 type: string
 *                 description: ID of the book to be issued
 *             required:
 *               - bookId
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '201':
 *         description: Ticket raised successfully for issuing the book
 *       '400':
 *         description: Bad request - Missing or invalid parameters
 */

router.post("/ticket/issue", authUserPrivateRoute, async (req, res) => {
  try {
    const { bookId, borrowerId } = req.body;
    const issueDate = new Date();
    const dueDate = moment().add(7, "days").toDate(); // Assuming a 7-day borrowing period

    const ticket = new TransactionTicket({
      bookId,
      borrowerId,
      transactionType: "issue",
      issueDate,
      dueDate,
      status: "pending",
    });

    await ticket.save();
    res.status(201).json({ message: "Ticket raised for issuing book", ticket });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/transaction/ticket/approve:
 *   put:
 *     description: Approve a transaction ticket to issue a book (Admin Only)
 *     tags:
 *       - Transaction Ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ticketId:
 *                 type: string
 *                 description: ID of the transaction ticket to be approved
 *               adminId:
 *                 type: string
 *                 description: ID of the admin approving the ticket
 *             required:
 *               - ticketId
 *               - adminId
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Ticket approved successfully
 *       '400':
 *         description: Bad request - Missing or invalid parameters
 *       '404':
 *         description: Ticket not found
 */

router.put("/ticket/approve", authAdminPrivateRoute, async (req, res) => {
  try {
    const { ticketId, adminId } = req.body;

    const ticket = await TransactionTicket.findById(ticketId).populate(
      "bookId"
    );

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (ticket.status === "completed") {
      return res.status(400).json({ error: "Ticket already completed" });
    }

    // Update ticket status to 'approved' and record the admin ID
    ticket.status = "approved";
    ticket.approvedBy = adminId;

    await ticket.save();

    // Update book availability status
    const book = await Book.findById(ticket.bookId);
    book.isAvailable = false;

    await book.save();

    res.json({
      message: "Ticket approved by admin, book has been issued.",
      ticket,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/transaction/ticket/complete:
 *   put:
 *     description: Complete a transaction ticket to return a book (User Only)
 *     tags:
 *       - Transaction Ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ticketId:
 *                 type: string
 *                 description: ID of the transaction ticket to be completed
 *               borrowerId:
 *                 type: string
 *                 description: ID of the borrower (user) completing the ticket
 *               adminId:
 *                 type: string
 *                 description: ID of the admin overseeing the completion
 *             required:
 *               - ticketId
 *               - borrowerId
 *               - adminId
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Ticket completed successfully, book has been returned
 *       '400':
 *         description: Bad request - Missing or invalid parameters
 *       '404':
 *         description: Ticket not found
 */

router.put("/ticket/complete", authUserPrivateRoute, async (req, res) => {
  try {
    const { ticketId, borrowerId, adminId } = req.body;

    const ticket = await TransactionTicket.findById(ticketId).populate(
      "bookId"
    );

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (ticket.status === "completed") {
      return res.status(400).json({ error: "Ticket already completed" });
    }

    // Update ticket status to 'completed' when the user returns the book
    ticket.status = "completed";
    ticket.returnDate = new Date();

    await ticket.save();

    // Update book availability status
    const book = await Book.findById(ticket.bookId);
    book.isAvailable = true;

    await book.save();

    res.json({ message: "Ticket completed, book has been returned", ticket });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/transaction/tickets/pending/{userId}:
 *   get:
 *     description: Get pending transaction tickets for a user
 *     tags:
 *       - Transaction Ticket
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user for whom pending tickets are requested
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved pending tickets for the user
 *       '400':
 *         description: Bad request - Missing or invalid parameters
 */

router.get(
  "/tickets/pending/:userId",
  authUserPrivateRoute,
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const pendingTickets = await TransactionTicket.find({
        borrowerId: userId,
        status: "pending",
      }).populate(["bookId", "approvedBy"]);

      res.json({ pendingTickets });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/transaction/tickets/active/{adminId}:
 *   get:
 *     description: Get all pending transaction tickets for an admin (Admin Only)
 *     tags:
 *       - Transaction Ticket
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the admin for whom active tickets are requested
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved all pending tickets for the admin
 *       '401':
 *         description: Unauthorized - Only admins have access
 *       '400':
 *         description: Bad request - Missing or invalid parameters
 */

router.get(
  "/tickets/active/:adminId",
  authAdminPrivateRoute,
  async (req, res) => {
    try {
      const adminId = req.params.adminId;
      const pendingTickets = await TransactionTicket.find({
        status: "pending",
      }).populate(["bookId", "approvedBy"]);

      res.json({ pendingTickets });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

module.exports = router;
