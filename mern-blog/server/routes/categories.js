// routes/categories.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const categoriesController = require("../controllers/categoriesController");
const { requireAuth } = require("@clerk/express"); // ✅ Use Clerk middleware

// ✅ Public route - anyone can view categories
router.get("/", categoriesController.getAll);

// 🔐 Protected route - only logged-in users can create categories
router.post(
  "/",
  requireAuth(), // ✅ Must be called as a function
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  validateRequest,
  (req, res, next) => {
    // ✅ Attach the Clerk userId if needed
    req.body.authorId = req.auth.userId;
    categoriesController.create(req, res, next);
  }
);

module.exports = router;
