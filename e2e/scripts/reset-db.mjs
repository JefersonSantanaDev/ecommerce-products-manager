import { copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const rootDir = process.cwd();
const seedDbPath = resolve(rootDir, 'e2e/fixtures/db.e2e.seed.json');
const workingDbPath = resolve(rootDir, 'e2e/fixtures/db.e2e.json');

await copyFile(seedDbPath, workingDbPath);
