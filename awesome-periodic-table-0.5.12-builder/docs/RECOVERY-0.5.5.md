# 0.5.5 Recovery Branch

0.5.5 deliberately branches from the last stable 0.5.1 feature line and avoids the renderer/data-runtime refactors introduced in 0.5.2–0.5.4.

## Why

The later releases accumulated changes to startup rendering, NLP extraction, and runtime state ownership faster than the integration tests could prove. A startup exception could disable the table, search, and help UI together.

## Recovery rules

- Keep the 0.5.1 UI/runtime path intact.
- Make only isolated, behavior-tested additions.
- Test actual application initialization, not just static source markers.
- Do not split the NLP engine into a new runtime module until the recovered line is stable.
- All distribution builds remain single-file HTML outputs.

## New verified additions

- Human-body abundance aliases and abundance superlatives.
- Environment-qualified density superlatives such as `least dense in universe`.
- Autocomplete Space/Backspace/Escape behavior.

This branch is the safe base for the next architectural refactor.
