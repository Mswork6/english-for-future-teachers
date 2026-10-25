# English for Future Teachers

**Interactive English Learning Resource for Future Teachers**

English for Future Teachers is a web-based interactive learning application designed for students of pedagogical colleges studying the discipline *English in Professional Activities*.

The application helps future teachers develop professional English communication skills through interactive learning materials, practical exercises, and simulated classroom situations.

**Project status:** Working prototype — under active development.

## 1. Project Overview

The learning resource combines three educational components:

- **Theory** — a collection of useful English expressions for professional classroom communication.
- **Practice** — interactive exercises for developing and assessing language skills.
- **Teaching Cases** — simulated classroom situations where students make teaching decisions and interact with virtual learners.

The application is designed to support independent learning, practical language training, and preparation for real teaching situations.

## 2. Technology Stack

The project uses lightweight web technologies without external frontend frameworks.

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Responsive styling and user interface |
| JavaScript (ES Modules) | Application logic and interactivity |
| JSON | Educational content storage |
| Web Speech API | English phrase pronunciation |
| Node.js | Automated testing |
| Git / GitHub | Version control and collaboration |

**Development environment:** JetBrains WebStorm.

The application does not require a backend server, database, user registration, or build tools.

A local HTTP server is required to load JSON files and JavaScript modules correctly.

## 3. Project Structure

```text
english-for-future-teachers/
│
├── index.html
├── package.json
├── README.md
├── .gitignore
│
├── css/
│   ├── main.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── home.css
│   ├── theory.css
│   ├── practice.css
│   └── cases.css
│
├── js/
│   ├── app.js
│   ├── router.js
│   ├── state.js
│   ├── data-service.js
│   │
│   ├── pages/
│   │   ├── home.js
│   │   ├── modules.js
│   │   ├── module.js
│   │   ├── theory.js
│   │   ├── practice.js
│   │   └── cases.js
│   │
│   ├── practice/
│   │   └── grading.js
│   │
│   └── utils/
│       └── dom.js
│
├── data/
│   ├── modules.json
│   └── classroom-english.json
│
└── tests/
    ├── grading.test.mjs
    └── data-service.test.mjs
```

### Main Components

| Component | Description |
|---|---|
| `index.html` | Main application entry point |
| `css/` | Modular stylesheets |
| `js/app.js` | Application initialization |
| `js/router.js` | Client-side navigation |
| `js/state.js` | Shared application root reference |
| `js/data-service.js` | Educational data loading, caching and error handling |
| `js/pages/` | Individual application pages |
| `js/practice/grading.js` | Practice scoring and assessment |
| `js/utils/dom.js` | Reusable DOM utilities |
| `data/` | Educational materials stored in JSON |
| `tests/` | Automated unit tests |

## 4. Installation and Running

### Requirements

- A modern web browser (Chrome, Edge, Firefox, etc.).
- JetBrains WebStorm or another code editor.
- Node.js 18 or later for automated testing.

### Running in WebStorm

1. Clone or download the repository.
2. Open the project folder in WebStorm.
3. Open `index.html`.
4. Select **Open in Browser** using WebStorm's built-in development server.
5. The application will open in your browser.

### Alternative: Python HTTP Server

From the project root directory, run:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000`

**Important:** Do not open `index.html` directly using the `file://` protocol. The application loads JavaScript modules and JSON files that require an HTTP server.

## 5. Learning Modules

The application is organized into three thematic learning modules.

### Module 1. Classroom English

Professional English expressions used for classroom management and lesson organization.

Topics include:

- Starting and finishing lessons.
- Giving instructions.
- Checking understanding.
- Managing classroom activities.
- Providing classroom feedback.

### Module 2. Communication with Students

English communication skills for effective teacher–student interaction.

Topics include:

- Supporting and encouraging learners.
- Asking and answering questions.
- Explaining difficult material.
- Providing constructive feedback.
- Handling communication difficulties.

### Module 3. Teaching Practice

Professional language used during practical teaching activities.

Topics include:

- Lesson planning and explanation.
- Organizing educational activities.
- Giving feedback on student performance.
- Responding to classroom situations.
- Reflecting on teaching decisions.

Each module contains three learning sections: Theory, Practice, and Teaching Cases.

## 6. Learning Components

### 6.1. Theory

Theory is an interactive collection of English expressions organized into thematic categories.

Each expression card contains:

- An English phrase.
- A Russian translation.
- A pronunciation button.
- An expandable **Example in Context** section.

The interface uses a simple list of cards without search, sorting, or filtering.

**Planned content:** approximately 30–40 expressions per module. The final number will be determined during content development.

Pronunciation is provided through the browser's Web Speech API. Available voices may vary depending on the browser and operating system.

### 6.2. Practice

Each completed module will contain **35 interactive exercises**, divided into five categories.

| Order | Exercise Type | Tasks |
|---|---|---|
| 1 | Matching Pairs | 7 |
| 2 | Multiple Choice | 7 |
| 3 | Fill in the Blanks | 7 |
| 4 | Find and Correct the Error | 7 |
| 5 | Sentence Ordering | 7 |
| **Total** | | **35** |

#### Assessment Rules

- Each task is worth a maximum of 1 point.
- Maximum total score: 35 points.
- Partial credit is supported where applicable.
- All answers are checked together after final submission.
- Students can change their answers before submitting.
- The final result is displayed as a score and percentage.

The scoring logic is implemented separately in `js/practice/grading.js`.

The current prototype demonstrates all five exercise types with a reduced number of tasks.

### 6.3. Teaching Cases

Teaching Cases simulate professional situations in which the learner takes the role of a teacher.

Each case includes:

- A classroom situation.
- A sequence of teacher decisions.
- Different response options.
- Reactions from virtual students.
- Feedback and assessment after completing the case.

**Planned content:** three independent teaching cases per module.

The current prototype includes one demonstration case in Classroom English.

## 7. Educational Data

Learning content is stored in JSON files inside the `data/` directory.

The `modules.json` file contains the list of available modules.

Each module has its own content file containing:

- Module identification and title.
- Theory expressions.
- Practice exercises.
- Teaching Case scenarios.

Currently available demonstration data:

`data/classroom-english.json`

Planned additional files:

```text
data/
├── modules.json
├── classroom-english.json
├── communication-with-students.json
└── teaching-practice.json
```

New educational content can be added without changing the main application architecture, provided it follows the supported JSON data structure.

## 8. Automated Testing

The project uses the built-in Node.js test runner.

No additional testing framework is required.

To execute the tests, run:

```bash
npm test
```

### Current Test Coverage

| Test File | Focus | Tests |
|---|---|---|
| `grading.test.mjs` | Practice assessment logic | 6 |
| `data-service.test.mjs` | Loading, caching and error handling | 5 |
| **Total** | | **11** |

The automated tests verify:

- Partial scores for matching exercises.
- Multiple-choice assessment.
- Partial credit for fill-in-the-blank exercises.
- Error identification and correction.
- Sentence ordering.
- Total score and percentage calculation.
- Successful JSON loading and caching.
- Shared concurrent requests.
- HTTP error handling.
- Invalid JSON handling.
- Retry behavior after failed requests.

Automated tests currently focus on application logic. Browser-based interface testing is performed manually.

## 9. Application Architecture

The application uses a modular frontend architecture based on native JavaScript ES Modules.

### Routing

`router.js` handles navigation between application pages using URL hash routes.

The router includes protection against outdated asynchronous navigation results.

### Data Management

`data-service.js` handles educational content loading using the Fetch API.

It provides:

- JSON loading.
- Request caching.
- Shared concurrent requests.
- HTTP and network error handling.
- Retry capability after failed requests.

### User Interface

Individual pages are implemented as separate JavaScript modules in `js/pages/`.

Reusable DOM helpers are located in `js/utils/dom.js`.

CSS is divided into global styles, shared layout rules, reusable components, and page-specific stylesheets.

### Assessment

Practice assessment is separated from rendering logic.

The `grading.js` module evaluates submitted answers and calculates individual and total scores.

This architecture allows educational content and interface components to be developed independently.

## 10. Current Development Status

### Implemented

- Responsive homepage.
- Learning module navigation.
- Explanatory Note and Teaching Guidelines placeholder pages.
- Modular CSS architecture.
- Modular JavaScript architecture.
- Theory phrase cards with pronunciation and contextual examples.
- Five demonstration Practice exercise types.
- Practice grading with partial credit.
- Interactive Teaching Case demonstration.
- JSON content loading with caching and error handling.
- Automated unit tests.

### Planned

- Complete educational content for all three modules.
- Approximately 30–40 Theory expressions per module.
- Full sets of 35 Practice exercises per module.
- Three Teaching Cases per module.
- Final interface design for all learning sections.
- Complete Explanatory Note and Teaching Guidelines.
- Additional functionality and accessibility testing.
- Final deployment and presentation.

## 11. Current Limitations

This repository contains a working prototype rather than a complete educational product.

- Only Classroom English contains demonstration learning materials.
- The demonstration contains 3 Theory expressions, 5 Practice tasks, and 1 Teaching Case.
- The other two modules are registered but do not yet contain learning materials.
- The Explanatory Note and Teaching Guidelines contain placeholder descriptions.
- Student progress is not stored between sessions.
- User registration and authentication are not implemented.
- Pronunciation depends on browser speech synthesis support.
- The visual design of Theory, Practice, and Teaching Cases is still being refined.

## 12. Version Control

The project uses Git and GitHub for version control.

Development follows a branch-based workflow:

- `master` — stable application version.
- Feature and refactoring branches — isolated development work.
- Pull Requests — review and integration of completed changes.

Changes should be tested before merging into the stable branch.

## 13. Project Purpose

The purpose of English for Future Teachers is to create an accessible and practical digital educational resource for students preparing for professional teaching activities.

The application aims to combine language learning with realistic pedagogical communication, helping future teachers develop confidence in using English in educational settings.

---

**English for Future Teachers — Interactive English Learning Resource**

*Educational software project · 2026*