const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_FILE = path.join(__dirname, 'data.json');
const OUTPUT_BASE = path.join(__dirname, '../assets/images/cubes');
const INDEX_FILE = path.join(__dirname, '../src/data/imageIndex.ts');

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const options = { rejectUnauthorized: false };
    https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
      file.on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    }).on('error', reject);
  });
}

function parseData(content) {
  try {
    return JSON.parse(content);
  } catch (e) {
    // Assume JSONL
    return content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => JSON.parse(line));
  }
}

function normalizeItem(item) {
  if (item.id && item.category && item.url) {
    return item;
  }
  // Web scraper fallback
  if (item.data && item.image && item.web_scraper_start_url) {
    const rawCategory = item.web_scraper_start_url.split('/es/')[1]; // e.g. "notation/2x2x2"
    let category = rawCategory ? rawCategory.replace('2x2x2', '2x2').replace('3x3x3', '3x3').replace('4x4x4', '4x4') : 'unknown';
    // Remove apostrophes or weird chars for filename, but keep id for JS object (will be quoted)
    const id = item.data;
    const url = item.image;
    return { id, category, url };
  }
  return null;
}

async function run() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('data.json not found at', DATA_FILE);
    return;
  }
  
  const content = fs.readFileSync(DATA_FILE, 'utf8');
  const data = parseData(content);
  
  const structure = {};

  for (const rawItem of data) {
    const item = normalizeItem(rawItem);
    if (!item || !item.id || !item.url) continue;

    const { id, category, url } = item;
    const destDir = path.join(OUTPUT_BASE, category);
    fs.mkdirSync(destDir, { recursive: true });

    const ext = url.includes('.webp') ? '.webp' : '.png';
    const safeFilename = id.replace(/'/g, '_prime').replace(/\//g, '_') + ext;
    const destPath = path.join(destDir, safeFilename);

    console.log(`Downloading ${id} to ${category}...`);
    try {
      await downloadImage(url, destPath);
      
      const parts = category.split('/');
      let current = structure;
      for (const part of parts) {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
      const relPath = `../../assets/images/cubes/${category}/${safeFilename}`;
      current[id] = `require('${relPath}')`;
    } catch (e) {
      console.error(`Failed to download ${id}:`, e.message);
    }
  }

  const generateIndexContent = (obj, indent = '  ') => {
    let content = '{\n';
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        content += `${indent}"${key}": ${value},\n`;
      } else {
        content += `${indent}"${key}": ${generateIndexContent(value, indent + '  ')},\n`;
      }
    }
    content += `${indent.substring(2)}}`;
    return content;
  };

  const indexCode = `// Generado automáticamente por scripts/download_assets.js\n\nexport const CubeImages: any = ${generateIndexContent(structure, '  ')};\n`;
  fs.mkdirSync(path.dirname(INDEX_FILE), { recursive: true });
  fs.writeFileSync(INDEX_FILE, indexCode, 'utf8');
  console.log('imageIndex.ts generated successfully!');
}

run();
