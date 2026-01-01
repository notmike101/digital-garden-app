import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitepress'

export default defineConfig({
    srcDir: 'data',
    outDir: 'build',
    title: 'Digital Garden',
    description: 'A VitePress Site',
    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
        ],
        socialLinks: [
            { icon: 'github', link: 'https://github.com/notmike101' },
        ],
        outline: {
            level: 2,
            label: 'On this page',
        },
    },
    ignoreDeadLinks: true,
    vite: {
        resolve: {
            alias: [
                {
                    find: /^.*\/VPDoc\.vue$/,
                    replacement: fileURLToPath(new URL('./theme/components/VPDoc.vue', import.meta.url)),
                },
            ],
        },
    },
});
