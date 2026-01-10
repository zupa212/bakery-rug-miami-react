import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const photosDir = path.join(process.cwd(), 'public', 'photos');

async function convertImages() {
    if (!fs.existsSync(photosDir)) {
        console.error('Photos directory not found');
        return;
    }

    const files = fs.readdirSync(photosDir);

    for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png)$/i)) {
            const inputPath = path.join(photosDir, file);
            const outputPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

            console.log(`Converting ${file} to WebP...`);

            try {
                await sharp(inputPath)
                    .webp({ quality: 80 })
                    .toFile(outputPath);
                console.log(`✓ Created ${path.basename(outputPath)}`);
            } catch (err) {
                console.error(`Error converting ${file}:`, err);
            }
        }
    }
}

convertImages();
