# Safe modification guide

## UI / CSS

Edit `src/index.html` for structure/content and `src/css/app.css` for presentation. Keep the version token `__APP_VERSION__` intact.

CSS is organized so the top control layout has one authoritative desktop rule block. Avoid adding a second competing rule set for the same component.

## Application logic

Edit `src/js/app.js`. Prefer extending the existing classes:

- property vocabulary → `PropertyCatalog`
- data lookup/cache → `ElementDataRepository`
- query execution/cache → `SearchEngine`
- element-cell rendering/temperature updates → `TableRenderer`

Do not duplicate an existing lookup, parser, cache or DOM traversal in another function unless there is a measured reason.

## Data

Edit `data/*.csv` only. When adding a field, update the data pipeline, normalized manifest, relevant repository methods, data schema docs and tests together.

## Multi-value properties

Use the same model for new scientific data:

- scalar
- dimensioned
- sequence
- collection

Decide its comparison semantics before adding UI syntax. Never invent a cross-dimension scalar unless the units and scientific meaning justify it.

For Details-panel tables, keep the table itself informational and make individual meaningful values clickable when a deterministic search operation exists.

## Search behavior

Add explicit regression cases for every new grammar form. Run:

```bash
npm run test:search
npm run test:multi
```

## Build paths

The plain build uses the compact pipe representation.

The Arcager release build uses original CSV resources and Arcager `--merge`.

Do not silently route an Arcager build through the plain artifact: that defeats the project's compression/distribution goal.

## Before release

```bash
npm test
npm run release:check
npm run build:arcager
```

Confirm that the final file works after being moved to a different directory with no sibling data/source files.
