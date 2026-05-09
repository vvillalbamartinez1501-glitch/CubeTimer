const fs = require('fs');
const path = require('path');
const https = require('https');
const csv = require('csv-parser');

// Configuración de Rutas
const CSV_FILE = path.join(__dirname, 'notacion_3x3.csv');
const DEST_FOLDER = path.join(__dirname, '..', 'assets', 'images', 'cubes', 'basic', 'notation', '3x3');
const RELATIVE_PATH_FOR_INDEX = '../../assets/images/cubes/basic/notation/3x3';

/**
 * Función para descargar una imagen de forma asíncrona
 */
const downloadImage = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { rejectUnauthorized: false }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Error: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

/**
 * Limpia el nombre del movimiento para que sea un nombre de archivo válido
 */
const sanitizeFileName = (name) => {
  return name.replace(/'/g, '_prime');
};

async function run() {
  const results = [];
  const indexEntries = [];

  // Crear carpeta destino
  if (!fs.existsSync(DEST_FOLDER)) {
    fs.mkdirSync(DEST_FOLDER, { recursive: true });
  }

  if (!fs.existsSync(CSV_FILE)) {
    console.error(`Error: No se encuentra ${CSV_FILE}`);
    return;
  }

  console.log('--- Iniciando descarga de notaciones 3x3 ---');

  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('end', async () => {
      for (const row of results) {
        const moveName = row.data;
        const imageUrl = row.image;

        if (!moveName || !imageUrl) continue;

        const safeId = sanitizeFileName(moveName);
        const fileName = `${safeId}.webp`;
        const destPath = path.join(DEST_FOLDER, fileName);

        console.log(`Descargando notación: [${moveName}] -> ${fileName}`);

        try {
          await downloadImage(imageUrl, destPath);
          // Guardar para el index posterior
          indexEntries.push(`${safeId}: require('${RELATIVE_PATH_FOR_INDEX}/${fileName}'),`);
        } catch (error) {
          console.error(`Error en ${moveName}: ${error.message}`);
        }
      }

      console.log('\n--- Descargas completadas ---');
      console.log('\nCódigo para imageIndex.ts:');
      console.log('---------------------------');
      console.log(indexEntries.join('\n'));
      console.log('---------------------------');
      
      // Opcional: Generar archivo si se desea, pero por ahora lo imprimimos como pidió
    });
}

run();
