import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import matter from 'npm:gray-matter@latest';

const PUBLISHED_DIR = '/app/sync';

if (!fs.existsSync(PUBLISHED_DIR)) {
    console.error('Unable to find publish directory');
    process.exit(1);
}

const [, , rawFileName, mode] = process.argv;

if (!rawFileName || !mode || !['modified', 'deleted'].includes(mode)) {
    console.error('Usage: node processor.js <full-path-to-file> <modified|deleted>');
    process.exit(2);
}

const fileName = path.resolve(rawFileName);

console.log(`(${mode}) Recieved: ${fileName}`);

const getTargetPath = (frontmatter, originalFileName) => {
    let relative = frontmatter.path?.trim();

    if (!relative) {
        relative = path.basename(originalFileName, path.extname(originalFileName));
    }

    if (!relative.endsWith('.md')) {
        relative += '.md';
    }

    return path.join(PUBLISHED_DIR, relative);
};

if (mode === 'deleted') {
    const baseName = path.basename(fileName);
    const candidates = fs.readdirSync(PUBLISHED_DIR).filter((file) => file === baseName || file === baseName.replace(path.extname(baseName), '.md'));

    for (const candidate of candidates) {
        const targetPath = path.join(PUBLISHED_DIR, candidate);

        if (fs.existsSync(targetPath)) {
            fs.unlinkSync(targetPath);

            console.log(`[processor] Deleted published file: ${targetPath}`);
        }
    }
} else if (mode === 'modified') {
    if (!fileName.endsWith('.md')) {
        console.log(`[processor] Ignoring non-markdown file: ${fileName}`);
        process.exit(0);
    }

    try {
        const rawContent = fs.readFileSync(fileName, 'utf-8');
        const { data: frontmatter, content } = matter(rawContent);

        const targetPath = getTargetPath(frontmatter, fileName);

        if (frontmatter.publish !== true) {
            console.log(`[processor] Skipping unpublished file: ${fileName}`);

            const targetPath = getTargetPath(frontmatter, fileName);

            if (fs.existsSync(targetPath)) {
                fs.unlinkSync(targetPath);

                console.log(`[processor] Remove previously published file: ${targetPath}`);
            }

            process.exit(0);
        }

        try {
            if (!fs.existsSync(targetPath)) {
                fs.mkdirSync(path.dirname(targetPath, { recursive: true }));
            }
        } catch (err) {
            console.error(`[processor] Error creating target directory`, err.message);
        }

        const cleanedFrontmatter = { ...frontmatter };
        delete cleanedFrontmatter.path;
        delete cleanedFrontmatter.publish;

        const finalContent = matter.stringify(content, cleanedFrontmatter);

        fs.writeFileSync(targetPath, finalContent);

        console.log(`[processor] Published to: ${targetPath}`);
    } catch (err) {
        console.error(`[processor] Failed to process ${fileName}:`, err.message);
        process.exit(1);
    }
}
