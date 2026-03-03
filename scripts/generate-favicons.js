/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateFavicon() {
    const inputPath = path.join(__dirname, '..', 'public', 'logo.png');
    const faviconPath = path.join(__dirname, '..', 'src', 'app', 'favicon.ico');
    const favicon32Path = path.join(__dirname, '..', 'public', 'favicon-32x32.png');
    const favicon16Path = path.join(__dirname, '..', 'public', 'favicon-16x16.png');
    const apple180Path = path.join(__dirname, '..', 'public', 'apple-touch-icon.png');
    const icon192Path = path.join(__dirname, '..', 'public', 'icon-192.png');
    const icon512Path = path.join(__dirname, '..', 'public', 'icon-512.png');

    console.log('Generating favicons with transparent background...');

    // Step 1: Load the image and remove black background
    const { data, info } = await sharp(inputPath)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    // Make black/near-black pixels transparent (threshold: RGB all < 30)
    const threshold = 30;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r < threshold && g < threshold && b < threshold) {
            data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
    }

    // Create the transparent version
    const transparentBuffer = await sharp(data, {
        raw: { width: info.width, height: info.height, channels: 4 }
    }).png().toBuffer();

    // Helper: resize with padding removed (trim whitespace/transparency then resize to fill)
    const makeIcon = async (size, outputPath) => {
        // Trim transparent edges first, then resize to fill the target
        const trimmed = await sharp(transparentBuffer).trim().toBuffer();
        await sharp(trimmed)
            .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(outputPath);
    };

    // 32x32 PNG (bigger icon by trimming first)
    await makeIcon(32, favicon32Path);
    console.log('  ✓ favicon-32x32.png');

    // 16x16 PNG
    await makeIcon(16, favicon16Path);
    console.log('  ✓ favicon-16x16.png');

    // Apple touch icon 180x180
    await makeIcon(180, apple180Path);
    console.log('  ✓ apple-touch-icon.png');

    // Icon 192x192 (PWA)
    await makeIcon(192, icon192Path);
    console.log('  ✓ icon-192.png');

    // Icon 512x512 (PWA)
    await makeIcon(512, icon512Path);
    console.log('  ✓ icon-512.png');

    // favicon.ico (32x32 PNG with transparency)
    const trimmedForIco = await sharp(transparentBuffer).trim().toBuffer();
    const icoBuffer = await sharp(trimmedForIco)
        .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
    fs.writeFileSync(faviconPath, icoBuffer);
    console.log('  ✓ favicon.ico');

    console.log('Done! All favicons with transparent bg generated.');
}

generateFavicon().catch(console.error);
