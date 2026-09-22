import fs from 'fs';
import path from 'path';
import cloudinary from './src/config/cloudinary.js';
import 'dotenv/config';

function uploadLargeVideo(filePath) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(
            filePath,
            {
                resource_type: 'video',
                chunk_size: 5 * 1024 * 1024,
                folder: 'boda_video',
                overwrite: true
            },
            (error, result) => (error ? reject(error) : resolve(result))
        );
    });
}

async function migrateVideo() {
    const videoFile = process.argv[2] || './Video + musica/Yda y Emi Preboda.mp4';
    const filePath = path.resolve(videoFile);

    if (!fs.existsSync(filePath)) {
        console.error(`❌ No existe el archivo: ${videoFile}`);
        process.exit(1);
    }

    try {
        console.log(`🎬 Subiendo: ${videoFile} (${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB)...`);
        const result = await uploadLargeVideo(filePath);

        const data = {
            name: path.basename(filePath),
            videoUrl: result.secure_url,
            publicId: result.public_id,
            duration: result.duration,
            bytes: result.bytes,
            date: new Date().toISOString()
        };

        fs.writeFileSync('datos_video.json', JSON.stringify(data, null, 2));

        console.log(`✅ Subida exitosa: ${result.public_id}`);
        console.log(`⏱️  Duración: ${result.duration}s`);
        console.log(`🎥 URL: ${result.secure_url}`);
        console.log('\n✨ ¡Migración completada! URL guardada en: datos_video.json');
        process.exit(0);
    } catch (error) {
        const message = error?.error?.message || error.message;
        console.error('❌ Error subiendo el video:', message);
        process.exit(1);
    }
}

migrateVideo();