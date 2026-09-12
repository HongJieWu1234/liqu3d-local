# Documentation

Start with the [project README](../README.md) for installation, configuration and deployment. This directory explains the current implementation, rather than a proposed architecture.

| Guide | What it answers |
| --- | --- |
| [Astra / GPT-6 guide](ASTRA_GUIDE.md) | Where should a coding agent look first, which contracts matter, and which checks apply? |
| [Cleanup audit](CLEANUP_AUDIT.md) | What was removed, how was it justified, and what was verified? |
| [Features](FEATURES.md) | What can users do, and what are the limits? |
| [Architecture](ARCHITECTURE.md) | What runs where, what dependencies are used, and how does data flow? |
| [Function reference](FUNCTION_REFERENCE.md) | Which functions implement each behavior, and how do they work together? |
| [Source index](SOURCE_INDEX.md) | Where are named function declarations in first-party runtime code? |
| [Development](DEVELOPMENT.md) | How do I run, edit, test and troubleshoot the app? |
| [Instant color optimization](INSTANT-COLOR-OPTIMIZATION.md) | How does the color grouping analysis work? |
| [Security](../SECURITY.md) | What are the execution and account trust boundaries? |
| [Commercial-use audit](COMMERCIAL-USE-AUDIT.md) | What licensing considerations apply? |
| [Third-party notices](../THIRD_PARTY_NOTICES.md) | Which third-party components have separate licenses? |

The function reference explains contracts and interactions; the source index is a navigation aid, not a substitute for implementation or API validation. Neither is a promise that arbitrary SCAD is understood by the settings parser. OpenSCAD compiles the model.

Keep these guides updated when changing behavior. Regenerate the source index with `node scripts/document-functions.mjs`. No documentation generation sends source to an external service.
