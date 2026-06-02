import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Parse .env.local so integration tests can reach the real Supabase database.
// Falls back to an empty object in CI where the file won't exist.
function parseDotenvFile(filePath: string): Record<string, string> {
  try {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    const result: Record<string, string> = {};
    for (const line of lines) {
      const match = line.match(/^([^=#\s][^=]*)=(.*)$/);
      if (match) {
        const key = match[1]!.trim();
        const val = match[2]!.trim().replace(/^["'](.*)["']$/, '$1');
        result[key] = val;
      }
    }
    return result;
  } catch {
    return {};
  }
}

const localEnv = parseDotenvFile(path.resolve(__dirname, '.env.local'));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    env: localEnv,
    // Exclude Playwright e2e specs — those are run via `npm run test:e2e`, not Vitest
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
