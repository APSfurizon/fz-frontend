import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@components': path.resolve(__dirname, './src/components'),
            '@components/atoms': path.resolve(__dirname, './src/components/atoms'),
            '@molecules': path.resolve(__dirname, './src/components/molecules'),
            '@organisms': path.resolve(__dirname, './src/components/organisms'),
            '@pages': path.resolve(__dirname, './src/components/pages'),
            '@layouts': path.resolve(__dirname, './src/components/layouts'),
        },
    },
});
