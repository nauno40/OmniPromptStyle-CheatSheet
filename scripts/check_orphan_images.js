import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to your data and image directory
const ARTISTS_JSON_PATH = path.resolve(__dirname, '../src/data/artists.json');
const IMG_DIR = path.resolve(__dirname, '../public/img/style');

function getFilesRecursively(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFilesRecursively(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

function findOrphanImages() {
    console.log(`Checking for images without an artist...`);
    
    // 1. Read and parse artists.json
    let artists = [];
    try {
        const data = fs.readFileSync(ARTISTS_JSON_PATH, 'utf8');
        artists = JSON.parse(data);
    } catch (err) {
        console.error(`Error reading ${ARTISTS_JSON_PATH}: ${err.message}`);
        return;
    }

    // Extract all image names defined in artists.json
    const artistImages = new Set();
    artists.forEach(artist => {
        if (artist.Image) {
            artistImages.add(artist.Image);
        }
    });

    console.log(`Found ${artistImages.size} defined image entries in artists.json.`);

    // 2. Scan image directory for image files
    if (!fs.existsSync(IMG_DIR)) {
        console.error(`Image directory not found: ${IMG_DIR}`);
        return;
    }

    const allFiles = getFilesRecursively(IMG_DIR);
    const imageFiles = allFiles.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.webp', '.jpg', '.jpeg', '.png'].includes(ext);
    });

    console.log(`Found ${imageFiles.length} image files in ${IMG_DIR}.`);

    // 3. Find image files that are NOT listed in artists.json
    const orphans = [];
    imageFiles.forEach(filePath => {
        const fileName = path.basename(filePath);
        if (!artistImages.has(fileName)) {
            orphans.push({
                name: fileName,
                path: path.relative(path.resolve(__dirname, '..'), filePath)
            });
        }
    });

    // 4. Print results
    if (orphans.length === 0) {
        console.log(`✓ All image files in ${IMG_DIR} are listed in artists.json!`);
    } else {
        console.log(`\nFound ${orphans.length} images in your folders missing from artists.json:`);
        console.log('-'.repeat(60));
        orphans.forEach(o => {
            console.log(` - ${o.name}`);
            console.log(`   Location: ${o.path}`);
        });
        console.log('-'.repeat(60));
    }
}

findOrphanImages();
