# Build Status — 0.6.0

## Release status
- Version: 0.6.0
- Standard distribution: Arcager 4.0.0 (genuine upstream) + gzip
- Arcager CSV resources: 3 bundled
- Arcager bridge regression: contract updated for the Arcager 4.0.0 `ready` API; legacy fallback coverage retained
- 123/123 core NLP tests: PASS
- 33/33 multi-value tests: PASS
- 13/13 superlative tests: PASS
- 7/7 autocomplete tests: PASS
- Runtime initialization/live-search smoke: PASS
- Plain single-file build: PASS
- Arcager standalone/unpack validation: PASS
- Release check: PASS
- `npm run build` produces both `dist/plain/` and `dist/arcager/`: source contract and CI workflow added; final clean-environment execution is pending because this repository currently has no prior CI runner/status

## What changed in 0.6.0
- **CSS**: fixed the bottom hotkey-hint bar (`.help-line`) overflowing
  off-screen instead of wrapping, on narrow viewports.
- **Arcager**: the vendored copy is now the genuine upstream 3.2.3 release
  (previously a hand-patched 3.2.0 base with an invented, non-upstream
  `resources.waitFor` API). `data-bootstrap.js` now targets the real
  `ready`-Promise contract Arcager 3.2.1+ actually provides.
- **Build**: `npm run build` builds both dist targets by default; added
  `npm run build:all`, `npm run release`, and `npm run check:updates`
  (also runs automatically before builds, via `prebuild`/`prebuild:all`).
- **Windows**: added `build.bat` as a convenience entry point.

See `CHANGELOG.md` for the full list and rationale.

## Multivalue behavior (carried over from 0.5.11, unchanged)
Ionization Energies, Abundance Distribution, and Stable Isotopes keep the Details panel compact by showing one inline value plus `, ...` whenever additional values exist. The complete values remain in the hover table, with the inline value and every table value independently click-searchable.

## Ionization data enrichment (carried over from 0.5.11, unchanged)
The extended ionization CSV registers successive ionization energies through the 8th stage where the source dataset provides them. Scalar first-ionization values were filled for elements whose core CSV entries were previously blank.

## Search fixes covered by regression tests
The multivalue suite covers percentage-aware abundance comparison (`Crust abundance above 2%`), element-reference ionization comparison (`Ionization energy below Ti`), crust/ocean superlatives, and fifth/eighth ionization-stage comparisons. 0.5.12 added natural-language comma composition for superlatives and discovery-relative element comparisons (`discovered after Tantalum`).
