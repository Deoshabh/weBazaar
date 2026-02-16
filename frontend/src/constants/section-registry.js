
import { FiLayout, FiShoppingBag, FiType, FiMail, FiBox } from 'react-icons/fi';

export const SECTION_TEMPLATES = [
  {
    type: 'hero',
    label: 'Hero Banner',
    icon: <FiLayout />,
    defaultData: {
      title: 'New Collections 2026',
      subtitle: 'Experience comfort and style like never before.',
      buttonText: 'Shop Now',
      buttonLink: '/products',
      secondaryButtonText: 'Our Story',
      secondaryButtonLink: '/about',
      imageUrl: '/hero-placeholder.jpg',
      alignment: 'center', // left, center, right
    },
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { name: 'buttonText', label: 'Button Text', type: 'text' },
      { name: 'buttonLink', label: 'Button Link', type: 'text' },
      { name: 'secondaryButtonText', label: 'Secondary Button Text', type: 'text' },
      { name: 'secondaryButtonLink', label: 'Secondary Button Link', type: 'text' },
      { name: 'imageUrl', label: 'Background Image', type: 'image' },
      { 
        name: 'alignment', 
        label: 'Text Alignment', 
        type: 'select', 
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' }
        ] 
      },
    ]
  },
  {
    type: 'products',
    label: 'Featured Products',
    icon: <FiShoppingBag />,
    defaultData: {
      title: 'Featured Collection',
      description: 'Explore our handpicked selection of premium shoes.',
      productLimit: 8,
      viewAllButtonText: 'View All Products',
      viewAllButtonLink: '/products',
    },
    fields: [
      { name: 'title', label: 'Section Title', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'productLimit', label: 'Number of Products', type: 'number' },
      { name: 'viewAllButtonText', label: 'View All Button Text', type: 'text' },
      { name: 'viewAllButtonLink', label: 'View All Button Link', type: 'text' },
    ]
  },
  {
    type: 'madeToOrder',
    label: 'Made To Order',
    icon: <FiBox />,
    defaultData: {
      title: 'Made to Order',
      description: 'All our shoes are crafted to order for perfect fit and quality.',
      features: ['Custom Crafted', 'Premium Leather', 'Expert Artisans', '7-10 Days Delivery'],
    },
    fields: [
      { name: 'title', label: 'Section Title', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      {
        name: 'features',
        label: 'Features (one per line)',
        type: 'textarea',
        help: 'Enter one feature per line',
      },
    ]
  },
  {
    type: 'text',
    label: 'Rich Text',
    icon: <FiType />,
    defaultData: {
      content: '## Our Story\nWe started with a simple idea...',
    },
    fields: [
      { name: 'content', label: 'Content (Markdown)', type: 'textarea' },
    ]
  },
  {
    type: 'newsletter',
    label: 'Newsletter',
    icon: <FiMail />,
    defaultData: {
      title: 'Subscribe to our newsletter',
      description: 'Get updates on new products and exclusive offers',
      placeholder: 'Enter your email',
      buttonText: 'Subscribe',
    },
    fields: [
      { name: 'title', label: 'Heading', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'placeholder', label: 'Input Placeholder', type: 'text' },
      { name: 'buttonText', label: 'Button Text', type: 'text' },
    ]
  }
];

export const getTemplateByType = (type) => SECTION_TEMPLATES.find(t => t.type === type);
