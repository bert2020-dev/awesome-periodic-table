import { manifestBootstrapFromExpression } from './pipe-runtime.mjs';

// Test-only adapter. It deliberately does NOT pretend to be Arcager.
// It validates that the builder can hand a compact payload through the adapter
// boundary and reconstruct the application variables in a single HTML file.
export async function pack({ pipePayload, inputHtml, context }) {
  const payload = Buffer.from(pipePayload, 'utf8').toString('base64');
  const runtime = `function __APT_mockDecode(b){return decodeURIComponent(escape(atob(b)));}`;
  const bootstrap = manifestBootstrapFromExpression('__APT_mockDecode(' + JSON.stringify(payload) + ')');
  return {runtime, bootstrap, stats:{mock:true,version:context.version,rawBytes:Buffer.byteLength(pipePayload),packedBytes:Buffer.byteLength(payload)}};
}
