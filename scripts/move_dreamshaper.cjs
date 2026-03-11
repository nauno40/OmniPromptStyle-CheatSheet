const fs = require('fs');
const path = require('path');

// Reference the source of truth for SD1.5 artists
// We'll read the original TS file to get the checkpoint info
const artistsFile = path.join(__dirname, '../src/data/artists.ts');
const sourceDir = path.join(__dirname, '../public/img/style/SD15/Deliberate_2.0');
const targetDir = path.join(__dirname, '../public/img/style/SD15/Dreamshaper_3.2');

function moveDreamshaperImages() {
    console.log('Starting migration to Dreamshaper folder...');
    
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const content = fs.readFileSync(artistsFile, 'utf8');
    
    // Simple regex to find artists with Dreamshaper checkpoint
    // We look for objects that have both "Checkpoint": "DreamShaper 3.2" and an "Image": "..."
    const artistBlocks = content.split('},').map(block => block + '}');
    
    let movedCount = 0;
    let missingCount = 0;

    artistBlocks.forEach(block => {
        if (block.includes('"Checkpoint": "DreamShaper 3.2"')) {
            const imageMatch = block.match(/"Image":\s*"([^"]+)"/);
            if (imageMatch) {
                const imageName = imageMatch[1];
                const sourcePath = path.join(sourceDir, imageName);
                const targetPath = path.join(targetDir, imageName);

                if (fs.existsSync(sourcePath)) {
                    fs.renameSync(sourcePath, targetPath);
                    movedCount++;
                } else {
                    // Check if it was already moved or missing
                    if (!fs.existsSync(targetPath)) {
                        missingCount++;
                        console.warn(`Warning: Image not found: ${imageName}`);
                    }
                }
            }
        }
    });

    console.log(`Migration complete!`);
    console.log(`- Moved: ${movedCount}`);
    console.log(`- Missing: ${missingCount}`);
}

moveDreamshaperImages();
