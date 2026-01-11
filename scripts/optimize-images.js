
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const photosDir = path.join(__dirname, '../public/photos');
const MAX_WIDTH = 1920;
const QUALITY = 80;

async function optimizeImages() {
    if (!fs.existsSync(photosDir)) {
        console.error('Photos directory not found');
        return;
    }

    const files = fs.readdirSync(photosDir);

    for (const file of files) {
        if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) continue;

        const inputPath = path.join(photosDir, file);
        const stats = fs.statSync(inputPath);
        const sizeMB = stats.size / 1024 / 1024;

        // Skip if already small WebP (e.g. < 500KB) unless we want to force resize
        // But the current WebPs are 4MB+, so we should process them.
        if (file.endsWith('.webp') && sizeMB < 0.5) {
            console.log(`Skipping small WebP: ${file} (${sizeMB.toFixed(2)}MB)`);
            continue;
        }

        console.log(`Processing: ${file} (${sizeMB.toFixed(2)}MB)`);

        try {
            const tempPath = path.join(photosDir, `temp_${path.parse(file).name}.webp`);

            await sharp(inputPath)
                .resize({
                    width: MAX_WIDTH,
                    withoutEnlargement: true
                })
                .webp({ quality: QUALITY })
                .toFile(tempPath);

            const newSizeMB = fs.statSync(tempPath).size / 1024 / 1024;
            console.log(`-> Optimized: ${newSizeMB.toFixed(2)}MB`);

            // If original was NOT WebP, keep it or delete it? 
            // The code uses .webp extension references. So we should replace the .webp files.
            // If the input was .jpg, we create a .webp. The codebase seems to expect .webp based on Services.tsx.
            // Let's create .webp versions for everything.

            const targetPath = path.join(photosDir, `${path.parse(file).name}.webp`);

            // If input was .webp, we are overwriting it (rename temp to target).
            // If input was .jpg, we created a new .webp.

            fs.renameSync(tempPath, targetPath);

        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    }
    console.log('Image optimization complete!');
}

optimizeImages();
