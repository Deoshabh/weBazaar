const SiteSettings = require('../models/SiteSettings');

const DEFAULT_INTERVAL_MS = Number(process.env.PUBLISH_WORKFLOW_INTERVAL_MS || 60000);

const createSnapshotPayload = (settings) => ({
  branding: settings.branding,
  banners: settings.banners,
  announcementBar: settings.announcementBar,
  homeSections: settings.homeSections,
  layout: settings.layout,
  theme: settings.theme,
});

const runScheduledPublishCheck = async () => {
  try {
    const settings = await SiteSettings.getSettings();
    const workflow = settings.publishWorkflow || {};

    if (workflow.status !== 'scheduled') {
      return { promoted: false, reason: 'not-scheduled' };
    }

    const scheduledAt = workflow.scheduledAt ? new Date(workflow.scheduledAt) : null;
    if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
      return { promoted: false, reason: 'invalid-schedule' };
    }
    if (Date.now() < scheduledAt.getTime()) {
      return { promoted: false, reason: 'not-due-yet', scheduledAt };
    }

    settings.publishWorkflow = {
      ...workflow,
      status: 'live',
      scheduledAt: null,
      publishedAt: new Date(),
      updatedAt: new Date(),
    };

    settings.publishedSnapshot = createSnapshotPayload(settings);
    await settings.save();

    console.log('[publish-workflow] Scheduled publish promoted to live.');
    return {
      promoted: true,
      reason: 'scheduled-promoted',
      publishedAt: settings.publishWorkflow.publishedAt,
    };
  } catch (error) {
    console.error('[publish-workflow] Failed scheduled publish check:', error.message);
    return {
      promoted: false,
      reason: 'error',
      error: error.message,
    };
  }
};

const startPublishWorkflowWorker = () => {
  if (process.env.NODE_ENV === 'test') return () => {};

  runScheduledPublishCheck();
  const timer = setInterval(runScheduledPublishCheck, DEFAULT_INTERVAL_MS);

  return () => {
    clearInterval(timer);
  };
};

module.exports = {
  runScheduledPublishCheck,
  startPublishWorkflowWorker,
};
