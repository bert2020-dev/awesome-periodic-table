import { manifestBootstrapFromExpression } from './pipe-runtime.mjs';

/**
 * Real Arcager adapter contract.
 *
 * This file is documentation-by-example. The real adapter should live with
 * the Arcager integration (normally vendor/Arcager/) and return ready-to-embed
 * browser code generated from the supplied compact pipe payload.
 */
export async function pack({ manifest, pipePayload, context }) {
  throw new Error([
    'Arcager adapter not installed.',
    'Provide tools/arcager-adapter.mjs from the Arcager integration.',
    `Project version: ${context.version}`,
    `Pipe payload bytes: ${Buffer.byteLength(pipePayload)}`,
    `Elements: ${manifest.elements.length}`,
  ].join('\n'));

  // The real adapter should conceptually return:
  // {
  //   runtime: 'Arcager browser decompressor/runtime',
  //   bootstrap: manifestBootstrapFromExpression('DECOMPRESS_EXPRESSION'),
  //   stats: { rawBytes, packedBytes, ratio }
  // }
}
