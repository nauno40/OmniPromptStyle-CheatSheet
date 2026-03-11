const fs = require('fs');
const path = require('path');

function extractArray(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return [];
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!match) return [];
    try {
        let jsonStr = match[0]
            .replace(/,\s*\]/g, ']')
            .replace(/,\s*\}/g, '}');
        jsonStr = jsonStr.replace(/\/\/.*$/gm, '');
        return eval(jsonStr);
    } catch (e) {
        console.error(`Error parsing ${filePath}:`, e);
        return [];
    }
}

// Current workspace data paths
const artistsSd15 = extractArray(path.join(__dirname, '../src/data/artists_backup.ts'));
const artistsFlux = extractArray(path.join(__dirname, '../src/data/artists_flux_backup.ts'));

// If backups don't exist, try original names (in case they haven't been deleted yet)
const artistsSd15_orig = extractArray(path.join(__dirname, '../src/data/artists.ts'));
const artistsFlux_orig = extractArray(path.join(__dirname, '../src/data/artists_flux.ts'));

const allData = [...artistsSd15, ...artistsFlux, ...artistsSd15_orig, ...artistsFlux_orig];

const artistMap = new Map();
allData.forEach(artist => {
    const { Model, Checkpoint, ...baseArtist } = artist;
    if (!artistMap.has(baseArtist.Name)) {
        artistMap.set(baseArtist.Name, baseArtist);
    } else {
        const existing = artistMap.get(baseArtist.Name);
        Object.keys(baseArtist).forEach(key => {
            if (!existing[key] && baseArtist[key]) {
                existing[key] = baseArtist[key];
            }
        });
    }
});

const consolidated = Array.from(artistMap.values());
const targetPath = path.join(__dirname, '../src/data/artists.json');

// Ensure directory exists
fs.mkdirSync(path.dirname(targetPath), { recursive: true });

fs.writeFileSync(targetPath, JSON.stringify(consolidated, null, 2), 'utf8');

console.log(`Successfully consolidated ${consolidated.length} unique artists into ${targetPath}`);
console.log(`File exists check: ${fs.existsSync(targetPath)}`);
