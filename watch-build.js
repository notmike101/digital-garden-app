import fs from 'node:fs';
import fsPromise from 'node:fs/promises';
import path from 'node:path';
import childProcess from 'node:child_process';

const contentDir = '/app/data';

const watchRecursive = async (dir) => {
    fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.md')) {
            console.log(`[${new Date().toISOString()}] FS event: ${eventType} ${path.join(dir, filename)}`);
            triggerBuild();
        }
    });

    const entries = await fsPromise.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            watchRecursive(path.join(dir, entry.name));
        }
    }
};

const triggerBuild = () => {
    console.log('Starting rebuild...');
    try {
        childProcess.execSync('pnpm run build', { stdio: 'inherit' });
        console.log('Build done.\n');
    } catch (err) {
        console.error('Build failed.\n', err);
    }
};

triggerBuild();
watchRecursive(contentDir);

console.log('Recursive fs.watch active on /app/data');