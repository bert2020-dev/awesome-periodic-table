# Architecture

Awesome Periodic Table is deliberately split into two concerns: **editable source material** and **the single-file product**.

```text
                 human editors
                      │
          ┌───────────┴───────────┐
          │                       │
       src/*                    data/*.csv
          │                       │
          └───────────┬───────────┘
                      │
             tools/data-pipeline.mjs
                      │
          ┌───────────┴────────────┐
          │                        │
      plain/debug             Arcager/release
          │                        │
   compact pipe data        native CSV resources
          │                        │
          ▼                        ▼
    standalone HTML        Arcager --merge + gzip
                                   │
                                   ▼
                         one atomic HTML distribution
```

## Runtime object model

`src/js/app.js` keeps reusable responsibilities in long-lived objects rather than repeatedly rebuilding equivalent data structures:

### `PropertyCatalog`

Defines the search vocabulary and metadata for scalar, dimensioned, sequence and collection properties. It resolves expressions such as:

- `abundance` → crust abundance
- `human abundance` → human abundance dimension
- `IE2` → second ionization energy
- `stable isotopes` → isotope collection

This is the central place to extend the property vocabulary.

### `ElementDataRepository`

Owns normalized element data, O(1) atomic-number/name lookups and a property-value cache. Dimensioned abundance values, ionization stages and isotope collections are retrieved through this object rather than recalculated in multiple UI/search functions.

### `SearchEngine`

Owns query execution and a bounded result cache keyed by normalized query text and temperature. Parsing functions remain pure; repeated renders of the same query do not repeatedly filter all 118 elements.

### `TableRenderer`

Owns the periodic-table DOM nodes. Search changes rebuild the filtered view; temperature changes update existing cells in place. Phase badges and transition animations therefore do not require rebuilding the entire grid on every slider movement.

The renderer also keeps previous phase state and deliberately schedules transition animations across two animation frames so rapid slider movement does not lose the CSS animation.

## Multi-dimensional scientific data

The search model distinguishes:

- **scalar** — density, mass, melting point, etc.
- **dimensioned** — abundance by environment (`crust`, `ocean`, `universe`, `humans`)
- **sequence** — ionization energy by stage (`IE1`, `IE2`, …)
- **collection** — stable isotopes

The goal is to give these data types one reusable search grammar instead of separate ad-hoc implementations.

## Data/build paths

The CSV files are the canonical editable source.

### Plain build

The plain build serializes the normalized manifest into the compact pipe format. The pipe representation is intentionally domain-specific: omitted repeated values and merged sparse fields reduce the amount of structural text before it reaches the browser.

### Arcager build

The Arcager build does **not** perform the pipe conversion. It stages the original CSV resources and uses Arcager's native CSV merge support. Arcager packs the HTML, CSS, JavaScript and CSV resources into one file and embeds its browser-side loader.

This avoids reinventing Arcager's resource-bundling mechanism and keeps CSV as the actual source representation for the release path.

## Distribution guarantee

`dist/arcager/awesome-periodic-table.html` is intended to be the normal release artifact. It contains:

- application HTML
- application CSS
- application JavaScript
- bundled CSV data
- Arcager's generated browser loader
- compressed payload

It does not require the source `data/`, `src/`, `vendor/Arcager/`, Node.js, Python, npm or a web server at runtime.
