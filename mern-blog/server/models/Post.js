const mongoose = require("mongoose");
const slugify = require("slugify");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      required: [true, "Slug is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    authorId: {
      type: String,
      required: [true, "Author ID is required"],
    },
    authorName: {
      type: String,
      default: "Anonymous",
      trim: true,
    },
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

// Automatically generate slug
postSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);
