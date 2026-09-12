# Astra / GPT-6 maintenance entry point

Read [docs/ASTRA_GUIDE.md](docs/ASTRA_GUIDE.md) first. Use its task map to select source files; do not load every guide or the generated source index into context.

- Keep responses and progress updates concise. Work within the requested scope.
- Read relevant files once; prefer targeted `rg` searches and bounded excerpts.
- This is plain JavaScript/Node with no frontend build step. Do not introduce a framework, bundler, dependency, or large refactor for routine cleanup.
- Follow references across server, browser modules, worker messages, HTML, CSS, and tests before deleting code. A single occurrence is a candidate, not proof of dead code.
- Preserve user data, account schemas/migrations, compatibility paths, fonts, profiles, model assets, and vendored dependencies unless the task explicitly changes them.
- Tests use temporary data. Never run destructive tests against the user's `data/` directory.
- Run the smallest relevant checks, then broader checks only for broad changes. Report failures and skipped runtime checks accurately.
- Update the guide when boundaries/contracts change. After moving named functions, regenerate `docs/SOURCE_INDEX.md` with `node scripts/document-functions.mjs`.
- Check the repository root before Git operations; this directory may be inside a larger repository. Scope changes to this project.
