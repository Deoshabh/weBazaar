const mongoose = require('mongoose');

const storefrontConfigSchema = new mongoose.Schema(
  {
    branding: {
      logo: {
        url: { type: String, default: '' },
        alt: { type: String, default: 'Logo' },
      },
      favicon: {
        url: { type: String, default: '' },
      },
      siteName: { type: String, default: 'weBazaar' },
    },
    banners: [
      {
        id: { type: String },
        imageUrl: { type: String, required: true },
        title: { type: String },
        subtitle: { type: String },
        link: { type: String },
        buttonText: { type: String, default: 'Shop Now' },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
      },
    ],
    announcementBar: {
      enabled: { type: Boolean, default: true },
      text: { type: String, default: 'Welcome to our store!' },
      link: { type: String, default: '' },
      backgroundColor: { type: String, default: '#10b981' },
      textColor: { type: String, default: '#ffffff' },
      dismissible: { type: Boolean, default: true },
    },
    // Sections configuration for Home Page (Mixed for full CMS flexibility)
    homeSections: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        heroSection: {
          enabled: true,
          eyebrow: '',
          title: 'Handcrafted Perfection',
          subtitle: 'Discover our new collection',
          titleLine3: '',
          description: '',
          primaryButtonText: 'Shop Collection',
          primaryButtonLink: '/products',
          secondaryButtonText: '',
          secondaryButtonLink: '',
          imageUrl: '',
          stats: [],
        },
        marquee: { enabled: true, text: '' },
        featuredProducts: {
          enabled: true,
          title: 'Featured Collection',
          description: '',
          productLimit: 8,
          productSelection: 'latest',
        },
        craftProcess: { enabled: true, title: 'Our Craft', images: [], features: [] },
        heritage: { enabled: true, title: '', description: '', imageUrl: '', points: [] },
        story: { enabled: true, paragraphs: [] },
        testimonials: { enabled: true, items: [] },
        ctaBanner: { enabled: true, title: '', description: '', buttonText: '', buttonLink: '' },
        madeToOrder: { enabled: true, title: 'Made to Order', description: '', features: [] },
        newsletter: { enabled: true, title: 'Join Our Newsletter', description: '', buttonText: 'Subscribe' },
      },
    },
    // Dynamic Layout Configuration (Visual CMS)
    layout: [
      {
        id: { type: String, required: true },
        type: { type: String, required: true }, // 'hero', 'products', 'text', 'newsletter'
        enabled: { type: Boolean, default: true },
        data: { type: mongoose.Schema.Types.Mixed, default: {} }, // Flexible data storage
      }
    ],
    layoutSchemaVersion: {
      type: Number,
      default: 2,
    },
    // Global Theme Validation
    theme: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        primaryColor: '#3B2F2F',
        secondaryColor: '#F4F1EA',
        fontFamily: 'Inter',
        borderRadius: '8px',
      }
    },
    versionHistory: [
      {
        label: { type: String, default: 'Snapshot' },
        snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
        savedAt: { type: Date, default: Date.now },
        savedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    currentVersion: { type: Number, default: 1 },
    publishWorkflow: {
      status: {
        type: String,
        enum: ['draft', 'scheduled', 'live'],
        default: 'live',
      },
      scheduledAt: { type: Date, default: null },
      publishedAt: { type: Date, default: null },
      updatedAt: { type: Date, default: Date.now },
      lockOwner: { type: String, default: null },
      lockUntil: { type: Date, default: null },
    },
    publishedSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Singleton pattern enforcement
    isDefault: { type: Boolean, default: true, unique: true },
  },
  { timestamps: true, strict: false },
);

// Ensure only one document exists
storefrontConfigSchema.statics.getSettings = async function () {
  const settings = await this.findOne({ isDefault: true });
  if (settings) return settings;
  return this.create({ isDefault: true });
};

module.exports = mongoose.model('SiteSettings', storefrontConfigSchema);
