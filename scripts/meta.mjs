#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const [,, inputDir] = process.argv;

if (!inputDir) {
  console.error('Usage: meta.mjs <project-folder>');
  process.exit(1);
}

const project = path.basename(inputDir);
const metaPath = path.join(inputDir, 'dist', 'metafile-cjs.json');
const prefix = inputDir.endsWith('/') ? inputDir : inputDir + '/';

const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

console.log(`## TSUP Build Summary: ${project}\n`);

for (const [file, data] of Object.entries(meta.outputs)) {
  if (!data.entryPoint) continue;
  const sizeKb = (data.bytes / 1024).toFixed(1);
  const relativeFile = file.replace(prefix, '');
  console.log(`- \`${relativeFile}\` (from \`${data.entryPoint}\`) — ${sizeKb} KB`);
}
