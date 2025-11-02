const express = require('express');
const Content = require('../models/Content');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all published content
router.get('/', async (req, res) => {
  try {
    const content = await Content.find({ isPublished: true })
      .populate('author', 'name')
      .select('-__v')
      .sort({ updatedAt: -1 });
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get content by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const content = await Content.findOne({ slug, isPublished: true })
      .populate('author', 'name')
      .select('-__v');
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

