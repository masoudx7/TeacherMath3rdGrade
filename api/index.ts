// Set serverless flag to prevent starting standalone HTTP listener in server.ts
process.env.SERVERLESS = '1';

// @ts-ignore - dist/server.cjs is generated during 'npm run build' via esbuild
import serverBundle from '../dist/server.cjs';

// In CommonJS bundled by esbuild from ESM export default, the Express app is at .default.default or .default
const app = (serverBundle as any)?.default?.default || (serverBundle as any)?.default || serverBundle;

export default app;
