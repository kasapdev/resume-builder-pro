# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-09-06

### Fixed

- Autosave could silently drop the last keystrokes: field edits are saved through a 400ms debounce, so the "Saved" status badge could read "Saved" for up to 400ms after a change that had not actually reached `localStorage` yet. Closing the tab, reloading, or switching away within that window lost the pending edit despite the UI's assurance. `js/app.js` now flushes a save immediately on `beforeunload` and whenever the page becomes hidden (`visibilitychange`), so quick closes/reloads no longer lose data.
