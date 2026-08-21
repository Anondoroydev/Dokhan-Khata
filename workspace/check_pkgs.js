const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') walk(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const files = walk('.');
const imports = new Set();
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.matchAll(/from\s+['\"`](\w[^'\"]*)['\"`]/g);
  for (const m of matches) {
    let pkg = m[1];
    if (pkg.startsWith('.')) continue;
    if (pkg.startsWith('@')) {
      const parts = pkg.split('/');
      if (parts.length >= 2) imports.add(parts[0] + '/' + parts[1]);
    } else {
      imports.add(pkg.split('/')[0]);
    }
  }
});

const reqs = {};
Array.from(imports).forEach(p => {
  try {
    const pj = require(`./node_modules/${p}/package.json`);
    reqs[p] = '^' + pj.version;
  } catch(e) {
    reqs[p] = '*';
  }
});

console.log(JSON.stringify(reqs, null, 2));
