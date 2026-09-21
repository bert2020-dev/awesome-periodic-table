# Compact pipe-delimited transport format

The CSV files are the human-maintained source of truth.

The pipe representation is a **plain-build optimization**, not the canonical project data format and not a required Arcager stage.

The plain build normalizes the CSV data and serializes it into a deterministic pipe string. The representation uses ordered fields and compact conventions such as omitted repeated values and combined sparse fields. This keeps the readable standalone build smaller without forcing contributors to maintain a second data source.

The standard Arcager release does **not** convert the CSV data to pipe first. It stages the original CSV files and lets Arcager's native CSV merge support inline and compress those resources.

When the pipe schema changes, increment its schema version and update:

1. `tools/data-pipeline.mjs`
2. `tools/pipe-runtime.mjs`
3. `docs/PIPE-FORMAT.md`
4. `tools/test-pipe.mjs`

Do not use the pipe format as an alternate hand-maintained data file.
