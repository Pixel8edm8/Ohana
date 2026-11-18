import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => ({
    base: mode === 'production' ? '/~emoody/Ohana/' : '/',
    plugins: [
        react(),
        tsconfigPaths(),
        svgr({
            include: '**/*.svg?react',
        })
    ],
    server: {
        host: true,
        port: 5173,
        watch: {
            usePolling: true,
        },
    },
}))

