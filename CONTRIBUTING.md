# Contributing

Start with:

- `ARCHITECTURE.md`
- `docs/SAFE-CHANGES.md`
- `docs/SEARCH-SEMANTICS.md`

Source of truth:

- `src/` — UI/runtime source
- `data/` — canonical CSV data
- `tools/` — build/test pipeline
- `vendor/Arcager/` — pinned Arcager build tool

The generated `dist/` directory is not source code.

Before submitting changes that touch the runtime, parser, data model or build system, run:

```bash
npm test
```
