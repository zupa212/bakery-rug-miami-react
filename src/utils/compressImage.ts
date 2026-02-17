/**
 * Client-side image compression utility.
 * Compresses images to WebP format, targeting < 1MB output.
 * Uses the browser Canvas API — no external dependencies.
 */

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const TARGET_SIZE = 1 * 1024 * 1024;   // 1MB target
const MAX_DIMENSION = 2048;            // Max width/height

export async function compressImage(file: File): Promise<File> {
    // Skip if already small enough and is webp
    if (file.size <= TARGET_SIZE && file.type === 'image/webp') {
        return file;
    }

    // Skip non-image files
    if (!file.type.startsWith('image/')) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            // Calculate new dimensions (maintain aspect ratio)
            let { width, height } = img;
            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(file); // Fallback to original
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Try WebP first, then JPEG as fallback
            const tryCompress = (quality: number, format: string): Promise<Blob | null> => {
                return new Promise((res) => {
                    canvas.toBlob(
                        (blob) => res(blob),
                        format,
                        quality
                    );
                });
            };

            (async () => {
                // Start at 0.85 quality, step down until under target
                let quality = 0.85;
                let blob: Blob | null = null;
                const format = 'image/webp';

                while (quality >= 0.3) {
                    blob = await tryCompress(quality, format);
                    if (blob && blob.size <= TARGET_SIZE) break;
                    quality -= 0.1;
                }

                // If WebP didn't work well enough, try JPEG
                if (!blob || blob.size > MAX_FILE_SIZE) {
                    quality = 0.7;
                    while (quality >= 0.3) {
                        blob = await tryCompress(quality, 'image/jpeg');
                        if (blob && blob.size <= TARGET_SIZE) break;
                        quality -= 0.1;
                    }
                }

                if (blob) {
                    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
                    const baseName = file.name.replace(/\.[^/.]+$/, '');
                    const compressed = new File([blob], `${baseName}.${ext}`, {
                        type: blob.type,
                        lastModified: Date.now()
                    });

                    const savings = ((1 - compressed.size / file.size) * 100).toFixed(0);
                    console.log(
                        `[Compress] ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(compressed.size / 1024).toFixed(0)}KB (${savings}% smaller)`
                    );

                    resolve(compressed);
                } else {
                    resolve(file); // Fallback to original
                }
            })();
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image for compression'));
        };

        img.src = url;
    });
}
