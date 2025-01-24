const fs = require('fs');
const path = require('path');

function createFolderIfNotExists(folderName) {
    const resolvedPath = path.resolve(folderName);
    if (!fs.existsSync(resolvedPath)) {
        fs.mkdirSync(resolvedPath, { recursive: true }); 
    }
}

module.exports = {createFolderIfNotExists}


