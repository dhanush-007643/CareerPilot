const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walk(dirPath, callback);
    } else {
      if (dirPath.endsWith('.js') || dirPath.endsWith('.jsx')) {
        callback(dirPath);
      }
    }
  });
}

walk(srcDir, (filePath) => {
  // skip services/api.js
  if (filePath.replace(/\\/g, '/').includes('/services/api.js')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Determine relative path to services/api
  const relativeToSrc = path.relative(path.dirname(filePath), srcDir).replace(/\\/g, '/');
  const apiImportPath = relativeToSrc === '' ? './services/api' : `${relativeToSrc}/services/api`;

  if (content.includes("import axios from 'axios'")) {
    content = content.replace(/import axios from 'axios';?/g, `import api from '${apiImportPath}';`);
    content = content.replace(/axios\./g, 'api.');
    // Now fix the /api/ paths in api.get/post/put/delete
    content = content.replace(/api\.(get|post|put|delete)\(['"`]\/api\//g, (match, p1) => {
      return `api.${p1}('/`;
    });
    // what if it's api.get(`/api/something`)
    content = content.replace(/api\.(get|post|put|delete)\(`\/api\//g, (match, p1) => {
      return `api.${p1}(\`/`;
    });
    
    // some might have .replace("/api/", "/")? Let's just be careful about /api/ replacement.
    // the regex above catches most.
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  }
});
console.log('Done');
