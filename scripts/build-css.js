import fs from 'node:fs';
import path from 'node:path';
import { bundle } from 'lightningcss';

const distCssDir = path.resolve('dist/css');
if (!fs.existsSync(distCssDir)) {
  fs.mkdirSync(distCssDir, { recursive: true });
}

const targets = [
  {
    input: './src/css/index.css',
    outputUnmin: 'dist/css/index.css',
    outputMin: 'dist/css/index.min.css',
  },
  {
    input: './src/css/app.css',
    outputUnmin: 'dist/css/app.css',
    outputMin: 'dist/css/app.min.css',
  },
  {
    input: './src/css/theme/colors.css',
    outputUnmin: 'dist/css/colors.css',
    outputMin: 'dist/css/colors.min.css',
  },
];

console.log('📦 Bundling and minifying CSS...');

for (const { input, outputUnmin, outputMin } of targets) {
  // Unminified bundle
  const unmin = bundle({
    filename: input,
    minify: false,
  });
  fs.writeFileSync(outputUnmin, unmin.code);

  // Minified bundle
  const min = bundle({
    filename: input,
    minify: true,
  });
  fs.writeFileSync(outputMin, min.code);

  console.log(`  ✓ ${outputUnmin} (${(unmin.code.length / 1024).toFixed(1)} kB)`);
  console.log(`  ✓ ${outputMin} (${(min.code.length / 1024).toFixed(1)} kB)`);
}

console.log('✅ CSS build complete! (sandbox.css excluded)');

