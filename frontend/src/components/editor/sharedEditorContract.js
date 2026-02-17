export const EDITOR_WIDGET_TYPES = [
  'heading',
  'text',
  'button',
  'image',
  'video',
  'gallery',
  'accordion',
  'tabs',
  'carousel',
  'form',
  'divider',
  'spacer',
];

export const EDITOR_LAYOUT_TYPES = ['row', 'column', 'container'];

export const GLOBAL_WIDGET_TYPES = [
  'text',
  'heading',
  'button',
  'image',
  'video',
  'gallery',
  'accordion',
  'tabs',
  'carousel',
  'form',
];

const ALLOWED_BLOCK_TYPES = new Set([
  ...EDITOR_WIDGET_TYPES,
  ...EDITOR_LAYOUT_TYPES,
]);

const ALLOWED_BLOCK_ZONES = new Set(['before', 'after']);

const isPlainObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const normalizeIdPrefix = (idPrefix, fallback = 'node') => {
  const normalized = String(idPrefix || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
  return normalized || fallback;
};

const normalizeType = (type, fallback = 'text') => {
  const value = String(type || '').trim();
  if (ALLOWED_BLOCK_TYPES.has(value)) return value;
  return ALLOWED_BLOCK_TYPES.has(fallback) ? fallback : 'text';
};

const normalizeZone = (zone, fallback = 'after') => {
  const value = String(zone || '').trim();
  if (ALLOWED_BLOCK_ZONES.has(value)) return value;
  return ALLOWED_BLOCK_ZONES.has(fallback) ? fallback : 'after';
};

const createBlockId = (idPrefix = 'node') =>
  `${normalizeIdPrefix(idPrefix, 'node')}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeId = (id, idPrefix = 'node') => {
  const value = typeof id === 'string' ? id.trim() : '';
  return value || createBlockId(idPrefix);
};

const DEFAULT_BLOCK_PROPS = {
  text: { text: 'Text block' },
  heading: { text: 'Heading block' },
  button: { text: 'Button', link: '/products', className: 'btn btn-primary' },
  image: { src: '', alt: 'Image' },
  video: { src: '', posterUrl: '', controls: true },
  gallery: { images: [], columns: 3 },
  accordion: { items: [{ title: 'Accordion item', content: 'Accordion content' }] },
  tabs: { items: [{ label: 'Tab 1', content: 'Tab content' }, { label: 'Tab 2', content: 'Another tab' }] },
  carousel: { items: [{ image: '', title: 'Slide title', description: 'Slide description' }] },
  form: { submitText: 'Submit' },
  row: { columns: 2 },
  column: {},
  container: {},
  divider: {},
  spacer: { height: 24 },
};

const deepClone = (value) => {
  if (value === undefined || value === null) return value;
  if (typeof globalThis !== 'undefined' && typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

/**
 * @typedef {Object} EditorBlock
 * @property {string} id
 * @property {string} type
 * @property {'before'|'after'} zone
 * @property {Record<string, any>} props
 * @property {EditorBlock[]} children
 */

/**
 * @typedef {Object} EditorBlockOptions
 * @property {string=} defaultType
 * @property {string=} idPrefix
 */

export const getDefaultBlockProps = (type) => {
  const normalizedType = normalizeType(type, 'text');
  const defaults = DEFAULT_BLOCK_PROPS[normalizedType] || {};
  return deepClone(defaults);
};

/**
 * @param {{type?: string, idPrefix?: string, zone?: string, props?: Record<string, any>, children?: any[]}=} options
 * @returns {EditorBlock}
 */
export const createEditorBlock = ({
  type = 'text',
  idPrefix = 'node',
  zone = 'after',
  props = {},
  children = [],
} = {}) => ({
  id: createBlockId(idPrefix),
  type: normalizeType(type, 'text'),
  zone: normalizeZone(zone, 'after'),
  props: {
    ...getDefaultBlockProps(type),
    ...(isPlainObject(props) ? props : {}),
  },
  children: Array.isArray(children) ? deepClone(children) : [],
});

/**
 * @param {any} block
 * @param {EditorBlockOptions=} options
 * @returns {EditorBlock}
 */
export const normalizeEditorBlock = (block, { defaultType = 'text', idPrefix = 'node' } = {}) => {
  const source = isPlainObject(block) ? block : {};
  const normalizedType = normalizeType(source.type, defaultType);
  const normalizedZone = normalizeZone(source.zone, 'after');
  const normalizedId = normalizeId(source.id, idPrefix);
  const children = Array.isArray(source.children) ? source.children : [];

  return {
    ...source,
    id: normalizedId,
    type: normalizedType,
    zone: normalizedZone,
    props: {
      ...getDefaultBlockProps(normalizedType),
      ...(isPlainObject(source.props) ? source.props : {}),
    },
    children: children.map((child) => normalizeEditorBlock(child, { defaultType, idPrefix })),
  };
};

/**
 * @param {any} blocks
 * @param {EditorBlockOptions=} options
 * @returns {EditorBlock[]}
 */
export const normalizeEditorBlockTree = (blocks, options = {}) => {
  if (!Array.isArray(blocks)) return [];
  return blocks.filter(Boolean).map((block) => normalizeEditorBlock(block, options));
};

/**
 * @param {any} widgetMap
 * @param {{idPrefix?: string}=} options
 * @returns {Record<string, EditorBlock>}
 */
export const normalizeEditorWidgetMap = (widgetMap, { idPrefix = 'widget' } = {}) => {
  if (!isPlainObject(widgetMap)) return {};

  return Object.entries(widgetMap).reduce((acc, [key, value]) => {
    if (!isPlainObject(value)) return acc;

    const normalizedKey = String(key || '').trim();
    if (!normalizedKey) return acc;

    const normalized = normalizeEditorBlock(
      {
        ...value,
        id: value.id || normalizedKey,
      },
      { defaultType: 'text', idPrefix },
    );

    acc[normalizedKey] = normalized;
    return acc;
  }, {});
};
