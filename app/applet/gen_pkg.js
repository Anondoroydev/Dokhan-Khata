const fs = require('fs');
const path = require('path');
const nm = 'node_modules';
const deps = {};
fs.readdirSync(nm).forEach(item => {
  if (item.startsWith('.')) return;
  const p = path.join(nm, item);
  if (fs.statSync(p).isDirectory()) {
    if (item.startsWith('@')) {
      try {
        fs.readdirSync(p).forEach(sub => {
          try {
            const pj = require(`./node_modules/${item}/${sub}/package.json`);
            deps[`${item}/${sub}`] = '^' + pj.version;
          } catch(e) {}
        });
      } catch(e) {}
    } else {
      try {
        const pj = require(`./node_modules/${item}/package.json`);
        deps[item] = '^' + pj.version;
      } catch(e) {}
    }
  }
});

const pkg = {
  name: "Dokan Khata",
  version: "1.0.0",
  description: "Digital Credit Ledger & POS System",
  main: "server.js",
  scripts: {
    "build": "vite build",
    "start": "node server.js"
  },
  dependencies: {
    "express": deps["express"] || "^4.21.2",
    "cors": deps["cors"] || "^2.8.5",
    "dotenv": deps["dotenv"] || "^16.4.7",
    "mongodb": deps["mongodb"] || "^6.12.0",
    "mongoose": deps["mongoose"] || "^8.9.5",
    "bcryptjs": deps["bcryptjs"] || "^2.4.3",
    "jsonwebtoken": deps["jsonwebtoken"] || "^9.0.2",
    "react": deps["react"] || "^19.0.0",
    "react-dom": deps["react-dom"] || "^19.0.0",
    "lucide-react": deps["lucide-react"] || "^1.16.0",
    "recharts": deps["recharts"] || "^2.15.0",
    "canvas-confetti": deps["canvas-confetti"] || "^1.9.4",
    "clsx": deps["clsx"] || "^2.1.1",
    "tailwind-merge": deps["tailwind-merge"] || "^2.6.0",
    "d3": deps["d3"] || "^7.9.0"
  },
  devDependencies: {
    "vite": deps["vite"] || "^6.0.0",
    "@vitejs/plugin-react": deps["@vitejs/plugin-react"] || "^4.3.4",
    "tailwindcss": deps["tailwindcss"] || "^4.0.0",
    "@tailwindcss/vite": deps["@tailwindcss/vite"] || "^4.0.0",
    "typescript": deps["typescript"] || "^5.7.2",
    "@types/react": deps["@types/react"] || "^19.0.0",
    "@types/react-dom": deps["@types/react-dom"] || "^19.0.0",
    "@types/canvas-confetti": deps["@types/canvas-confetti"] || "^1.9.0",
    "@types/express": deps["@types/express"] || "^5.0.0"
  },
  engines: {
    "node": ">=18.0.0"
  }
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('package.json updated successfully with dependencies!');
