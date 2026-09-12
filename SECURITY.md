# Security — V1

## Trust model

The public app stores accounts and the durable Instant job queue. The private renderer is a trusted Docker job manager; all native rendering executes in fresh, disposable containers. Containers share the host kernel and do not replace host hardening or an independent review for a public service.

## Execution boundary

- Uploaded SCAD and font/geometry parsers run only in the disposable worker on Compose deployments. Instant refuses local rendering and older shared renderers that do not advertise the disposable-container protocol. This also applies to workspace copies retaining Instant packages.
- Each worker runs as UID/GID 10000, with `network=none`, read-only root, all capabilities dropped, `no-new-privileges`, 128 PIDs, no core dumps, 1024 file descriptors and no persistent container logs. Default limits are 2 CPUs and 2 GB RAM including swap; scratch is 1 GB `/job` plus 256 MB `/tmp`. Both scratch mounts are `noexec,nosuid,nodev`.
- Workers receive the job over standard input. They have no app/account/database mounts, host directory mounts, credentials or Docker socket. An optional operator-selected named volume supplies approved fonts read-only at `/fonts/custom`; requests cannot choose mounts. Built-in runtime and fonts are read-only image content.
- The trusted manager alone mounts the Docker socket. Docker control is effectively host-level authority: never expose the manager publicly, never execute uploaded code there, and prefer a separate execution host if stronger host separation is needed. The public app has no Docker access.
- The manager authenticates requests or uses explicit private-network trust, bounds request/output bytes and concurrent jobs, and accepts only a prebuilt labeled worker image resolved to its immutable image ID. Inherited image volumes are rejected. User input cannot set image, command, environment or runtime flags.
- Timeout, cancellation, HTTP disconnect, shutdown and failed jobs force-remove the container and all child processes. Cleanup failure stops further admissions. A worker has an independent 610-second hard deadline; manager startup reaps orphan containers in its configured scope. Run only one manager per scope.
- Native child environments use an allowlist instead of inheriting server variables. Workers have no API token, account secret or network route, even when the manager uses token authentication.
- The worker returns bounded regular-file bytes through standard output. The manager verifies STL/WebP signatures or bounded ZIP/ZIP64 contents, CRCs and required 3MF entries, and rejects XML entity/DTD declarations before returning data to the app. Geometry/topology export validation remains in the application.

## Upload quarantine

- Original ZIP/JSON upload bytes enter a private temporary quarantine directory. No upload is executable there. Rejected, accepted and failed-storage requests all remove quarantine files.
- Validation precedes package persistence and automatic queueing. Packages allow 200 entries/files, 8 MB per file and 16 MB both compressed and expanded. Archives are never extracted into the host filesystem.
- Absolute/traversing/ambiguous paths, case/Unicode duplicates, file/folder conflicts, symlinks and special files, encryption, multi-disk archives, malformed or inconsistent ZIP headers, CRC failures and oversized inflation are rejected. Both declared and actual sizes are bounded, including ZIP64 values. Project-relative references are preserved.
- Allowed data includes SCAD, CSV/TXT/JSON, TTF/OTF and supported model/image formats. C#, CSPROJ, executables and scripts remain unsupported. There is no arbitrary-code or online NuGet restore path.
- Dependency validation helps report missing resources; it is not the execution boundary. Runtime isolation remains necessary even for syntactically valid source.

## Authentication and account data

- Passwords are stored as scrypt hashes; plaintext passwords are never stored.
- Session IDs are cryptographically random and only SHA-256 hashes are stored server-side.
- Signup/login challenges are short-lived, single-use and attempt-limited. A session is created only after the required email challenge succeeds.
- Changing the account email requires the current password and a code delivered to the **new** address; the stored email is not changed before verification.
- Session, workspace, revision and print-profile operations are scoped by authenticated user ownership. SQL statements use bound parameters.
- Account workspace + revision storage has a global byte quota in addition to per-workspace/revision limits.
- Account and session database files are private runtime state and are excluded from release packages.

## Request/browser controls

- Host and origin validation, CSRF/origin checks, JSON content-type validation, request limits, render limits and authentication-failure limits are enforced by the application.
- Production cookies are `HttpOnly`, `Secure`, `SameSite=Strict` and `__Host-` scoped where applicable.
- CSP, HSTS, frame blocking, MIME-sniffing protection, restrictive browser permissions, no-referrer and no-index headers are enabled.
- Cloudflare mode trusts `CF-Connecting-IP` only in the configured Cloudflare proxy mode.

## Rendering and cache behavior

- Render work occurs in per-operation disposable containers with private temporary directories, and both are cleaned up.
- Self-contained jobs can use memory/disk result caching.
- Models containing external `include`, `use`, `import` or `surface` dependencies bypass result caching so updated assets are not served from a stale cache entry.
- Headless thumbnails use Xvfb preview rendering so Linux servers do not require an exposed GUI display.

## Release hygiene

Run `npm run release` instead of zipping the working directory manually. The release builder:

- rejects all symlinks;
- excludes `data/` runtime contents and account SQLite databases;
- excludes secret files and `.env*`;
- excludes caches and `node_modules`;
- excludes private custom fonts and locally imported Bambu profiles;
- leaves only placeholder/readme files in those runtime directories.

If a credential was ever included in a previously shared archive, **remove it from the release and rotate/revoke it at the provider**. Removing it from a later ZIP does not invalidate the old credential. Existing sessions from a leaked database should also be invalidated.

## Owner duties

Keep the host OS, Docker and container images patched. Protect database/backups and custom assets. Use FileVault/full-disk encryption where appropriate. Do not publish the renderer or app service ports directly. Keep the `backend` network internal. Configure SPF/DKIM/DMARC for production email. Review logs and account data after a suspected compromise and rotate affected credentials.

This release provides engineering controls, not a guarantee against malicious native-code/geometry workloads or a substitute for an independent security review before high-risk public multi-tenant deployment.
