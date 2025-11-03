// controllers/postsController.js
const Post = require("../models/Post");
const Category = require("../models/Category");
const slugify = require("slugify");
const { verifyToken } = require("@clerk/backend");
const mongoose = require("mongoose");

/**
 * Verify Clerk JWT token from request headers
 * Returns user object { userId, userName } or null
 */
async function verifyClerkUser(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return null;

    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    if (!decoded) return null;

    return {
      userId: decoded.sub,
      userName: decoded.username || decoded.first_name || decoded.email || "Anonymous",
    };
  } catch (err) {
    console.error("❌ Clerk token verification failed:", err.message);
    return null;
  }
}

// GET /api/posts?page=&limit=&category=
exports.getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const category = req.query.category || null;
    const skip = (page - 1) * limit;

    const filter = {};
    if (category) {
      const cat = await Category.findOne({
        $or: [{ slug: category }, { name: category }],
      });
      if (cat) filter.categories = cat._id;
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: posts,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error fetching posts:", err);
    next(err);
  }
};

// GET /api/posts/:id
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findOne({
      $or: [{ _id: id }, { slug: id }],
    });

    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    res.json({ success: true, data: post });
  } catch (err) {
    console.error("Error fetching post by ID:", err);
    next(err);
  }
};

// POST /api/posts
exports.create = async (req, res, next) => {
  try {
    const { title, content, categories } = req.body;

    // 🔹 Verify Clerk user
    const user = await verifyClerkUser(req);
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });
    console.log("Creating post by user:", user);

    // 🔹 Validate input
    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required" });
    }

    // 🔹 Generate slug
    let slug = slugify(title, { lower: true, strict: true });
    const existingPost = await Post.findOne({ slug });
    if (existingPost) slug = `${slug}-${Date.now()}`;

    // 🔹 Convert categories to ObjectId
    let categoryIds = [];
    if (categories && Array.isArray(categories)) {
      categoryIds = categories
        .filter((catId) => mongoose.Types.ObjectId.isValid(catId))
        .map((catId) => mongoose.Types.ObjectId(catId));

      if (categoryIds.length !== categories.length) {
        console.warn("Some provided categories were invalid ObjectIds");
      }
    }

    // 🔹 Create post
    const post = new Post({
      title,
      content,
      categories: categoryIds,
      authorId: user.userId,   // ✅ required for validation
      authorName: user.userName || "Anonymous",
      slug,
    });

    await post.save();

    console.log("✅ Post created successfully:", post._id);
    res.status(201).json({ success: true, message: "Post created successfully", data: post });
  } catch (err) {
    console.error("❌ Error creating post:", err);
    next(err); // Let global error handler handle it
  }
};

// PUT /api/posts/:id
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await verifyClerkUser(req);
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    if (post.authorId !== user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this post" });
    }

    // Update slug if title changed
    if (updates.title) {
      const newSlug = slugify(updates.title, { lower: true, strict: true });
      const existing = await Post.findOne({ slug: newSlug, _id: { $ne: id } });
      updates.slug = existing ? `${newSlug}-${Date.now()}` : newSlug;
    }

    if (updates.categories && Array.isArray(updates.categories)) {
      updates.categories = updates.categories.filter((catId) => mongoose.Types.ObjectId.isValid(catId));
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updates, { new: true });
    res.json({ success: true, message: "Post updated successfully", data: updatedPost });
  } catch (err) {
    console.error("Error updating post:", err);
    next(err);
  }
};

// DELETE /api/posts/:id
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await verifyClerkUser(req);
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    if (post.authorId !== user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(id);

    res.json({ success: true, message: "Post deleted successfully", data: post });
  } catch (err) {
    console.error("Error deleting post:", err);
    next(err);
  }
};
