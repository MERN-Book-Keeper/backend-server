const express = require("express");
const router = express.Router();
const authAdminPrivateRoute = require("../middlewares/authAdminPrivateRoute");
const Book = require("../models/book");

/**
 * @swagger
 * tags:
 *   name: Book Data
 *
 */

/**
 * @swagger
 * /api/book/add:
 *   post:
 *     description: Add a new book | JWT Authorization token required in the request header
 *     tags:
 *       - Book Data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               author:
 *                 type: string
 *               image:
 *                 type: string
 *               language:
 *                 type: string
 *               publisher:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *               category:
 *                 type: string
 *             required:
 *               - name
 *               - author
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '201':
 *         description: Book added successfully
 *       '401':
 *         description: Unauthorized - JWT token is missing or invalid
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal Server Error
 */

router.post("/add", authAdminPrivateRoute, async (req, res) => {
  try {
    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).json({ message: "Book added successfully", data: newBook });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/book/getAll:
 *   get:
 *     description: Get all books data
 *     tags:
 *       - Book Data
 *     responses:
 *       '200':
 *         description: Successfully retrieved all books
 *       '500':
 *         description: Internal Server Error
 */

router.get("/getAll", async (req, res) => {
  try {
    const books = await Book.find({}).populate("category").sort({ _id: -1 });
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/book/get/{id}:
 *   get:
 *     description: Get book data by book ID
 *     tags:
 *       - Book Data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID to retrieve book data
 *     responses:
 *       '200':
 *         description: Successfully retrieved book data
 *       '404':
 *         description: Book not found
 *       '500':
 *         description: Internal Server Error
 */

router.get("/get/:id", async (req, res) => {
  try {
    const book = await Book.findById(req?.params?.id).populate("category");
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/book/edit/{id}:
 *   put:
 *     description: Update book data by book ID | JWT Authorization token required in the request header
 *     tags:
 *       - Book Data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID to update data
 *       - in: body
 *         name: bookData
 *         required: true
 *         description: Object containing book data to be updated
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             author:
 *               type: string
 *             image:
 *               type: string
 *             language:
 *               type: string
 *             publisher:
 *               type: string
 *             isAvailable:
 *               type: boolean
 *             category:
 *               type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully updated book data
 *       '401':
 *         description: Unauthorized - JWT token is missing or invalid
 *       '404':
 *         description: Book not found
 *       '500':
 *         description: Internal Server Error
 */

router.put("/edit/:id", authAdminPrivateRoute, async (req, res) => {
  try {
    // Find the book by ID
    const book = await Book.findById(req.params.id).populate("category");
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Update only the fields that are provided in the request
    Object.keys(req.body).forEach((field) => {
      if (book[field] !== undefined) {
        book[field] = req.body[field];
      }
    });

    // Save the updated book
    await book.save();
    res.status(200).json({ message: "Book data has been updated", data: book });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/book/delete/{id}:
 *   delete:
 *     description: Delete book data by book ID | JWT Authorization token required in the request header
 *     tags:
 *       - Book Data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully deleted book data
 *       '401':
 *         description: Unauthorized - JWT token is missing or invalid
 *       '404':
 *         description: Book not found
 *       '500':
 *         description: Internal Server Error
 */

router.delete("/delete/:id", authAdminPrivateRoute, async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json("Book has been deleted");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/book/filterByCategory/{categoryId}:
 *   get:
 *     description: Get books filtered by category ID
 *     tags:
 *       - Book Data
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID to filter books
 *     responses:
 *       '200':
 *         description: Successfully retrieved filtered books
 *       '404':
 *         description: Category not found or no books found for the category
 *       '500':
 *         description: Internal Server Error
 */

router.get("/filterByCategory/:categoryId", async (req, res) => {
  try {
    const books = await Book.find({
      category: req.params.categoryId,
    }).populate("category");
    if (!books || books.length === 0) {
      return res.status(404).json({
        error: "Category not found or no books found for the category",
      });
    }
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
