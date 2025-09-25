z#!/usr/bin/env node
/*
 Sync Glueful framework cookbook into docs-next recipes

 Usage:
   node scripts/sync-cookbook.js --from /path/to/glueful/framework/docs/cookbook --to docs-next/content/9.recipes
 or set env var:
   GLUEFUL_FRAMEWORK_DIR=/path/to/glueful/framework node scripts/sync-cookbook.js
*/

const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

async function exists(p) {
  try {
    await fsp.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fsp.copyFile(src, dest);
}

async function copyDir(srcDir, destDir) {
  const entries = await fsp.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      if (entry.name.toLowerCase().endsWith('.md')) {
        await copyFile(srcPath, destPath);
      }
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const arg = (name) => {
    const idx = args.indexOf(name);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const frameworkDir = process.env.GLUEFUL_FRAMEWORK_DIR;
  const fromArg = arg('--from');
  const toArg = arg('--to');

  const src = fromArg || (frameworkDir ? path.join(frameworkDir, 'docs', 'cookbook') : undefined);
  const dest = toArg || path.join(process.cwd(), 'docs-next', 'content', '9.recipes');

  if (!src) {
    console.error('Error: provide --from or set GLUEFUL_FRAMEWORK_DIR');
    process.exit(1);
  }

  if (!(await exists(src))) {
    console.error(`Source not found: ${src}`);
    process.exit(1);
  }

  await ensureDir(dest);
  await copyDir(src, dest);

  console.log(`Cookbook synced to: ${dest}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

