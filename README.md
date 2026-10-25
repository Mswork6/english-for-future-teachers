# English for Future Teachers — working prototype

Static web application. Stack: HTML, CSS, plain JavaScript, JSON; no build tools, backend or database.

## Run in JetBrains WebStorm
1. Open the `english-for-future-teachers` folder in WebStorm.
2. Right-click `index.html` -> **Open in Browser** (with WebStorm's built-in server), or run from project folder: `python -m http.server 8000` and open `http://localhost:8000`.
3. Do not launch `index.html` directly through `file://`: JSON is loaded via `fetch` and requires a local web server.

## Contents
- `index.html` — single-page entry point.
- `css/styles.css` — responsive styling.
- `js/app.js` — hash-based routing, phrase cards, browser speech synthesis, exercises/grading, and dialogue cases.
- `data/modules.json` — list of 3 planned modules.
- `data/classroom-english.json` — **demonstration-only** data (3 phrases, 5 tasks, 1 case).

## Agreed target
Three modules: Classroom English, Communication with Students, Teaching Practice. Each has separate Theory / Practice / Teaching Cases sections. Theory is a simple phrase-card list (approximately 30–40 entries) with EN+RU visible, audio and expandable context example. Practice has 35 tasks (7 per type): matching, multiple choice, fill gaps, find & correct error, sentence ordering. All grades appear only on final submit and permit partial scores. Each module contains 3 independent pedagogical cases; scores are shown only at the end of each case. No registration or between-visit progress saving.

## Important prototype limitations
Only the first module has sample JSON. This is starter code, not final learning content. The demonstration has only **5 Practice tasks**, not the intended 35, and **1 case**, not 3. Current sentence ordering is all-or-nothing; the final grading specification can be refined. Pronunciation uses the browser's built-in voices and depends on the user's OS/browser.

## Data expansion
Add `data/communication-with-students.json` and `data/teaching-practice.json` matching the existing JSON structure. For the first module, replace sample `theory`, `practice`, and `cases` arrays with reviewed learning content. No changes to routes are needed.
