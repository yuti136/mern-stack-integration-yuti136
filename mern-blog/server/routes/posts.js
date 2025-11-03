// routes/posts.js
const express = require("express");
const router = express.Router();
const { body, param, query } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const postsController = require("../controllers/postsController");
const { requireAuth } = require("@clerk/express"); // Clerk auth middleware

// ==========================
// Public routes
// ==========================

// Get all posts (with optional pagination)
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1 }).toInt(),
  ],
  validateRequest,
  postsController.getAll
);

// Get single post by ID
router.get(
  "/:id",
  param("id").notEmpty().withMessage("id is required"),
  validateRequest,
  postsController.getById
);

// ==========================
// Protected routes
// ==========================

// Create a new post
router.post(
  "/",
  requireAuth(), // Clerk auth middleware
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
    body("categories").optional().isArray(),
  ],
  validateRequest,
  postsController.create // No need for extra async wrapper
);

// Update a post
router.put(
  "/:id",
  requireAuth(),
  [
    param("id").notEmpty().withMessage("id is required"),
    body("title").optional().trim().notEmpty(),
    body("content").optional().trim().notEmpty(),
    body("categories").optional().isArray(),
  ],
  validateRequest,
  postsController.update
);

// Delete a post
router.delete(
  "/:id",
  requireAuth(),
  param("id").notEmpty().withMessage("id is required"),
  validateRequest,
  postsController.remove
);

module.exports = router;
