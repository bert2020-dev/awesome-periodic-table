# Building and extending Awesome Periodic Table

## Build targets

Running `npm run build` builds **both** targets below in one command (this
used to only build the Arcager/gzip variant — if you're looking at an older
checkout, upgrade first). `npm run build:all` additionally includes the
Brotli experiment. Both are preceded automatically by a version check (see
*Keeping the build tooling current*, below) via the `prebuild`/`prebuild:all`
npm hooks — no separate step to remember.

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

The release path stages the original CSV resources and invokes the vendored Arcager `--merge` workflow (currently the genuine upstream 3.2.3 release — see *A note on the vendored Arcager copy*, below). Arcager therefore bundles the CSVs as CSV resources and generates its own inline browser loader.

### Brotli experiment

```bash
npm run build:arcager:brotli
```

This is an optional compatibility experiment. The standard distribution remains gzip.

### Building on Windows 10

The build pipeline is plain Node.js and already cross-platform (`tools/arcager-adapter.mjs` detects `python`, `python3`, and the Windows `py` launcher in that order). Two ways to build on Windows:

- **Double-click `build.bat`** (repo root) — checks that Node and Python are on `PATH`, then runs `npm run build`. Works from a plain Command Prompt, no PowerShell execution-policy changes needed.
- **Or just run the same npm commands** documented above from PowerShell or Command Prompt directly — nothing platform-specific about them.

Prerequisites: [Node.js](https://nodejs.org/) (LTS) and [Python 3](https://www.python.org/downloads/windows/) (tick "Add python.exe to PATH" in the installer), both on `PATH`. `npm run setup:arcager` additionally needs [Git for Windows](https://git-scm.com/download/win) if you're re-vendoring Arcager from source rather than editing `vendor/Arcager/arcager.py` in place.

### Keeping the build tooling current

```bash
npm run check:updates
```

Compares the vendored `vendor/Arcager/arcager.py` against the latest `VERSION` string on Arcager's `main` branch (Arcager has no tagged releases) and prints a one-line notice if a newer version is available. This runs automatically before `build`/`build:all`; it never fails the build — a network error or rate limit just degrades to a "couldn't check" notice. To track another vendored tool later, add an entry to the `CHECKS` array in `tools/check-latest.mjs`.

### A note on the vendored Arcager copy

`vendor/Arcager/arcager.py` should be the genuine file from
[bert2020-dev/Arcager](https://github.com/bert2020-dev/Arcager) — not a
hand-patched stand-in. Arcager 3.2.0 had a real bug where `window.arcager.csv`
was always empty (it was built before the merged page's own content, CSV
blocks included, had been written into the document); this was properly
fixed upstream in 3.2.1 (`ready` became a real Promise that waits for CSV
parsing), 3.2.2 (`window.arcager` always defined, clear rejection errors),
and 3.2.3 (`arcager.state`/`arcager.error`/`arcager.loaded`). `src/js/data-bootstrap.js`
targets that real `ready`-Promise contract as its primary path, with a DOM
fallback (parsing `<script type="text/csv">` blocks directly) kept only as a
safety net for older or failed runtimes — see the comments in that file and
`tools/test-arcager-data-bridge.mjs`, which exercises all three paths
(current runtime, legacy 3.2.0-style empty map, and a rejected `ready`).

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
