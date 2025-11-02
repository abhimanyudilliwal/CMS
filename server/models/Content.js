const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  editors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  media: [{
    type: String,
    url: String,
    mediaType: String
  }],
  template: {
    type: String,
    default: 'default'
  },
  meta: {
    description: String,
    keywords: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
contentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Content', contentSchema);

