import { defineConfig } from 'tsup'

export default defineConfig({
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'esnext',
  minify: false,
  treeshake: true,
  splitting: true,
  sourcemap: true,
  entry: {
    core: 'src/core/index.ts',
    ipc: 'src/ipc/index.ts',
  },
})
