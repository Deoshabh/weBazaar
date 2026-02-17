const CURRENT_LAYOUT_SCHEMA_VERSION = 2;

const SECTION_KEY_BY_TYPE = {
  hero: 'heroSection',
  products: 'featuredProducts',
  madeToOrder: 'madeToOrder',
  newsletter: 'newsletter',
};

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const getLayoutSectionData = (section = {}) => {
  if (isObject(section.data)) return section.data;

  const {
    id,
    type,
    enabled,
    order,
    createdAt,
    updatedAt,
    _id,
    __v,
    ...rest
  } = section || {};

  return rest;
};

const normalizeLayoutSection = (section = {}, index = 0) => {
  const data = getLayoutSectionData(section);
  const type = section?.type || data?.type || 'text';
  const enabled =
    typeof section?.enabled === 'boolean'
      ? section.enabled
      : typeof data?.enabled === 'boolean'
        ? data.enabled
        : true;

  const id = section?.id || `${type}-${index + 1}`;

  return {
    id,
    type,
    enabled,
    data: {
      ...data,
      enabled,
    },
  };
};

const normalizeLayoutSchema = (layout = []) => {
  if (!Array.isArray(layout)) return [];
  return layout
    .map((section, index) => normalizeLayoutSection(section, index))
    .filter((section) => Boolean(section?.type));
};

const deriveHomeSectionsFromLayout = (layout = [], baseHomeSections = {}) => {
  const merged = {
    ...baseHomeSections,
  };

  normalizeLayoutSchema(layout).forEach((section) => {
    const sectionKey = SECTION_KEY_BY_TYPE[section.type];
    if (!sectionKey) return;

    merged[sectionKey] = {
      ...(baseHomeSections?.[sectionKey] || {}),
      ...(section.data || {}),
      enabled: section.enabled,
    };
  });

  return merged;
};

module.exports = {
  CURRENT_LAYOUT_SCHEMA_VERSION,
  normalizeLayoutSchema,
  deriveHomeSectionsFromLayout,
};
