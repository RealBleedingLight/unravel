# OpenWolf

@.wolf/OPENWOLF.md

This project uses OpenWolf for context management. Read and follow .wolf/OPENWOLF.md every session. Check .wolf/cerebrum.md before generating code. Check .wolf/anatomy.md before reading files.


# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Cipher & Signal** is a client-side puzzle-solving toolkit and portfolio SPA. Zero dependencies — pure vanilla JavaScript, HTML, and CSS. All processing happens in the browser.

## Running Locally

No build step required. Open `index.html` directly in a browser, or serve with any static file server:

```bash
npx serve .
# or
python -m http.server
```

There are no tests, no linting config, and no npm scripts.

## Deployment

Deployed to Vercel. The `vercel.json` rewrites all routes to `index.html` for SPA routing, while serving `/css/*` and `/js/*` as static assets.

## Architecture

### SPA Routing (`js/router.js`)
The custom router is the core of the app. It:
- Maps URL paths to render functions (registered via `Router.register(path, renderFn)`)
- Handles `pushState`/`popstate` for back/forward navigation
- Exposes shared utilities: `el()` (DOM factory), `outputBox()` (standardized result display), and `Store` (localStorage wrapper with `cs_` prefix)

### Tool Pattern
Each file in `js/tools/` exports a single `render*(container)` function that:
1. Injects HTML into the container element
2. Caches DOM references
3. Attaches event listeners and implements all tool logic inline

Tools are registered in `js/app.js` and rendered on demand by the router.

### Shared Utilities (in `router.js`)
- **`el(tag, attrs, ...children)`** — lightweight DOM element factory used everywhere instead of `document.createElement`
- **`outputBox(label, value)`** — renders a result panel with a copy-to-clipboard button (feedback: "OK!" for 1.2s)
- **`Store.get/set/delete(key)`** — localStorage JSON wrapper; all keys prefixed with `cs_`

### Styling
Two CSS files: `css/main.css` (landing page + layout) and `css/tools.css` (tool-specific components). Design system uses CSS custom properties — dark terminal aesthetic with primary accent `#2dffc2` (cyan) and secondary `#8b7aff` (purple). Fonts: Outfit (headings), Fira Code / DM Mono (monospace content).

## Tools Reference

| File | Tool | Core APIs Used |
|------|------|----------------|
| `image-editor.js` | Image Editor | Canvas 2D |
| `stego.js` | Steganography | Canvas 2D |
| `exif.js` | EXIF Metadata | FileReader |
| `audio.js` | Audio Analyzer | Web Audio API, Canvas 2D |
| `ciphers.js` | Classical Ciphers | — |
| `encoding.js` | Encoding / Hashing | SubtleCrypto |
| `visual-ciphers.js` | Visual Ciphers (Morse, Braille, etc.) | — |
| `text.js` | Text Tools | — |
| `notebook.js` | Puzzle Notebook | localStorage via Store |
