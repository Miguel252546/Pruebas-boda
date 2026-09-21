import fs from 'fs';
import path from 'path';
import cloudinary from './src/config/cloudinary.js';
import 'dotenv/config';

async function migratePhotos() {
    try {
        console.log('🚀 Iniciando migración local (Sin MongoDB)...');

        const photosDir = './Video + musica';
        const files = fs.readdirSync(photosDir);

        // Filtrar solo los archivos .jpg que empiecen con "Preboda"
        const photoFiles = files.filter(file =>
            file.toLowerCase().endsWith('.jpg') &&
            file.toLowerCase().includes('preboda')
        );

        console.log(`📸 Se encontraron ${photoFiles.length} fotos para migrar...`);

        const results = [];

        for (const file of photoFiles) {
            const filePath = path.join(photosDir, file);
            console.log(`Subiendo: ${file}...`);

            try {
                // Subir a Cloudinary
                const uploadResult = await cloudinary.uploader.upload(filePath, {
                    folder: 'boda_preboda'
                });

                // Guardar datos en la lista
                results.push({
                    name: file,
                    imageUrl: uploadResult.secure_url,
                    publicId: uploadResult.public_id,
                    date: new Date().toISOString()
                });

                console.log(`✅ Subida exitosa: ${file}`);
            } catch (uploadError) {
                console.error(`❌ Error subiendo ${file}:`, uploadError.message);
            }
        }

        // Guardar todo en un archivo JSON local
        fs.writeFileSync('datos_fotos.json', JSON.stringify(results, null, 2));

        console.log('\n✨ ¡Migración completada!');
        console.log('📂 Todas las URLs se han guardado en: datos_fotos.json');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error crítico:', error);
        process.exit(1);
    }
}

migratePhotos();
