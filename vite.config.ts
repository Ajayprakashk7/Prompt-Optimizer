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
            drop_console: mode === 'production',
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info'],
            passes: 2,
          },
          mangle: {
            safari10: true,
          },
          format: {
            comments: false,
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
            // Optimize chunk loading
            inlineDynamicImports: false,
            manualChunks: (id) => {
              // Critical: Keep main bundle as small as possible for fast startup

              // Core React bundle - essential for initial render
              if (id.includes('react') && !id.includes('react-markdown')) {
                return 'react-vendor';
              }

              // Move ALL heavy components to lazy chunks
              if (id.includes('HistoryPanel') || id.includes('OptimizationHistoryPanel') ||
                  id.includes('SettingsModal') || id.includes('VariableEditor')) {
                return 'panels-lazy';
              }

              // Markdown processing - completely lazy loaded
              if (id.includes('react-markdown') || id.includes('remark-gfm') ||
                  id.includes('mdast-') || id.includes('micromark') ||
                  id.includes('unist-') || id.includes('vfile')) {
                return 'markdown-lazy';
              }

              // Syntax highlighting - lazy loaded
              if (id.includes('highlight.js')) {
                return 'highlight-lazy';
              }

              // Google AI packages - lazy load these too for faster startup
              if (id.includes('@google/genai') || id.includes('google-auth-library') ||
                  id.includes('gaxios') || id.includes('gcp-metadata')) {
                return 'google-lazy';
              }

              // Performance monitoring - lazy load
              if (id.includes('bundleOptimization') || id.includes('performance.ts')) {
                return 'perf-lazy';
              }

              // Storage and history services - lazy load
              if (id.includes('historyService') || id.includes('optimizationHistoryService') ||
                  id.includes('exportService') || id.includes('storageService') || id.includes('tokenizerService')) {
                return 'storage-lazy';
              }

              // Services - group API-related services
              if (id.includes('geminiService') || id.includes('configService') || id.includes('rateLimitService')) {
                return 'api-services';
              }

              // Utilities and hooks - separate for better caching
              if (id.includes('hooks/') || (id.includes('utils/') && !id.includes('bundleOptimization'))) {
                return 'utils';
              }

              // Icons - separate chunk since they're used everywhere
              if (id.includes('Icons.tsx')) {
                return 'icons';
              }

              // Separate large node_modules into vendor chunks
              if (id.includes('node_modules')) {
                // React DOM - separate chunk for better caching
                if (id.includes('react-dom')) {
                  return 'react-dom';
                }
                // Split large libraries into separate chunks
                if (id.includes('lodash') || id.includes('moment') || id.includes('date-fns')) {
                  return 'utils-vendor';
                }
                return 'vendor';
              }

              return null;
            }
          }
        },
        chunkSizeWarningLimit: 1000 // Allow larger chunks for optional heavy dependencies
      }
    };
});
