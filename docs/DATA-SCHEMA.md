# Data schema

## `data/elements.csv`

One row per element, keyed by `z`. Columns provide the core runtime model: symbol, names, mass, category, melt/boil points, electron configuration, density, electronegativity, first ionization energy, sources, standard potential, toxicity, discovery year, oxidation state, half-life, discovery source and discovery country.

## `data/element-extra.csv`

One row per atomic number. Extended fields include electrical conductivity, thermal conductivity, specific heat, electrical type, four abundance dimensions, successive ionization-energy lists (registered through the 8th stage where source data exists), stable-isotope mass numbers and isotope abundances.

Current abundance fields:

| Field | Dimension | Unit |
|---|---|---|
| `crustAbundance` | Earth's crust | % |
| `oceanAbundance` | ocean | mg/L |
| `universeAbundance` | universe | % |
| `humanAbundance` | human body | % |

Negative abundance values are dataset display sentinels (`synthetic`, `trace`, `synthetic / trace`) and are excluded from numeric comparisons.

List-valued fields remain inside quoted CSV cells.

## `data/lookups.csv`

Audit-friendly lookup content for categories, toxicity labels, source strings and externally sourced abundance provenance.
