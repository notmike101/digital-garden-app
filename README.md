# Livesync to Vitepress Digital Garden

A self-hosted, password-protected documentation/website (Digital Garden) built from Markdown notes in an Obsidian vault, using Obsidian LiveSync for remote synchronization, automatic processing/publishing of notes, VitePress for static site generation, and Nginx for serving.

## Overview

This project runs entirely in Docker via docker-compose.yml and consists of three services:

* `bridge`: Runs `obsidian-livesync-bridge` to syncrhonize an Obsidian vault
* `builder`: Watches the syncrhonized Markdown files and triggers VitePress builds on changes
* `web`: Nginx server that serves the built static site on port 8080

The result is a live-updating, statically-generated website that reflects the current state of published notes in the Obsidian vault.

## Architecture & Data Flow

```
Obsidian Vault (remote/self-hosted)
        ↓ (LiveSync protocol)
obsidian-livesync-bridge (bridge container)
        ↓ (writes published Markdown files)
        /app/sync  ← shared volume (sync-data)
        ↓ (read-only for builder)
vitepress-builder (builder container)
        ↓ (watches /app/data → triggers vitepress build)
        /app/build  ← shared volume (build-output)
        ↓ (read-only for web)
Nginx (web container) → http://localhost:8080
```

## Detailed Sync → Process → Build → Serve Flow

### 1. Synchronization

* The bridge service runs the `obsidian-livesync-bridge` Deno application.
* It syncs the Obsidian vault into `/app/data` (mounted as `obsidian-data` volume).
* Whenever a file changes (or is deleted), LiveSync invokes the configured processor script: `processor.js`.

### 2. Processing & Publishing (`processor.js`)

* Executed automatically by LiveSync on every change.
* Only processes `.md` files.
* Reads frontmatter using `gray-matter`.

#### Publish logic:

If frontmatter contains `publish: true`, the note is published.

The target filename is determined by:

* `path:` in frontmatter (if present), trimmed and ensured to end with `.md`, or
* Falls back to the original basename (without extension) + `.md`.

The file is written to /app/sync (shared sync-data volume).
publish and path keys are stripped from the output frontmatter.

If publish is not `true` (or missing), any previously published file is removed.
On deletion: removes any matching published file in `/app/sync`.

### 3. Watching & Building (`watch-build.js`)

* Runs in the `builder` container
* Uses Node.js `fs.watch(..., { recursive: true })` on `/app/data` (mounted read-only from `sync-data`).
* On any `.md` file change, executes `pnpm run build` (which runs `vitepress build`).
* Initial build is triggered on startup
* Output is written to `/app/build` (shared `build-output` volume)

### 4. Serving

* Nginx serves the static files from `/usr/share/nginx/html` (mounted from `build-output`)
* Custom `nginx.conf` enables `gzip` and long-term caching for `/assets` path.
* Accessible at `http://localhost:8080` or host IP

## Password Protection Mechanism

Password protection is implemented per-page using VitePress theme overrides. This is NOT a secure password method, the content is still sent to the user, but not rendered until the password is provided. It is important to NOT provide any sensitive information within these documents as it is not truly safe or secure. This is just a form of high-level privacy.


Each Markdown file can define a password key in its YAML frontmatter:

```yaml
---
password: mysecretpassword
---
```

On the frontend, if a password is provided, the user will be presented with a modal that demands the user inputs a password, else they are not allowed to view the content. The content is not rendered by the frontend until the correct password is provided.

Authentication state is in-memory only (no cookies, localStorage, or server-side persistence). If the page is reloaded, the password will need to be provided again.

## Docker Setup

Run with `docker compose up -d --build`

This will initially build the images and perform an initial sync + build.

Sync logs: `docker compose logs -f bridge`
Builder logs: `docker compose logs -f builder`
Nginx logs: `docker compose logs -f web`

To stop the application, run `docker compose down`.

### Volumes

* `obsidian-data` – Persistent Obsidian vault data (LiveSync).
* `sync-data` – Published Markdown files.
* `build-output` – Generated static site.

## Customization Notes for Future Self

* To add new protected pages: add `password: yourpass` in frontmatter of the markdown file.
* To change publish path: use `path: folder/subpage.md` in frontmatter of the markdown file.
* Theme customizations live in `.vitepress/theme/`.
* VitePress version pinned to `2.0.0-alpha.15` (check for stable updates).
