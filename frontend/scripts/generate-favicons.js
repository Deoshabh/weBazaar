/**
 * generate-favicons.js
 * Generates all favicon / app-icon sizes from public/favicon.svg using sharp.
 * Run once: node scripts/generate-favicons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '../public/favicon.svg');
const OUT = path.join(__dirname, '../public');

async function png(size, filename, opts = {}) {
  const { rounded = false } = opts;
  let pipeline = sharp(SRC, { density: 300 }).resize(size, size);
  if (rounded) {
    // Apply circular mask
    const circle = Buffer.from(
      `<svg><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`,
    );
    pipeline = pipeline.composite([{ input: circle, blend: 'dest-in' }]);
  }
  await pipeline.png({ compressionLevel: 9 }).toFile(path.join(OUT, filename));
  console.log(`  ✓  ${filename} (${size}×${size})`);
}

/**
 * Write a minimal .ico containing embedded PNG frames.
 * ICO format supports PNG data directly in modern browsers / OS.
 */
async function buildIco(sizes, outFile) {
  const frames = await Promise.all(
    sizes.map(async (size) => {
      const buf = await sharp(SRC, { density: 300 })
        .resize(size, size)
        .png({ compressionLevel: 9 })
        .toBuffer();
      return buf;
    }),
  );

  const count = frames.length;
  // Header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);    // Reserved
  header.writeUInt16LE(1, 2);    // Type: 1 = ICO
  header.writeUInt16LE(count, 4);

  // Directory entries: 16 bytes each
  const dirSize = count * 16;
  const dirs = Buffer.alloc(dirSize);
  const dataStart = 6 + dirSize;
  let offset = dataStart;

  frames.forEach((frame, i) => {
    const size = sizes[i];
    const base = i * 16;
    dirs.writeUInt8(size >= 256 ? 0 : size, base);      // Width  (0 = 256)
    dirs.writeUInt8(size >= 256 ? 0 : size, base + 1);  // Height (0 = 256)
    dirs.writeUInt8(0, base + 2);    // Color count (0 = no palette)
    dirs.writeUInt8(0, base + 3);    // Reserved
    dirs.writeUInt16LE(1, base + 4); // Planes
    dirs.writeUInt16LE(32, base + 6);// Bit count
    dirs.writeUInt32LE(frame.length, base + 8);  // Size of image data
    dirs.writeUInt32LE(offset, base + 12);       // Offset to image data
    offset += frame.length;
  });

  const ico = Buffer.concat([header, dirs, ...frames]);
  fs.writeFileSync(path.join(OUT, outFile), ico);
  console.log(`  ✓  ${outFile} (${sizes.join(', ')}px)`);
}

async function main() {
  console.log('\n🎨  Generating favicons from favicon.svg …\n');

  // Standard favicon PNGs
  await png(16, 'favicon-16x16.png');
  await png(32, 'favicon-32x32.png');
  await png(48, 'favicon-48x48.png');
  await png(96, 'favicon-96x96.png');

  // Apple touch icon — iOS home screen (must be square, no rounding applied
  // by us; iOS applies the rounding itself)
  await png(180, 'apple-touch-icon.png');

  // Android / PWA
  await png(192, 'android-chrome-192x192.png');
  await png(512, 'android-chrome-512x512.png');

  // Maskable icon (with safe zone padding — 40% padding means the actual
  // icon sits in the centre 60%)
  {
    const size = 512;
    const inner = Math.round(size * 0.6);
    const pad = Math.round((size - inner) / 2);
    const bg = Buffer.from(
      `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" rx="0" fill="#f0ece3"/>
      </svg>`,
    );
    const icon = await sharp(SRC, { density: 300 }).resize(inner, inner).png().toBuffer();
    await sharp(bg)
      .composite([{ input: icon, top: pad, left: pad }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT, 'android-chrome-maskable-512x512.png'));
    console.log('  ✓  android-chrome-maskable-512x512.png (512×512)');
  }

  // General logo.png for JSON-LD / structured data
  await png(512, 'logo.png');

  // OG image — 1200×630 banner: cream bg + "We" monogram icon + wordmark
  // Uses only paths/rects/tspans so libvips renders it without needing web fonts.
  {
    const W = 1200, H = 630;

    // Render the SVG favicon at 280px to use as the central icon
    const iconBuf = await sharp(SRC, { density: 300 })
      .resize(280, 280)
      .png()
      .toBuffer();

    // Cream background with subtle vignette — pure SVG rects, no <text>
    const bgSvg = Buffer.from(
      `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="vig" cx="50%" cy="50%" r="70%">
            <stop offset="0%"   stop-color="#f5f0e8"/>
            <stop offset="100%" stop-color="#d8cebc" stop-opacity="0.6"/>
          </radialGradient>
        </defs>
        <rect width="${W}" height="${H}" fill="#f0ece3"/>
        <rect width="${W}" height="${H}" fill="url(#vig)"/>
      </svg>`,
    );

    // Wordmark as pure SVG paths so fonts are irrelevant — rendered on top
    // positioned bottom-centre below the icon
    const textSvg = Buffer.from(
      `<svg width="${W}" height="120" xmlns="http://www.w3.org/2000/svg">
        <text
          x="${W / 2}" y="90"
          text-anchor="middle"
          font-family="Arial Black, Arial, sans-serif"
          font-size="88"
          font-weight="900"
          letter-spacing="-2"
          fill="#1e4d2b"
        >weBazaar</text>
      </svg>`,
    );

    const iconTop  = Math.round((H - 280 - 120 - 20) / 2);
    const iconLeft = Math.round((W - 280) / 2);
    const textTop  = iconTop + 280 + 20;

    await sharp(bgSvg)
      .composite([
        { input: iconBuf, top: iconTop,  left: iconLeft },
        { input: textSvg, top: textTop,  left: 0 },
      ])
      .jpeg({ quality: 95 })
      .toFile(path.join(OUT, 'og', 'webazaar-og-banner.jpg'));
    console.log('  ✓  og/webazaar-og-banner.jpg (1200×630)');
  }

  // favicon.ico — multi-size (16, 32, 48) with embedded PNGs
  await buildIco([16, 32, 48], 'favicon.ico');

  // site.webmanifest
  const manifest = {
    name: 'weBazaar',
    short_name: 'weBazaar',
    description: 'Premium leather & vegan shoes',
    start_url: '/',
    display: 'standalone',
    background_color: '#f0ece3',
    theme_color: '#1e4d2b',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/android-chrome-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  fs.writeFileSync(
    path.join(OUT, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2),
  );
  console.log('  ✓  site.webmanifest');

  console.log('\n✅  All done!\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
