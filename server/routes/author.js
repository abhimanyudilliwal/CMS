const express = require('express');
const { body, validationResult } = require('express-validator');
const Content = require('../models/Content');
const { auth, isAuthor } = require('../middleware/auth');

const router = express.Router();

// Middleware to ensure author access
router.use(auth, isAuthor);

// Helper function to create slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Get all content by current author
router.get('/my-content', async (req, res) => {
  try {
    const userId = req.user._id;
    const content = await Content.find({
      $or: [{ author: userId }, { editors: userId }]
    })
      .populate('author', 'name email')
      .populate('editors', 'name email')
      .sort({ updatedAt: -1 });
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching author content:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new content
router.post('/content', [
  body('title').trim().notEmpty(),
  body('content').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, isPublished, template, meta, media } = req.body;
    const slug = createSlug(title);

    // Check if slug exists
    const existingContent = await Content.findOne({ slug });
    if (existingContent) {
      return res.status(400).json({ error: 'A page with this title already exists' });
    }

    const newContent = new Content({
      title,
      slug,
      content,
      author: req.user._id,
      editors: [],
      isPublished: isPublished || false,
      template: template || 'default',
      meta: meta || {},
      media: media || []
    });

    await newContent.save();

    const savedContent = await Content.findById(newContent._id)
      .populate('author', 'name email')
      .populate('editors', 'name email');

    res.status(201).json(savedContent);
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update content
router.put('/content/:id', [
  body('title').optional().trim().notEmpty(),
  body('content').optional().trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Check if user has permission (is author or editor)
    const isAuthorized = 
      content.author.toString() === userId.toString() || 
      content.editors.some(editor => editor.toString() === userId.toString());

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to edit this content' });
    }

    // Update fields
    const { title, content: newContent, isPublished, template, meta, media } = req.body;
    
    if (title && title !== content.title) {
      const newSlug = createSlug(title);
      const existingContent = await Content.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existingContent) {
        return res.status(400).json({ error: 'A page with this title already exists' });
      }
      content.title = title;
      content.slug = newSlug;
    }

    if (newContent) content.content = newContent;
    if (isPublished !== undefined) content.isPublished = isPublished;
    if (template) content.template = template;
    if (meta) content.meta = meta;
    if (media) content.media = media;

    await content.save();

    const updatedContent = await Content.findById(id)
      .populate('author', 'name email')
      .populate('editors', 'name email');

    res.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete content
router.delete('/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Only author can delete
    if (content.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this content' });
    }

    await Content.findByIdAndDelete(id);
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload media (placeholder - integrate with Cloudinary/S3 as needed)
router.post('/upload', async (req, res) => {
  try {
    // This is a placeholder for file upload
    // In production, integrate with Cloudinary or S3
    res.json({ 
      message: 'File upload endpoint - integrate with Cloudinary or S3',
      url: 'https://via.placeholder.com/800x600'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

