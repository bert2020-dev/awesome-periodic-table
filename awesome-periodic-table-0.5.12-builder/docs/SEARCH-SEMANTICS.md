# Search semantics for multi-value scientific data

The search engine now distinguishes four kinds of properties.

## Scalar properties

A scalar property has one numeric value per element.

Examples:

```text
density above 10
melts above Fe
mass between silver and gold
```

Clicking a scalar value in the Details panel keeps the existing ±10% behavior.

## Dimensioned properties

Abundance is dimensioned by environment:

```text
crust
 ocean
universe
humans
```

Compatibility rules:

- `abundance` means **Crust abundance**.
- `abundance above Fe` therefore means more abundant in the Earth's crust than Fe.
- `human abundance above Fe` selects the Human dimension.
- `most abundant in universe` ranks by Universe abundance.
- `more abundant in humans than in crust` compares two percentage dimensions for the same element.
- `more common in humans than the universe` is equivalent to comparing human abundance against universe abundance for the same element; `common` is a natural-language synonym for abundance in these comparative forms.
- The same grammar accepts `less common`, `higher common`, `greater common`, `more abundant`, `less abundant`, and optional `the` in the environment phrase, provided the compared dimensions use compatible units.
- Ocean abundance is a concentration (`mg/L`), while the other three are percentages. Cross-dimension comparisons are therefore rejected when the units are incompatible.

Never invent a single “overall abundance” by summing or averaging these dimensions.

## Sequences

Ionization energies are modeled as a sequence:

```text
IE1, IE2, IE3, ...
```

Examples:

```text
first ionization energy above 500
second ionization energy between 500 and 1500
IE2 above Fe
highest second ionization energy
```

For backward compatibility, bare `ionization energy` means IE1.

## Collections

Stable isotopes are modeled as a collection.

Examples:

```text
has stable isotope 56
stable isotope above 200
all stable isotopes below 200
heaviest stable isotope
lightest stable isotope
```

## Click-search behavior for tables

A multi-value table itself is not a filter because it has no single scalar meaning.

Instead, each meaningful table value is a search target:

- Abundance Distribution → searches the selected environment around that value (±10%).
- Ionization Energy stage → searches that specific stage around the value (±10%).
- Stable isotope mass → searches for elements containing that isotope.

Shift-click keeps the existing behavior of adding the generated criterion to the current query.

## Autocomplete context

Autocomplete operates on the current token or current phrase context rather than the entire search-history string. Multi-word choices can therefore branch naturally: `united` may suggest `United States`, and typing `k` while that suggestion is active produces `united k`, which selects `United Kingdom`. Search history boosts matching vocabulary but never pastes an entire previous query into the completion field.
