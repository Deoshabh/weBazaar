const mongoose = require("mongoose");

const themeConfigSchema = new mongoose.Schema({
  version: { type: Number, default: 1 },
  siteId: { type: String, default: 'default' }, // Future proofing

  brand: {
    logoUrl: String,
    logoDarkUrl: String,       // Dark mode variant
    faviconUrl: String,
    logoWidth: { type: Number, default: 160 },
    logoHeight: { type: Number, default: 48 },
  },

  colors: {
    primary:    { type: String, default: '#E94560' },
    secondary:  { type: String, default: '#0F3460' },
    accent:     { type: String, default: '#A855F7' },
    background: { type: String, default: '#FFFFFF' },
    surface:    { type: String, default: '#F9FAFB' },
    text:       { type: String, default: '#1A1A2E' },
    textMuted:  { type: String, default: '#6B7280' },
    border:     { type: String, default: '#E5E7EB' },
    darkMode: {
      primary: String, 
      secondary: String,
      background: String, 
      surface: String,
      text: String, 
      textMuted: String
    },
    presets: [{ 
      name: String, 
      colors: Object, 
      createdAt: { type: Date, default: Date.now } 
    }]
  },

  typography: {
    headingFont:   { type: String, default: 'Inter' },
    bodyFont:      { type: String, default: 'Inter' },
    accentFont:    String,
    scaleMultiplier: { type: Number, default: 1, min: 0.8, max: 1.4 },
    sizes: {
      h1: { type: Number, default: 48 },
      h2: { type: Number, default: 36 },
      h3: { type: Number, default: 28 },
      body: { type: Number, default: 16 },
      small: { type: Number, default: 14 },
      caption: { type: Number, default: 12 },
    },
    weights: {
      heading: { type: String, default: '700' },
      body: { type: String, default: '400' },
      button: { type: String, default: '600' },
    },
    letterSpacing: { heading: Number, body: Number },
    lineHeight:    { heading: Number, body: Number },
  },

  layout: {
    containerWidth:   { type: Number, default: 1280 },
    sectionPadding:   { type: Number, default: 80 },
    borderRadius:     { type: Number, default: 8 },
    productGridCols:  { 
      desktop: { type: Number, default: 4 }, 
      mobile: { type: Number, default: 2 } 
    },
    gapSize:          { type: Number, default: 24 },
  },

  header: {
    variant: { 
      type: String, 
      enum: ['minimal', 'centered', 'mega-menu', 'transparent'], 
      default: 'minimal' 
    },
    sticky: { type: Boolean, default: true },
    scrollOpacity: { type: Boolean, default: true },
    scrollThreshold: { type: Number, default: 80 },
    navLinkStyle: {
      weight: String, 
      size: Number,
      hoverColor: String,
      activeIndicator: { type: String, enum: ['underline', 'pill', 'dot', 'none'] }
    },
    announcementBar: {
      enabled: Boolean,
      text: String,
      link: String,
      bgColor: String,
      textColor: String,
      closeable: Boolean,
      countdown: { enabled: Boolean, targetDate: Date }
    }
  },

  hero: {
    layout: { 
      type: String, 
      enum: ['full-bleed', 'split', 'video', 'carousel'], 
      default: 'full-bleed' 
    },
    headline: String,
    subheadline: String,
    ctaLabel: String,
    ctaHref: String,
    ctaStyle: { type: String, enum: ['filled', 'outline', 'ghost'] },
    imageUrl: String,
    videoUrl: String,
    animation: {
      type: { type: String, enum: ['fade-up', 'slide-in', 'typewriter', 'stagger', 'none'] },
      duration: { type: Number, default: 800 },
      delay: { type: Number, default: 200 },
    },
    overlay: {
      color: { type: String, default: '#000000' },
      opacity: { type: Number, default: 0.3 },
      gradient: { type: String, enum: ['top', 'bottom', 'diagonal', 'none'] }
    }
  },

  products: {
    cardStyle: { 
      type: String, 
      enum: ['minimal', 'shadow', 'bordered', 'glass', 'flat'], 
      default: 'shadow' 
    },
    hoverEffect: { type: String, enum: ['zoom', 'lift', 'flip', 'color-shift', 'none'] },
    showSaleBadge: { type: Boolean, default: true },
    badgeColor: String,
    showRating: Boolean,
    showInstallmentText: Boolean,
  },

  sections: [{
    id: String,
    type: { 
      type: String, 
      enum: ['hero', 'featured-products', 'new-arrivals', 'categories', 'newsletter', 'banner', 'testimonials', 'brands'] 
    },
    order: Number,
    visible: { type: Boolean, default: true },
    settings: Object
  }],

  footer: {
    layout: { type: String, enum: ['single', '2-col', '4-col', 'minimal'], default: '4-col' },
    colors: { background: String, text: String, link: String, divider: String },
    showNewsletter: Boolean,
    socialLinks: [{ platform: String, url: String, iconStyle: String }]
  },

  effects: {
    scrollAnimations: { type: Boolean, default: true },
    scrollAnimationType: { type: String, enum: ['fade-in', 'slide-up', 'scale-in'] },
    pageTransitions: { type: String, enum: ['fade', 'slide', 'none'], default: 'fade' },
    customCursor: { type: Boolean, default: false },
    customCursorColor: String,
    customCursorSize: Number,
    skeletonColor: String,
  },

  updatedAt: { type: Date, default: Date.now },

  history: [{
    snapshot: Object,
    savedAt: Date,
    label: String,
    savedBy: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model("ThemeConfig", themeConfigSchema);
