
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ffmpeg.setFfmpegPath(ffmpegPath);

const videoDir = path.join(__dirname, '../public/video');

async function compressVideo(file) {
    const inputPath = path.join(videoDir, file);
    const tempPath = path.join(videoDir, `temp_${file}`);

    console.log(`Processing: ${file}`);
    const originalSize = fs.statSync(inputPath).size / 1024 / 1024;

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions([
                '-c:v libx264',
                '-crf 30',          // Higher CRF = smaller size (range 0-51, 23 is default, 28-30 is "ultra small")
                '-preset veryslow', // Best compression efficiency
                '-vf scale=1280:-2',// Resize to 720p width, auto height
                '-c:a aac',
                '-b:a 96k'          // Low audio bitrate
            ])
            .save(tempPath)
            .on('end', () => {
                const newSize = fs.statSync(tempPath).size / 1024 / 1024;
                console.log(`Finished ${file}: ${originalSize.toFixed(2)}MB -> ${newSize.toFixed(2)}MB`);

                // Replace original
                fs.unlinkSync(inputPath);
                fs.renameSync(tempPath, inputPath);
                resolve();
            })
            .on('error', (err) => {
                console.error(`Error processing ${file}:`, err);
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                reject(err);
            });
    });
}

async function main() {
    if (!fs.existsSync(videoDir)) {
        console.error('Video directory not found');
        return;
    }

    const files = fs.readdirSync(videoDir).filter(f => f.endsWith('.mp4'));

    for (const file of files) {
        try {
            await compressVideo(file);
        } catch (e) {
            console.error(e);
        }
    }
    console.log('All videos processed!');
}

main();
