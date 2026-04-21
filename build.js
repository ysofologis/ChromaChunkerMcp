import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await esbuild.build({
  entryPoints: [path.join(__dirname, 'src/cli.js')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: path.join(__dirname, 'dist/cli.js'),
  format: 'esm',
  external: [
    'langchain',
    '@langchain/community',
    '@langchain/openai',
    'chromadb',
    'openai',
    'commander',
    'dotenv'
  ],
  sourcemap: true,
});

console.log('Build completed successfully!');
