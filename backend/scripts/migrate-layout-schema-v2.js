const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SiteSettings = require('../models/SiteSettings');
const {
  CURRENT_LAYOUT_SCHEMA_VERSION,
  normalizeLayoutSchema,
  deriveHomeSectionsFromLayout,
} = require('../utils/layoutSchema');

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const settings = await SiteSettings.getSettings();
  const normalizedLayout = normalizeLayoutSchema(settings.layout || []);
  const baseHomeSections = settings.homeSections?.toObject
    ? settings.homeSections.toObject()
    : settings.homeSections || {};

  settings.layout = normalizedLayout;
  settings.layoutSchemaVersion = CURRENT_LAYOUT_SCHEMA_VERSION;
  settings.homeSections = deriveHomeSectionsFromLayout(normalizedLayout, baseHomeSections);

  await settings.save();

  console.log('[migration] layout schema migrated to v2');
  console.log(`[migration] sections normalized: ${normalizedLayout.length}`);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('[migration] failed:', error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
