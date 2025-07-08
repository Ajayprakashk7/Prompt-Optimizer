import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      css: {
        postcss: './postcss.config.js',
      },
      build: {
        rollupOptions: {
          input: {
            // Web app entry point
            main: path.resolve(__dirname, 'index.html'),
            // Chrome extension entry point
            popup: path.resolve(__dirname, 'popup.html'),
          },
          output: {
            entryFileNames: (chunkInfo) => {
              // Keep extension files at root level for manifest.json
              if (chunkInfo.name === 'popup') {
                return 'popup.js';
              }
              return 'assets/[name]-[hash].js';
            },
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              if (assetInfo.name?.endsWith('.css')) {
                // Extension CSS at root level
                if (assetInfo.name.includes('popup')) {
                  return 'popup.css';
                }
                return 'assets/[name]-[hash].css';
              }
              return 'assets/[name]-[hash].[ext]';
            },
            manualChunks: (id) => {
              // Vendor chunks for better caching
              if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'react-vendor';
                }
                if (id.includes('@google/genai')) {
                  return 'google-ai';
                }
                // Group other vendor dependencies
                return 'vendor';
              }
              
              // Separate data files to their own chunk
              if (id.includes('/data/')) {
                return 'data';
              }
              
              // Service layer
              if (id.includes('/services/')) {
                return 'services';
              }
              
              // Component chunk for shared components
              if (id.includes('/components/') && !id.includes('SettingsModal')) {
                return 'components';
              }
            }
          }
        },
        outDir: 'dist',
        emptyOutDir: true,
        target: 'es2020',
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug'],
            passes: 2, // Multiple passes for better compression
          },
          mangle: {
            safari10: true,
          },
          format: {
            comments: false, // Remove all comments
          },
        },
        cssMinify: true,
        reportCompressedSize: true,
        chunkSizeWarningLimit: 400, // Lower threshold to catch size issues earlier
        sourcemap: false, // Disable sourcemaps in production for smaller files
      },
      server: {
        hmr: false
      }
    };
});
