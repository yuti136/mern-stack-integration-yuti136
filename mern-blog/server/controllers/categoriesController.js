// controllers/categoriesController.js
const Category = require('../models/Category');
const slugify = require('slugify');

exports.getAll = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    const exists = await Category.findOne({ slug });
    if (exists) return res.status(400).json({ success: false, error: 'Category already exists' });

    const category = new Category({ name, slug });
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};
