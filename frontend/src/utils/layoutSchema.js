import { SITE_SETTINGS_DEFAULTS } from '@/constants/siteSettingsDefaults';

export const CURRENT_LAYOUT_SCHEMA_VERSION = 2;

const SECTION_KEY_BY_TYPE = {
  hero: 'heroSection',
  products: 'featuredProducts',
  madeToOrder: 'madeToOrder',
  newsletter: 'newsletter',
};

export const getLayoutSectionData = (section = {}) => {
  if (section?.data && typeof section.data === 'object' && !Array.isArray(section.data)) {
    return section.data;
  }

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

export const normalizeLayoutSection = (section = {}, index = 0) => {
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

export const normalizeLayoutSchema = (layout = []) => {
  if (!Array.isArray(layout)) return [];
  return layout
    .map((section, index) => normalizeLayoutSection(section, index))
    .filter((section) => Boolean(section?.type));
};

export const deriveHomeSectionsFromLayout = (layout = [], baseHomeSections = {}) => {
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

export const normalizeSettingsLayout = (settings = {}) => {
  const defaultsHomeSections = SITE_SETTINGS_DEFAULTS.homeSections || {};
  const normalizedLayout = normalizeLayoutSchema(settings.layout || []);
  const baseHomeSections = {
    ...defaultsHomeSections,
    ...(settings.homeSections || {}),
  };

  const homeSections = normalizedLayout.length
    ? deriveHomeSectionsFromLayout(normalizedLayout, baseHomeSections)
    : baseHomeSections;

  return {
    ...settings,
    layoutSchemaVersion:
      Number(settings.layoutSchemaVersion) || CURRENT_LAYOUT_SCHEMA_VERSION,
    layout: normalizedLayout,
    homeSections,
  };
};

export const resolveFeaturedProductsConfig = (settings = {}) => {
  const normalized = normalizeSettingsLayout(settings);
  const featuredProducts = normalized.homeSections?.featuredProducts || {};

  return {
    productLimit: Number(featuredProducts.productLimit ?? 8),
    productSelection: featuredProducts.productSelection ?? 'latest',
    manualProductIds: featuredProducts.manualProductIds ?? [],
  };
};
