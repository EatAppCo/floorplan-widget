// Proves a golden bundle was built from the intended renderer tree: every
// renderer source file and fabric itself must resolve inside `rendererRoot`.
// Usage: node golden/verify-metafile.mjs <metafile.json> <rendererRoot>
import fs from 'node:fs';
import path from 'node:path';

const [metafile, rendererRoot] = process.argv.slice(2);
const root = path.resolve(rendererRoot) + path.sep;
const inputs = Object.keys(
  JSON.parse(fs.readFileSync(metafile, 'utf8')).inputs
).map((input) => path.resolve(input));

const rendererFiles = inputs.filter((file) =>
  /[\\/]src[\\/](FloorplanRenderer|index|types|config|helpers|objects)/.test(
    file
  )
);
const fabricFiles = inputs.filter((file) =>
  file.includes(`${path.sep}node_modules${path.sep}fabric${path.sep}`)
);

const outside = [...rendererFiles, ...fabricFiles].filter(
  (file) => !file.startsWith(root)
);

if (rendererFiles.length === 0 || fabricFiles.length === 0 || outside.length) {
  console.error(`golden bundle ${metafile} did not resolve from ${root}:`, {
    rendererFiles: rendererFiles.length,
    fabricFiles: fabricFiles.length,
    outside,
  });
  process.exit(1);
}
console.log(
  `resolved ${rendererFiles.length} renderer files + fabric from ${root}`
);
