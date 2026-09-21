# Build Status — 0.5.11

## Release status
- Version: 0.5.11
- Standard distribution: Arcager 3.2.3-readiness + gzip
- Arcager CSV resources: 3 bundled
- Arcager bridge regression: PASS
- 120/120 core NLP tests: PASS
- 33/33 multi-value tests: PASS
- 13/13 superlative tests: PASS
- 7/7 autocomplete tests: PASS
- Runtime initialization/live-search smoke: PASS
- Plain single-file build: PASS
- Arcager standalone/unpack validation: PASS
- Release check: PASS

## Multivalue behavior restored
Ionization Energies, Abundance Distribution, and Stable Isotopes keep the Details panel compact by showing one inline value plus `, ...` whenever additional values exist. The complete values remain in the hover table, with the inline value and every table value independently click-searchable.

## Ionization data enrichment
The extended ionization CSV now registers successive ionization energies through the 8th stage where the source dataset provides them, while preserving the project's existing values. Scalar first-ionization values were also filled for elements whose core CSV entries were previously blank.

## Search fixes covered by regression tests
The multivalue suite now explicitly covers percentage-aware abundance comparison (`Crust abundance above 2%`), element-reference ionization comparison (`Ionization energy below Ti`), crust/ocean superlatives, and fifth/eighth ionization-stage comparisons.
