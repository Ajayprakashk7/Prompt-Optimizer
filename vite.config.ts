import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    return {
      worker: {
        format: 'es'
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        target: 'esnext',
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
        rollupOptions: {
          input: {
            popup: 'index.html'
          },
          output: {
            entryFileNames: 'assets/popup.js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              if (assetInfo.name?.endsWith('.css')) {
                return 'assets/popup.css';
              }
              return 'assets/[name].[ext]';
            },
            // Enable module preloading for better performance
            experimentalMinChunkSize: 1000,
            manualChunks: (id) => {
              // Core React bundle - keep small for fast initial load
              if (id.includes('react') && !id.includes('react-markdown')) {
                return 'react-vendor';
              }

              // Lazy-loaded components
              if (id.includes('HistoryPanel') || id.includes('OptimizationHistoryPanel') ||
                  id.includes('SettingsModal')) {
                return 'panels-lazy';
              }

              // Markdown processing - lazy loaded
              if (id.includes('react-markdown') || id.includes('remark-gfm') ||
                  id.includes('mdast-') || id.includes('micromark') ||
                  id.includes('unist-') || id.includes('vfile')) {
                return 'markdown-lazy';
              }

              // Syntax highlighting - lazy loaded
              if (id.includes('highlight.js')) {
                return 'highlight-lazy';
              }

              // Google AI packages
              if (id.includes('@google/genai') || id.includes('google-auth-library') ||
                  id.includes('gaxios') || id.includes('gcp-metadata')) {
                return 'google-vendor';
              }

              // Tokenizer - separate chunk for worker
              if (id.includes('gpt-tokenizer')) {
                return 'tokenizer-lazy';
              }

              return null;
            }
          }
        },
        chunkSizeWarningLimit: 500
      }
    };
});
