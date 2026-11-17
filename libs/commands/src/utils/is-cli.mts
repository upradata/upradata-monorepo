import path from 'node:path';
import { fileURLToPath } from 'node:url';

// only esm
const nodePath = path.resolve(process.argv[1]);
const modulePath = path.resolve(fileURLToPath(import.meta.url));

export const isCli = nodePath === modulePath;
