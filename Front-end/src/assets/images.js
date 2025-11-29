// Auto-import all image files in this folder and export a name->url map.
// Uses Vite's `import.meta.globEager` so the bundler resolves assets at build time.
const modules = import.meta.globEager('./*.{png,jpg,jpeg,svg}');

const images = {};
for (const path in modules) {
  const file = path.replace('./', ''); // e.g. "student.png"
  const name = file.replace(/\.[^/.]+$/, ''); // remove extension
  const mod = modules[path];
  images[name] = mod.default || mod;
}

export default images;
