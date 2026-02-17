const request = require('supertest');
const app = require('../server');
const StorefrontConfig = require('../models/StorefrontConfig');

describe('Public settings publish contract', () => {
  it('serves published snapshot when workflow status is draft', async () => {
    const settings = await StorefrontConfig.getSettings();

    settings.homeSections.heroSection.title = 'Draft Hero';
    settings.publishedSnapshot = {
      homeSections: {
        heroSection: {
          enabled: true,
          title: 'Live Hero',
        },
      },
      layout: [
        {
          id: 'hero',
          type: 'hero',
          enabled: true,
          data: { title: 'Live Hero', enabled: true },
        },
      ],
    };
    settings.publishWorkflow = {
      ...(settings.publishWorkflow || {}),
      status: 'draft',
      scheduledAt: null,
      publishedAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date(),
    };

    await settings.save();

    const res = await request(app).get('/api/v1/settings/public');
    expect(res.status).toBe(200);
    expect(res.body.settings.homeSections.heroSection.title).toBe('Live Hero');
    expect(res.body.settings.publishWorkflow.status).toBe('draft');
  });

  it('keeps live snapshot while status is scheduled until due', async () => {
    const settings = await StorefrontConfig.getSettings();

    settings.homeSections.heroSection.title = 'Scheduled Draft Hero';
    settings.publishedSnapshot = {
      homeSections: {
        heroSection: {
          enabled: true,
          title: 'Still Live Hero',
        },
      },
      layout: [
        {
          id: 'hero',
          type: 'hero',
          enabled: true,
          data: { title: 'Still Live Hero', enabled: true },
        },
      ],
    };
    settings.publishWorkflow = {
      ...(settings.publishWorkflow || {}),
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
      publishedAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date(),
    };

    await settings.save();

    const res = await request(app).get('/api/v1/settings/public');
    expect(res.status).toBe(200);
    expect(res.body.settings.homeSections.heroSection.title).toBe('Still Live Hero');
    expect(res.body.settings.publishWorkflow.status).toBe('scheduled');
  });
});
