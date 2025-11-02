const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Content = require('../models/Content');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Middleware to ensure admin access
router.use(auth, isAdmin);

// Get all authors
router.get('/authors', async (req, res) => {
  try {
    const authors = await User.find({ role: 'author' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(authors);
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new author
router.post('/authors', [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create author
    const author = new User({
      email,
      name,
      password,
      role: 'author'
    });

    await author.save();

    res.status(201).json({
      author: {
        id: author._id,
        email: author.email,
        name: author.name,
        role: author.role,
        isActive: author.isActive
      }
    });
  } catch (error) {
    console.error('Error creating author:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update author
router.put('/authors/:id', [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, email, isActive } = req.body;

    const author = await User.findById(id);
    if (!author || author.role !== 'author') {
      return res.status(404).json({ error: 'Author not found' });
    }

    if (name) author.name = name;
    if (email) author.email = email;
    if (isActive !== undefined) author.isActive = isActive;

    await author.save();

    res.json({
      author: {
        id: author._id,
        email: author.email,
        name: author.name,
        role: author.role,
        isActive: author.isActive
      }
    });
  } catch (error) {
    console.error('Error updating author:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete author
router.delete('/authors/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const author = await User.findById(id);
    if (!author || author.role !== 'author') {
      return res.status(404).json({ error: 'Author not found' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'Author deleted successfully' });
  } catch (error) {
    console.error('Error deleting author:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all content pages
router.get('/content', async (req, res) => {
  try {
    const content = await Content.find()
      .populate('author', 'name email')
      .populate('editors', 'name email')
      .sort({ updatedAt: -1 });
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign editing rights to authors
router.put('/content/:id/editors', [
  body('editorIds').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { editorIds } = req.body;

    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Verify all editor IDs are valid authors
    const editors = await User.find({
      _id: { $in: editorIds },
      role: 'author'
    });

    if (editors.length !== editorIds.length) {
      return res.status(400).json({ error: 'Invalid editor IDs' });
    }

    content.editors = editorIds;
    await content.save();

    const updatedContent = await Content.findById(id)
      .populate('author', 'name email')
      .populate('editors', 'name email');

    res.json(updatedContent);
  } catch (error) {
    console.error('Error updating editors:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

