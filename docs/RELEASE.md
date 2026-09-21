# Release procedure

1. Update `VERSION` using X.Y.Z.
2. Match the version in `package.json`.
3. Update `CHANGELOG.md`.
4. Run:

```bash
npm test
```

5. Build the standard distribution:

```bash
npm run build:arcager
```

6. Verify `dist/arcager/awesome-periodic-table.html` as a standalone file with `npm run test:arcager`.
7. Test the generated HTML offline in at least the intended browser targets.
8. Archive the full source/build environment separately from the single-file distribution.
9. Publish only the appropriate licensed artifacts.

The mock adapter is for tests only and is never a release artifact.
