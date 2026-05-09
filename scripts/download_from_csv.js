const fs = require('fs');
const path = require('path');
const https = require('https');
const csv = require('csv-parser');

// Configuración de Ruta Base
const BASE_PATH = path.join(__dirname, '..', 'assets', 'images', 'cubes');
const CSV_FILE = path.join(__dirname, 'lista_descargas.csv');

/**
 * Función para descargar una imagen de forma asíncrona
 * @param {string} url - URL de la imagen
 * @param {string} dest - Ruta de destino local
 * @returns {Promise}
 */
const downloadImage = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    https.get(url, { rejectUnauthorized: false }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Fallo al descargar: Código ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Eliminar archivo parcial si hay error
      reject(err);
    });
  });
};

/**
 * Procesa el archivo CSV y descarga las imágenes una por una
 */
async function processDownloads() {
  const results = [];

  // Verificar si el CSV existe
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`Error: No se encontró el archivo ${CSV_FILE}`);
    console.log('Asegúrate de crear lista_descargas.csv en la carpeta scripts/ con las columnas: id,url,subfolder');
    return;
  }

  // Leer el CSV
  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Iniciando descarga de ${results.length} imágenes...`);
      
      for (const row of results) {
        const { id, url, subfolder } = row;

        if (!id || !url || !subfolder) {
          console.warn(`Saltando fila incompleta: ${JSON.stringify(row)}`);
          continue;
        }

        try {
          // Construir ruta dinámica
          const folderPath = path.join(BASE_PATH, subfolder);
          const fileName = `${id}.webp`;
          const dest = path.join(folderPath, fileName);

          // Asegurar que la carpeta existe
          fs.mkdirSync(folderPath, { recursive: true });

          console.log(`Descargando ${id} en ${subfolder}...`);
          
          await downloadImage(url, dest);
          
        } catch (error) {
          console.error(`Error descargando ${id}: ${error.message}`);
          // Continuar con la siguiente fila
        }
      }
      
      console.log('Proceso de descarga finalizado.');
    });
}

// Ejecutar el script
processDownloads();
