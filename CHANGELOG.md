# Changelog

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
