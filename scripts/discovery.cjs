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
            const images = fs.readdirSync(checkpointPath).filter(f => f.endsWith('.webp'));
            manifest[model][checkpoint] = images;
        });
    });

    // Ensure directory exists
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`Manifest generated successfully at ${manifestPath}`);
    console.log(`File exists check: ${fs.existsSync(manifestPath)}`);
}

generateManifest();
