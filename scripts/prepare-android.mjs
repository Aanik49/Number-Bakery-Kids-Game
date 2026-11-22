import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const androidDir = path.join(rootDir, 'android');
const manifestPath = path.join(androidDir, 'app', 'src', 'main', 'AndroidManifest.xml');
const resDir = path.join(androidDir, 'app', 'src', 'main', 'res');
const svgIconPath = path.join(rootDir, 'public', 'icon.svg');

if (!fs.existsSync(androidDir)) {
  console.error('Android project folder not found. Run `npx cap add android` first.');
  process.exit(1);
}

// 1. Patch AndroidManifest.xml with notification permissions and tablet/phone screen support
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');

  const permissionsToAdd = [
    '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />',
    '<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />',
    '<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />',
    '<uses-permission android:name="android.permission.VIBRATE" />',
  ];

  for (const perm of permissionsToAdd) {
    if (!manifest.includes(perm)) {
      if (manifest.includes('<uses-permission android:name="android.permission.INTERNET" />')) {
        manifest = manifest.replace(
          '<uses-permission android:name="android.permission.INTERNET" />',
          `<uses-permission android:name="android.permission.INTERNET" />\n    ${perm}`
        );
      } else {
        manifest = manifest.replace('</manifest>', `    ${perm}\n</manifest>`);
      }
    }
  }

  // Ensure multi-screen / tablet & varying aspect ratio support
  if (!manifest.includes('<supports-screens')) {
    manifest = manifest.replace(
      '<application',
      `<supports-screens\n        android:smallScreens="true"\n        android:normalScreens="true"\n        android:largeScreens="true"\n        android:xlargeScreens="true"\n        android:anyDensity="true" />\n\n    <application`
    );
  }

  fs.writeFileSync(manifestPath, manifest, 'utf8');
  console.log('Updated AndroidManifest.xml with notifications and multi-screen support.');
}

// 2. Generate Android PNG mipmap launcher icons from public/icon.svg (if ImageMagick or librsvg is available)
const mipmapSizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

function tryRenderSvgToPng(svgFile, outFile, size) {
  const cmds = [
    `rsvg-convert -w ${size} -h ${size} "${svgFile}" -o "${outFile}"`,
    `magick -background none -density 384 "${svgFile}" -resize ${size}x${size} "${outFile}"`,
    `convert -background none -density 384 "${svgFile}" -resize ${size}x${size} "${outFile}"`,
  ];
  for (const cmd of cmds) {
    try {
      execSync(cmd, { stdio: 'ignore' });
      return true;
    } catch {
      // Try next converter
    }
  }
  return false;
}

if (fs.existsSync(svgIconPath) && fs.existsSync(resDir)) {
  let convertedCount = 0;
  for (const { folder, size } of mipmapSizes) {
    const dir = path.join(resDir, folder);
    fs.mkdirSync(dir, { recursive: true });
    for (const baseName of ['ic_launcher', 'ic_launcher_round', 'ic_launcher_foreground']) {
      // Remove any conflicting .webp icon to prevent Gradle duplicate resource errors
      const webpPath = path.join(dir, `${baseName}.webp`);
      if (fs.existsSync(webpPath)) {
        fs.unlinkSync(webpPath);
      }
      const target = path.join(dir, `${baseName}.png`);
      if (tryRenderSvgToPng(svgIconPath, target, size)) {
        convertedCount++;
      }
    }
  }
  if (convertedCount > 0) {
    console.log(`Generated ${convertedCount} Android mipmap PNG launcher icons from public/icon.svg.`);
  } else {
    console.log('SVG-to-PNG CLI converter not available locally; keeping default launcher icons.');
  }
}
