# Awesome Periodic Table — build environment

Version 0.5.1

The project separates editable HTML/CSS/JavaScript source and CSV data from the distributable single-file HTML. CSV remains the canonical editable data source. The builder has two deliberate data paths:

- **plain** — embeds a compact pipe-delimited representation for a readable/debug-friendly standalone file.
- **arcager** — leaves the CSV resources as CSV and lets Arcager bundle, compress and reconstruct them in memory for the optimized distribution.

## Layout

- `src/index.html` — HTML shell and Help/About content
- `src/css/app.css` — application styling
- `src/js/app.js` — object-oriented runtime/search logic
- `src/js/data-bootstrap.js` — Arcager CSV bootstrap bridge
- `data/*.csv` — canonical editable data
- `tools/build.mjs` — build orchestrator
- `tools/data-pipeline.mjs` — CSV normalization and plain-build pipe serializer
- `tools/pipe-runtime.mjs` — compact-pipe runtime used only by the plain build
- `tools/arcager-adapter.mjs` — invokes vendored Arcager 3.2.3-readiness
- `tools/search-harness.mjs` — shared search-test setup
- `tests/regression-120.json` — core NLP regression suite
- `tests/regression-multivalue.json` — abundance/ionization/isotope regression suite
- `vendor/Arcager` — exact Arcager source used by release builds
- `dist/plain/awesome-periodic-table.html` — standalone plain/debug build
- `dist/arcager/awesome-periodic-table.html` — standard release build (gzip)

## Build commands

```bash
npm run build:plain
npm run build:arcager
npm run build:arcager:brotli
```

`npm run build` is an alias for the standard Arcager/gzip release.

The plain HTML is standalone: the CSV files are build-time inputs and are not required beside the generated file.

The Arcager release is also standalone: Arcager's merge step embeds the CSV resources and its browser loader into the generated HTML.

## Search/data model

The runtime uses reusable objects rather than repeatedly rebuilding equivalent structures:

- `PropertyCatalog` resolves search properties and dimensions.
- `ElementDataRepository` owns indexed data and value caches.
- `SearchEngine` owns query-result caching.
- `TableRenderer` owns element DOM nodes and in-place temperature updates.

Multi-dimensional data is handled uniformly:

```text
abundance       → dimension (crust/ocean/universe/humans)
ionization      → sequence (IE1/IE2/IE3/...)
isotopes        → collection
```

For compatibility, unqualified `abundance` means crust abundance and unqualified `ionization energy` means IE1.

## Versioning

The project uses X.Y.Z:

- **X** — incompatible/major architectural changes
- **Y** — backward-compatible features
- **Z** — bug fixes and maintenance

## Licensing and third-party sources

Read `docs/LICENSE-BUILDERS.md` before creating a derivative or commercial build.

The Help/About section credits `periodictable.com` for the Universe and Human abundance source pages and identifies the provenance they publish for those datasets.

## Validation

Run the complete suite with:

```bash
npm test
```

The suite covers source/schema checks, pipe round-trip, 120 core search cases, multi-value search/click targets, standalone builds, real Arcager packing/unpacking and the test-only adapter contract.

## Recovery branch

Version 0.5.5 intentionally branches from the stable 0.5.1 feature line. Versions 0.5.2–0.5.4 introduced renderer/runtime refactors that were not sufficiently protected by live initialization tests and could disable the entire application from a single startup exception. 0.5.5 restores the stable runtime path and adds isolated regression coverage before further refactoring.

The next architectural change should be made only after this branch remains green under the runtime smoke test.
