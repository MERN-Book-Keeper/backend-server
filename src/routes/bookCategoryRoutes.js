const express = require("express");
const router = express.Router();
const authAdminPrivateRoute = require("../middlewares/authAdminPrivateRoute");
const BookCategory = require("../models/bookCategory");

/**
 * @swagger
 * tags:
 *   name: Book Category Data
 *
 */

/**
 * @swagger
 * /api/book/category/add:
 *   post:
 *     description: Add a new book category | JWT Authorization token required in the request header
 *     tags:
 *       - Book Category Data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *             required:
 *               - category
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '201':
 *         description: Book category added successfully
 *       '401':
 *         description: Unauthorized - JWT token is missing or invalid
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal Server Error
 */

router.post("/add", authAdminPrivateRoute, async (req, res) => {
  try {
    const newCategory = new BookCategory(req.body);
    await newCategory.save();
    res
      .status(201)
      .json({ message: "Book category added successfully", data: newCategory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/book/category/getAll:
 *   get:
 *     description: Get all book categories
 *     tags:
 *       - Book Category Data
 *     responses:
 *       '200':
 *         description: Successfully retrieved all book categories
 *       '500':
 *         description: Internal Server Error
 */

router.get("/getAll", async (req, res) => {
  try {
    const categories = await BookCategory.find({}).sort({ _id: -1 });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/book/category/edit/{id}:
 *   put:
 *     description: Update book category by category ID | Admin Authorization token required in the request header
 *     tags:
 *       - Book Category Data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID to update data
 *       - in: body
 *         name: categoryData
 *         required: true
 *         description: Object containing category data to be updated
 *         schema:
 *           type: object
 *           properties:
 *             category:
 *               type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully updated book category
 *       '401':
 *         description: Unauthorized - Admin JWT token is missing or invalid
 *       '404':
 *         description: Book category not found
 *       '500':
 *         description: Internal Server Error
 */

router.put("/edit/:id", authAdminPrivateRoute, async (req, res) => {
  try {
    // Find the category by ID
    const category = await BookCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Book category not found" });
    }

    // Update only the fields that are provided in the request
    Object.keys(req.body).forEach((field) => {
      if (category[field] !== undefined) {
        category[field] = req.body[field];
      }
    });

    // Save the updated category
    await category.save();
    res
      .status(200)
      .json({ message: "Book category has been updated", data: category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

/**
 * @swagger
 * /api/book/category/delete/{id}:
 *   delete:
 *     description: Delete book category by category ID | JWT Authorization token required in the request header
 *     tags:
 *       - Book Category Data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully deleted book category
 *       '401':
 *         description: Unauthorized - JWT token is missing or invalid
 *       '404':
 *         description: Book category not found
 *       '500':
 *         description: Internal Server Error
 */

router.delete("/delete/:id", authAdminPrivateRoute, async (req, res) => {
  try {
    const deletedCategory = await BookCategory.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({ error: "Book category not found" });
    }

    res.status(200).json("Book category has been deleted");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
