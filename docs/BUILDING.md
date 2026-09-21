# Building and extending Awesome Periodic Table

## Build targets

### Plain/debug

```bash
npm run build:plain
```

Produces a standalone HTML with the normalized CSV dataset serialized into the compact pipe format. The generated file does not need the `data/` directory at runtime.

### Arcager/release

```bash
npm run build:arcager
```

Produces:

```text
dist/arcager/awesome-periodic-table.html
```

The release path stages the original CSV resources and invokes the vendored Arcager 3.2.3-readiness `--merge` workflow. Arcager therefore bundles the CSVs as CSV resources and generates its own inline browser loader.

### Brotli experiment

```bash
npm run build:arcager:brotli
```

This is an optional compatibility experiment. The standard distribution remains gzip.

## Object-oriented runtime

The JavaScript runtime is intentionally split by responsibility:

- `PropertyCatalog` — property vocabulary and dimension metadata.
- `ElementDataRepository` — indexed data access, dimension/sequence/collection access and value caching.
- `SearchEngine` — parser invocation and bounded query-result cache.
- `TableRenderer` — reusable periodic-table DOM and temperature-only updates.

Avoid introducing a second lookup/cache implementation for the same data. Extend the repository/catalog objects instead.

## Data workflow

Edit only the CSV files under `data/`. The runtime must consume normalized data from the build pipeline; element values should not be copied into `src/js/app.js`.

For the plain build, the normalized manifest becomes the pipe payload.

For the Arcager build, the original CSV files remain the resource representation and Arcager performs bundling/compression.

## Search changes

Update `docs/SEARCH-SEMANTICS.md` whenever a new multi-value/search construct is introduced. Add regression cases before changing parser behavior.

Run:

```bash
npm run test:search
npm run test:multi
```

## Single-file rule

Never add external runtime `script src=` or stylesheet `link href=` dependencies to the source shell unless the build pipeline explicitly consumes and inlines them.

Never edit `dist/` as source.
