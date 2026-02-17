import {
  CURRENT_LAYOUT_SCHEMA_VERSION,
  normalizeLayoutSchema,
  normalizeSettingsLayout,
  resolveFeaturedProductsConfig,
} from '@/utils/layoutSchema';

describe('layoutSchema utils', () => {
  it('normalizes flat legacy layout items into current schema', () => {
    const layout = [
      {
        id: 'hero-1',
        type: 'hero',
        title: 'Hero Title',
        subtitle: 'Hero Subtitle',
        enabled: true,
      },
      {
        type: 'products',
        productLimit: 6,
      },
    ];

    const normalized = normalizeLayoutSchema(layout);

    expect(normalized).toHaveLength(2);
    expect(normalized[0]).toMatchObject({
      id: 'hero-1',
      type: 'hero',
      enabled: true,
      data: {
        title: 'Hero Title',
        subtitle: 'Hero Subtitle',
        enabled: true,
      },
    });

    expect(normalized[1]).toMatchObject({
      type: 'products',
      enabled: true,
      data: {
        productLimit: 6,
        enabled: true,
      },
    });
  });

  it('derives homeSections from normalized layout with schema version', () => {
    const settings = {
      layout: [
        {
          id: 'hero',
          type: 'hero',
          enabled: true,
          data: {
            title: 'Live Hero',
            primaryButtonText: 'Shop',
            primaryButtonLink: '/products',
          },
        },
        {
          id: 'products',
          type: 'products',
          enabled: true,
          data: {
            productLimit: 12,
            productSelection: 'latest',
          },
        },
      ],
    };

    const normalized = normalizeSettingsLayout(settings);

    expect(normalized.layoutSchemaVersion).toBe(CURRENT_LAYOUT_SCHEMA_VERSION);
    expect(normalized.homeSections.heroSection.title).toBe('Live Hero');
    expect(normalized.homeSections.featuredProducts.productLimit).toBe(12);
  });

  it('resolves featured products config from effective settings', () => {
    const config = resolveFeaturedProductsConfig({
      layout: [
        {
          id: 'products',
          type: 'products',
          enabled: true,
          data: {
            productLimit: 10,
            productSelection: 'manual',
            manualProductIds: ['p1', 'p2'],
          },
        },
      ],
    });

    expect(config).toEqual({
      productLimit: 10,
      productSelection: 'manual',
      manualProductIds: ['p1', 'p2'],
    });
  });
});
