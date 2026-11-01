import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

type ModuleInfo = { isEntry: boolean; importedIds: readonly string[] } | null;
type ModuleGraph = { getModuleInfo: (id: string) => ModuleInfo; getModuleIds: () => IterableIterator<string> };

/**
 * Two module sets, computed once per build with a single forward walk each (linear in module count):
 * - eager: everything the entry reaches through static imports, i.e. the first page load;
 * - scene: everything the lazily loaded RouteTerrain (three.js) scene reaches.
 */
let graph: { eager: Set<string>; scene: Set<string> } | null = null;
const reachable = (starts: string[], getModuleInfo: ModuleGraph['getModuleInfo']) => {
  const seen = new Set<string>();
  const stack = [...starts];
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    for (const next of getModuleInfo(id)?.importedIds ?? []) stack.push(next);
  }
  return seen;
};
const moduleGraph = ({ getModuleInfo, getModuleIds }: ModuleGraph) => {
  if (!graph) {
    const ids = [...getModuleIds()];
    graph = {
      eager: reachable(ids.filter(id => getModuleInfo(id)?.isEntry), getModuleInfo),
      scene: reachable(ids.filter(id => id.includes('RouteTerrain') && !id.includes('node_modules')), getModuleInfo),
    };
  }
  return graph;
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    port: 5174,
  },
  // three.js is only reached through a lazy import (the expedition route scene); pre-bundle it so the
  // dev server doesn't discover it mid-visit and force a full page reload
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id, meta) {
          // Vite's dynamic-import preload helper is needed by the entry; never let it land in a lazy chunk
          if (id.includes('vite/preload-helper') || id.includes('commonjsHelpers')) return 'vendor-core';
          if (id.includes('node_modules')) {
            const { eager, scene } = moduleGraph(meta);
            // Libraries the first page load never reaches stay out of the eager vendor chunks: three.js (only
            // the lazy route scene uses it) gets its own chunk; other lazy-only ones (driver.js for the tour,
            // the on-screen keyboard...) are placed by Rollup with the lazy chunks that import them
            if (!eager.has(id)) return scene.has(id) ? 'vendor-three' : undefined;
            if (id.includes('framer-motion')) return 'vendor-framer';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('ogl')) return 'vendor-ogl';
            if (id.includes('lenis')) return 'vendor-lenis';
            if (id.includes('swiper')) return 'vendor-swiper';
            if (id.includes('simple-keyboard') || id.includes('indic-transliterator')) return 'vendor-keyboard';
            if (id.includes('socket.io-client')) return 'vendor-socket';
            if (id.includes('i18next') || id.includes('zustand') || id.includes('sonner')) return 'vendor-utils';
            return 'vendor-core';
          }
        },
      },
    },
  },
});
