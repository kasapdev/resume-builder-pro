# Resume Builder Pro

[![CI](https://github.com/kasapdev/resume-builder-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/kasapdev/resume-builder-pro/actions/workflows/ci.yml)

Build a polished CV/resume with a live preview and print-ready output — fast, private, and fully offline.

> A zero-dependency resume builder. Fill in contact info, a summary, repeatable work experience and education entries, and tag-style skills — watch a fully styled resume update instantly in two selectable themes. Print it or save it as a PDF straight from your browser, with everything autosaved to your device.

## Overview

Resume Builder Pro runs entirely in the browser with no build step, no frameworks, and no network calls — open `index.html` from disk and it works. The form on the left drives a live, styled resume document on the right. A print stylesheet hides the form and toolbar chrome so only the resume itself prints, full width, on a plain white page.

## Features

- **Contact info** — name, headline/title, email, phone, location, and website/LinkedIn.
- **Summary** section with a free-text paragraph.
- **Repeatable work experience entries** — role, company, start/end, and a free-text description (one achievement per line).
- **Repeatable education entries** — degree/program, school, start/end, and optional notes (honors, GPA, etc).
- **Tag-style skill input** — type a skill and press <kbd>Enter</kbd> (or <kbd>,</kbd>) to add it as a removable pill; duplicate skills are rejected.
- **Two distinct visual themes** — *Classic* (centered serif header, understated single-column layout) and *Modern* (bold sans-serif header with an accent color bar and colored section headings) — switch instantly, no re-entry of data.
- **Print-friendly layout** — a dedicated `@media print` stylesheet hides the form and toolbar and prints only the resume document.
- **Print / Save as PDF** button triggers the browser's native `window.print()` — no PDF library, no server round-trip.
- **Autosave to `localStorage`** as you type, so a refresh never loses your work.
- **Explicit "Clear all"** action (with a confirmation prompt) to wipe the saved resume and start fresh.
- **Dark & light themes** for the builder UI itself (the resume document always renders on white paper for print fidelity), fully responsive down to 360px, accessible, and keyboard-driven.

## Installation

No dependencies, no build step.

```bash
git clone https://github.com/kasapdev/resume-builder-pro.git
cd resume-builder-pro
```

Then simply open `index.html` in any modern browser (double-click it, or `file://` it). That's it.

## Usage

1. Fill in your **contact info** and **summary**.
2. Add **work experience** and **education** entries — click **Add entry** to append more, **Remove entry** to drop one.
3. Type skills into the **Skills** field and press <kbd>Enter</kbd> to tag them.
4. Pick **Classic** or **Modern** from the theme switch in the toolbar — the preview updates instantly.
5. Click **Print / Save as PDF** (or press <kbd>Ctrl/⌘</kbd>+<kbd>P</kbd>) to print or export a PDF via your browser's print dialog.
6. Your work autosaves continuously; use **Clear all** to start over.

## Keyboard Shortcuts

| Action                | Shortcut                             |
| ----------------------- | ------------------------------------- |
| Print / Save as PDF        | <kbd>Ctrl/⌘</kbd> + <kbd>P</kbd>    |
| Add a skill tag              | <kbd>Enter</kbd> (in Skills field)  |
| Show shortcuts help            | <kbd>?</kbd>                       |
| Close dialog                    | <kbd>Esc</kbd>                     |

## Screenshots

> _Screenshots coming soon._

## Roadmap

- [ ] Additional resume themes (compact, two-column)
- [ ] Drag-to-reorder experience/education entries
- [ ] Custom section ordering
- [ ] Export/import resume data as JSON
- [ ] Optional profile photo for themes that support it

## License

MIT Licensed.
