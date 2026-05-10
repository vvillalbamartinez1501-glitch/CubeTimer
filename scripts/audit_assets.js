const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const IMAGE_INDEX_PATH = path.join(PROJECT_ROOT, 'src/data/imageIndex.ts');

function checkFile(relPathFromIndex) {
    // relPathFromIndex is like '../../assets/...'
    // It is relative to src/data/
    const fullPath = path.resolve(PROJECT_ROOT, 'src/data', relPathFromIndex);
    return fs.existsSync(fullPath);
}

console.log('--- Iniciando Auditoría de Assets ---');

const missingFiles = [];
const imageIndexContent = fs.readFileSync(IMAGE_INDEX_PATH, 'utf8');

// Regex para encontrar los requires: "id": require('path')
const requireRegex = /"([^"]+)":\s*require\('([^']+)'\),/g;
let match;
let newContent = imageIndexContent;

while ((match = requireRegex.exec(imageIndexContent)) !== null) {
    const id = match[1];
    const filePath = match[2];
    const exists = checkFile(filePath);
    
    console.log(`Checking ${id}: ${exists ? 'OK' : 'MISSING'}`);
    
    if (!exists) {
        console.warn(`[!] Falta archivo para ${id}: ${filePath}`);
        missingFiles.push(id);
        // Comentamos la línea en el nuevo contenido
        const lineToComment = match[0];
        newContent = newContent.replace(lineToComment, `// ${lineToComment} // ARCHIVO NO ENCONTRADO`);
    }
}

if (missingFiles.length > 0) {
    console.log(`\nSe encontraron ${missingFiles.length} archivos faltantes. Actualizando imageIndex.ts...`);
    fs.writeFileSync(IMAGE_INDEX_PATH, newContent);
    console.log('imageIndex.ts actualizado (líneas faltantes comentadas).');
} else {
    console.log('\nTodos los archivos definidos en el índice existen en el sistema.');
}

console.log('\n--- Resumen de IDs faltantes ---');
console.log(JSON.stringify(missingFiles, null, 2));

fs.writeFileSync(path.join(__dirname, 'missing_assets_report.json'), JSON.stringify(missingFiles, null, 2));
