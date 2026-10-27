# English for Future Teachers

**Interactive English Learning Resource for Future Teachers**

A static, browser-based English learning resource for pedagogical college students studying English in professional activities.

## Modules

1. **The Beginning of the Lesson** — Greetings, introductions, starting the lesson, attendance and late arrivals.
2. **Communication with Students** — Supportive, respectful communication with learners.
3. **Teaching Practice** — Language for teaching activities and feedback.

Each module is designed around three sections: **Theory**, **Practice**, and **Teaching Cases**. Content is being developed progressively; some modules may not yet have their own JSON file.

## Features

- Theory cards present English expressions, Russian translations, examples in context, and browser-based pronunciation.
- Practice selects 35 exercises per attempt (7 in each of 5 types): Matching Pairs, Multiple Choice, Fill in the Blanks, Find and Correct the Error, and Sentence Building.
- Answers are saved locally during an attempt. Scoring takes place after final submission, including partial credit where appropriate.
- Results and review screens show performance and correct answers; explanations are shown for multiple-choice questions.
- Teaching Cases support a sequence of decisions and feedback at the end of a case, where case content is available.

## Technology

HTML5, CSS3, JavaScript ES Modules, JSON, Web Speech API, and Node.js built-in test runner. No frontend framework or backend is required.

## Getting started

Open `index.html` through a local HTTP server (for example, the WebStorm development server). Do **not** use a `file://` URL.

Alternatively, from the project root:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Testing

```bash
npm test
```

The current repository contains **8** test files. The exact number of test cases is reported by Node.js when tests run.

## Source layout

```text
index.html
css/
data/
js/
  pages/
  practice/
  utils/
tests/
```

Important JavaScript files in this checkout:

- `js/app.js`
- `js/data-service.js`
- `js/module-loader.js`
- `js/pages/cases.js`
- `js/pages/home.js`
- `js/pages/module.js`
- `js/pages/modules.js`
- `js/pages/practice-results.js`
- `js/pages/practice-review.js`
- `js/pages/practice.js`
- `js/pages/theory.js`
- `js/practice/attempt-state.js`
- `js/practice/grading.js`
- `js/practice/matching-select.js`
- `js/practice/question-bank.js`
- `js/practice/question-renderers.js`
- `js/practice/shared.js`
- `js/router.js`
- `js/state.js`
- `js/utils/dom.js`
- `js/utils/speech.js`

Data files in this checkout:

- `data/module-01-practice.json`
- `data/modules.json`
- `data/the-beginning-of-the-lesson.json`

## Persistence and privacy

The application stores draft attempts and results in browser localStorage. Data is local to that browser/profile and can be cleared by the user or browser. There are no student accounts or server-side progress records.

## Project status

Active development. The first module has educational materials and a Practice question bank; other module content is being prepared. Explanatory Note and Teaching Guidelines may still contain placeholder text.

## Development workflow

Work in feature/refactoring branches, run `npm test` and manual browser checks before opening a Pull Request to `master`.

---

Educational software project · 2026
