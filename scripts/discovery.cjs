const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '../public/img/style');
const manifestPath = path.join(__dirname, '../src/data/manifest.json');

function generateManifest() {
    if (!fs.existsSync(imgDir)) {
        console.error(`Directory not found: ${imgDir}`);
        return;
    }
    const manifest = {};
    const models = fs.readdirSync(imgDir).filter(f => fs.statSync(path.join(imgDir, f)).isDirectory());

    models.forEach(model => {
        manifest[model] = {};
        const modelPath = path.join(imgDir, model);
        const checkpoints = fs.readdirSync(modelPath).filter(f => fs.statSync(path.join(modelPath, f)).isDirectory());

        checkpoints.forEach(checkpoint => {
            const checkpointPath = path.join(modelPath, checkpoint);
            const images = fs.readdirSync(checkpointPath).filter(f => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg'));
            manifest[model][checkpoint] = images;
        });
    });

    // Ensure directory exists
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`[${new Date().toLocaleTimeString()}] Manifest updated.`);
}

// Initial generation
generateManifest();

// Watch mode
if (process.argv.includes('--watch')) {
    console.log(`Watching for changes in ${imgDir}...`);
    let timeout;
    fs.watch(imgDir, { recursive: true }, (eventType, filename) => {
        if (filename && (filename.endsWith('.webp') || filename.endsWith('.png') || filename.endsWith('.jpg') || !filename.includes('.'))) {
            // Debounce to avoid multiple triggers for a single batch operation
            clearTimeout(timeout);
            timeout = setTimeout(generateManifest, 500);
        }
    });
}
