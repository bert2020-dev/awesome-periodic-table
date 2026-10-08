# Changelog

## 0.6.0

- Expanded the core and auxiliary CSV schema from the supplied data model, including toxicity/discovery metadata and solar/meteorite abundance.
- Normalized abundance presentation to percentages; ocean concentration is converted to percent at the data-model boundary.
- Added Celsius/Fahrenheit/Kelvin display cycling beside the temperature slider while keeping internal calculations in Celsius; the temperature tooltip always shows all three units.
- Reordered Details Basic properties and changed atomic mass to g/mol.
- Reworked the nuclide header so mass number and atomic number share one exact horizontal anchor around the larger element symbol.
- Upgraded the vendored Arcager packager to 4.0.0 and migrated the adapter to its v4 CLI.
- Added data/UI migration regression contracts and expanded Arcager bridge coverage.


## 0.5.13
- Fixed a CSS overflow bug in the bottom hotkey-hint bar (`.help-line`): as a
  direct flex-item child of `body` with no `min-width:0`/wrap safety, and
  `overflow-x:hidden` on `body` silently clipping rather than showing a
  scrollbar, the row could run off-screen instead of wrapping. Also added a
  missing space between two adjacent key-hint tags that had no wrap point
  between them, and tightened sizing for narrow viewports.
- Replaced the vendored `vendor/Arcager/arcager.py` with the genuine
  upstream 3.2.3 release. The previous copy was a hand-patched 3.2.0 base
  with an invented `window.arcager.resources.status()/waitFor()` API
  labelled as "New in 3.2.3" — a real 3.2.3 has no such API. The genuine
  releases instead properly fixed the underlying bug directly: 3.2.1 made
  `ready` a real pending Promise resolved after CSV parsing; 3.2.2
  guarantees `window.arcager` exists before any capability check; 3.2.3
  adds `arcager.state`/`arcager.error`/`arcager.loaded`. Updated
  `src/js/data-bootstrap.js` to target that real `ready`-Promise contract
  as its primary path (keeping the direct-DOM-parse fallback only as a
  safety net for older/failed runtimes), and rewrote
  `tools/test-arcager-data-bridge.mjs` to exercise all three paths
  (current runtime, legacy 3.2.0-style empty map, rejected `ready`)
  instead of asserting on the invented API's literal source text.
- `npm run build` now builds **both** `dist/plain/` and `dist/arcager/` in
  one command (previously it silently only built the Arcager/gzip variant,
  so a plain `npm run build` never produced `dist/plain/` at all). Added
  `npm run build:all` (adds the Brotli experiment) and `npm run release`
  (build:all + release:check + package:release in one step).
- Fixed `tools/setup-arcager.mjs`'s default `ARCAGER_REF`, which pointed at
  a `v3.2.3` git tag that doesn't exist (Arcager has no tagged releases —
  confirmed via `git ls-remote --tags`); defaults to the `main` branch now.
- Added `tools/check-latest.mjs`: compares the vendored Arcager version
  against the latest on its `main` branch and prints a one-line notice if
  newer, via `npm run check:updates` or automatically before
  `build`/`build:all` (as a `prebuild`/`prebuild:all` hook). Never fails
  the build — network errors or rate limits degrade to a soft notice.
- Added `build.bat` for building on Windows 10 without needing to know npm
  commands (checks Node/Python are on `PATH`, then runs the build); the
  underlying Node.js build pipeline was already cross-platform, this is a
  convenience entry point. See `docs/BUILDING.md`.
- Updated `docs/BUILDING.md`, `docs/ARCAGER-INTEGRATION.md`, and
  `BUILD-STATUS.md` to match the above.

## 0.5.12
- Improved natural-language query composition for superlatives inside comma-delimited clauses.
- Discovery comparisons now accept element endpoints, so `discovered after Tantalum` compares discovery years.
- Preserved plural intent in phrases such as `lightest elements`.
- Added regressions for natural-language comma composition and discovery-relative comparisons.

## 0.5.11

- Restored compact multivalue Details behavior: Ionization Energies, Abundance Distribution, and Stable Isotopes show one inline value plus `, ...` when additional data exists; the full dataset remains available in the hover table.
- Expanded successive ionization data registration to up to the 8th stage where source data is available, while preserving existing project values.
- Made the first inline multivalue value click-searchable as well as every value in the hover table.
- Restored percentage-aware abundance comparisons such as `Crust abundance above 2%`.
- Extended ionization superlative support through the 8th stage and increased hover-table typography/spacing for readability.

# Changelog

## 0.5.10
- Rebuilt Ionization Energies, Abundance Distribution, and Stable Isotopes as dynamic hover tables with readable sizing and row-level click-to-search targets.
- Kept the property-line summaries compact and hoverable, using `...` only when the list exceeds the inline space budget.
- Stable isotope rows preserve CSV mass-number data as proper nuclide notation with natural-abundance percentages.
- Ionization Energies display the first through fourth available stages.
- Abundance Distribution explicitly labels Crust, Ocean, Universe, and Human body.
- Moved quick-table popups to a document-level fixed portal so they are not clipped by the Details panel and can be clicked reliably.
- Updated the Arcager integration to target the 3.2.3 readiness/resource-polling contract with a safe fallback for older runtimes.

## 0.5.9
- Restored reliable floating quick tables for Ionization Energies, Abundance Distribution, and Stable Isotopes.
- Fixed popup positioning by aligning CSS positioning with viewport-based placement.
- Restored the UI display limit to the first four ionization energies.
- Preserved row-level click-to-search behavior for abundance dimensions, ionization stages, and stable isotopes.

## 0.5.8
- Fixed Arcager CSV fallback parsing to ignore the leading blank line emitted in `<script type="text/csv">` blocks.
- Added strict CSV header validation so malformed data fails with a clear startup error instead of constructing invalid element records.
- Added a packed-artifact regression test that unpacks the real Arcager build and exercises the data bridge against its three embedded CSV resources.

## 0.5.7
- Packaging-only patch release correcting the 0.5.6 builder archive: the distributed builder is now a real ZIP/deflate archive instead of a tar archive mislabeled as `.zip`.
- Preserved the validated 0.5.6 source tree, Arcager 3.2.0 integration, gzip distribution, and regression suite unchanged.

## 0.5.6
- Fixed Arcager CSV resource bootstrap timing so bundled CSV resources are available to the application after Arcager decompression/commit.
- Standard Arcager distribution remains gzip-compressed and standalone.
