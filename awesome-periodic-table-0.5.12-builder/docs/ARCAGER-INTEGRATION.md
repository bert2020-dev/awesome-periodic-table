# Arcager integration

Awesome Periodic Table uses the vendored **Arcager 3.2.3** readiness contract directly during the release build.

## Release path

```text
CSV source files
      ↓
staging directory
      ↓
Arcager --merge
      ↓
CSS + JS + CSV resources inlined
      ↓
gzip by default
      ↓
one standalone HTML
```

Arcager's generated browser loader reconstructs the packed resources in memory. No Arcager package is required in the user's browser.

## Why the Arcager path keeps CSV

Arcager already understands bundled CSV resources. The release builder therefore does not invent an additional pipe representation for the Arcager path. CSV remains the source/resource format and Arcager owns its packing/compression step.

The compact pipe serializer remains useful for the plain build, where it provides a small, predictable data representation without introducing a separate maintained data file.

## Commands

```bash
npm run build:arcager
a
npm run build:arcager:gzip
npm run build:arcager:brotli
```

The standard `build:arcager` target is gzip.

## Verification

`npm run test:arcager`:

1. builds the plain source;
2. builds the real Arcager artifact;
3. unpacks the artifact with Arcager;
4. checks that all three CSV resources were bundled;
5. checks that Arcager's browser decompressor is present;
6. rejects external runtime assets.

The test intentionally does not require the unpacked Arcager HTML to be byte-for-byte identical to the plain build because Arcager's `--merge` process adds its resource packaging structures.


## Readiness contract

The application prefers Arcager's resource readiness surface (`arcager.resources.waitFor`) for the CSV resource set `elements`, `element-extra`, and `lookups`. It falls back to `arcager.ready` and finally to the committed CSV DOM blocks, so the app remains deterministic when used with an older Arcager runtime.

The workspace supplied for this update contained the Arcager 3.2.0 source archive rather than the upstream 3.2.3 source tree. The builder therefore includes the 3.2.3-targeted readiness integration and pins future clean checkouts to `v3.2.3`; it does not silently claim that the supplied upstream archive itself was 3.2.3.
