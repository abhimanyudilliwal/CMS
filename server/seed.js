require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Content = require('./models/Content');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abhimanyu_db_user:Abhidilli123@cluster0.kw3el6q.mongodb.net';

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://abhimanyu_db_user:Abhidilli123@cluster0.kw3el6q.mongodb.net");
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Content.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = new User({
      email: 'admin@cms.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
    });
    await admin.save();
    console.log('👤 Created admin user:', admin.email);

    // Create author users
    const author1 = new User({
      email: 'author@cms.com',
      password: 'author123',
      name: 'John Author',
      role: 'author',
    });
    await author1.save();
    console.log('👤 Created author user:', author1.email);

    const author2 = new User({
      email: 'jane@cms.com',
      password: 'jane123',
      name: 'Jane Writer',
      role: 'author',
    });
    await author2.save();
    console.log('👤 Created author user:', author2.email);

    // Create sample content
    const sampleContent1 = new Content({
      title: 'Welcome to Our CMS Platform',
      slug: 'welcome-to-our-cms-platform',
      content: `# Welcome to Our CMS Platform

This is a sample article showcasing the capabilities of our Content Management System.

## Features

- **Rich Text Editing** - Create beautiful content with our powerful editor
- **Media Support** - Embed images, videos, and more
- **Markdown Support** - Write in Markdown or use the visual editor
- **Real-time Updates** - See your changes instantly

## Getting Started

To start creating content, simply login as an author and click "Create New Content" in your dashboard.

## Need Help?

Contact your administrator for assistance with permissions or features.
`,
      author: author1._id,
      editors: [],
      isPublished: true,
    });
    await sampleContent1.save();
    console.log('📄 Created sample content:', sampleContent1.title);

    const sampleContent2 = new Content({
      title: 'Getting Started Guide',
      slug: 'getting-started-guide',
      content: `# Getting Started Guide

Learn how to use our CMS effectively.

## Creating Content

1. Navigate to "My Content"
2. Click "Create New Content"
3. Enter a title and start writing
4. Use the editor toolbar to format your content
5. Click "Save" to publish

## Tips

- Use headings to structure your content
- Add images to make posts more engaging
- Use lists to organize information
- Preview your content before publishing

Happy writing!
`,
      author: author2._id,
      editors: [author1._id],
      isPublished: true,
    });
    await sampleContent2.save();
    console.log('📄 Created sample content:', sampleContent2.title);

    console.log('\n✨ Seeding completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Admin: admin@cms.com / admin123');
    console.log('   Author 1: author@cms.com / author123');
    console.log('   Author 2: jane@cms.com / jane123');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
