const app = document.querySelector('#app');
const cache = new Map();

async function load(path) {
    if (!cache.has(path)) {
        const response = await fetch(path);
        if (!response.ok) throw Error(`Cannot load ${path}`);
        cache.set(path, await response.json())
    }
    return cache.get(path)
}

function el(tag, text, cls) {
    const e = document.createElement(tag);
    if (text != null) e.textContent = text;
    if (cls) e.className = cls;
    return e
}

function append(parent, ...children) {
    parent.append(...children);
    return parent
}

function link(label, route, cls = '') {
    const a = el('a', label, cls);
    a.href = '#' + route;
    return a
}

function header(parent, label, title, description) {
    append(parent, el('div', label, 'eyebrow'), el('h1', title), el('p', description, 'lead'))
}

function crumbs(parent, mod, section) {
    const c = el('div', null, 'breadcrumbs');
    append(c, link('Learning Modules', '/'), el('span', '/'), link(mod.title, `/module/${mod.id}`));
    if (section) append(c, el('span', '/'), el('span', section));
    append(parent, c)
}

function demo(parent) {
    append(parent, el('div', 'Demonstration content: the finalized educational materials and complete sets of 35 Practice tasks / 3 Teaching Cases per module will be added later.', 'note'))
}

function notReady(parent, title) {
    header(parent, 'Learning module', title, 'This module is prepared for content entry.');
    append(parent, el('p', 'The content JSON for this module has not yet been created.', 'note'), link('Back to modules', '/', 'btn'))
}

function home(modules) {
    const section = document.createElement('section');
    section.className = 'home-page';

    section.innerHTML = `
        <div class="home-heading">
            <span class="home-badge">ENGLISH LANGUAGE LEARNING</span>

            <h1>Welcome to English for Future Teachers!</h1>

            <p>Develop your English skills and prepare for real classroom situations.</p>
        </div>

        <div class="home-cards">
            <a class="home-card" href="#/modules">
                <div class="home-icon blue">
                    <i data-lucide="book-open"></i>
                </div>

                <h2>Learning Modules</h2>

                <p>Explore interactive lessons, exercises and teaching cases.</p>

                <span class="home-link blue-text">Explore →</span>
            </a>

            <a class="home-card" href="#/note">
                <div class="home-icon green">
                    <i data-lucide="file-text"></i>
                </div>

                <h2>Explanatory Note</h2>

                <p>Learn about the purpose, objectives and structure of the resource.</p>

                <span class="home-link green-text">Read More →</span>
            </a>

            <a class="home-card" href="#/guidelines">
                <div class="home-icon purple">
                    <i data-lucide="clipboard-list"></i>
                </div>

                <h2>Teaching Guidelines</h2>

                <p>Read recommendations for effective use of this learning resource.</p>

                <span class="home-link purple-text">Read More →</span>
            </a>
        </div>
    `;

    app.append(section);

    if (window.lucide) {
        lucide.createIcons();
    }
}

function modulesPage(modules) {
    header(
        app,
        'Learning Modules',
        'Learning Modules',
        'Choose a module to start learning.'
    );

    const grid = el('div', null, 'grid');

    for (const module of modules) {
        const card = el('article', null, 'card');

        append(
            card,
            el('h2', module.title),
            el('p', module.description),
            link('Open module', `/module/${module.id}`)
        );

        grid.append(card);
    }

    app.append(grid);
}

function theory(mod) {
    crumbs(app, mod, 'Theory');
    header(app, 'Theory', 'Useful classroom expressions', 'Open a phrase to see an example in context. Use the speaker button to hear the English phrase.');
    demo(app);
    let last = '';
    for (const p of mod.theory) {
        if (p.category !== last) {
            last = p.category;
            append(app, el('h2', last, 'section-name'))
        }
        const card = el('article', null, 'phrase'), head = el('div', null, 'phrase-head'), words = el('div'),
            actions = el('div', null, 'actions'), more = el('div', null, 'example hidden');
        append(words, el('h3', p.en), el('p', p.ru));
        const speak = el('button', '🔊', 'icon-btn');
        speak.type = 'button';
        speak.title = 'Listen';
        speak.setAttribute('aria-label', `Listen: ${p.en}`);
        speak.onclick = () => {
            if (!('speechSynthesis' in window)) return alert('Speech synthesis is not supported in this browser.');
            speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(p.en);
            u.lang = 'en-GB';
            u.rate = .9;
            speechSynthesis.speak(u)
        };
        const toggle = el('button', 'Example ▾', 'icon-btn');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.onclick = () => {
            more.classList.toggle('hidden');
            const opened = !more.classList.contains('hidden');
            toggle.setAttribute('aria-expanded', String(opened));
            toggle.textContent = opened ? 'Hide example ▴' : 'Example ▾'
        };
        append(actions, speak, toggle);
        append(head, words, actions);
        append(more, el('strong', 'Example in Context'), el('p', p.example));
        append(card, head, more);
        app.append(card)
    }
}

function practice(mod) {
    crumbs(app, mod, 'Practice');
    header(app, 'Practice', 'Practice your classroom English', 'You can change any answers before submitting. All tasks are assessed together at the end.');
    demo(app);
    const saved = {};
    const areas = [];
    const form = el('form', null, 'stack');
    form.noValidate = true;
    for (const [i, q] of mod.practice.entries()) {
        const block = el('section', null, 'question');
        append(block, el('div', `Task ${i + 1} · ${q.type}`, 'label'), el('h3', q.prompt));
        const area = el('div');
        areas.push(area);
        block.append(area);
        form.append(block);
        if (q.type === 'matching') {
            saved[q.id] = {};
            const options = q.pairs.map(p => p[1]).reverse();
            for (const [n, pair] of q.pairs.entries()) {
                const label = el('label', pair[0]);
                const select = el('select', null, 'text-answer');
                select.append(new Option('Select translation', ''));
                for (const op of options) select.append(new Option(op, op));
                select.onchange = () => {
                    saved[q.id][n] = select.value
                };
                append(area, label, select)
            }
        }
        if (q.type === 'choice') {
            for (const [n, opt] of q.options.entries()) {
                const label = el('label', null, 'choice');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = q.id;
                radio.value = String(n);
                radio.onchange = () => saved[q.id] = n;
                append(label, radio, el('span', opt));
                area.append(label)
            }
        }
        if (q.type === 'fill') {
            saved[q.id] = [];
            q.answers.forEach((_, n) => {
                const input = el('input', null, 'text-answer');
                input.type = 'text';
                input.placeholder = `Blank ${n + 1}`;
                input.oninput = () => saved[q.id][n] = input.value;
                area.append(input)
            })
        }
        if (q.type === 'error') {
            saved[q.id] = {word: null, correction: ''};
            append(area, el('p', 'Select the incorrect word:', 'muted'));
            const tokens = el('div', null, 'row');
            q.sentence.split(' ').forEach((word, n) => {
                const b = el('button', word, 'icon-btn');
                b.type = 'button';
                b.onclick = () => {
                    saved[q.id].word = n;
                    tokens.querySelectorAll('button').forEach(x => x.style.outline = '');
                    b.style.outline = '2px solid #285fc0'
                };
                tokens.append(b)
            });
            const correction = el('input', null, 'text-answer');
            correction.placeholder = 'Correct word';
            correction.oninput = () => saved[q.id].correction = correction.value;
            append(area, tokens, el('p', 'Type the correct replacement:', 'muted'), correction)
        }
        if (q.type === 'sentence') {
            saved[q.id] = [];
            const pool = el('div', null, 'row'), selection = el('div', null, 'row');
            const instruction = el('p', 'Click words in the correct order. Click a selected word to undo.', 'muted');

            function render() {
                pool.replaceChildren();
                selection.replaceChildren();
                q.words.forEach((w, n) => {
                    if (saved[q.id].includes(n)) return;
                    const b = el('button', w, 'icon-btn');
                    b.type = 'button';
                    b.onclick = () => {
                        saved[q.id].push(n);
                        render()
                    };
                    pool.append(b)
                });
                saved[q.id].forEach(n => {
                    const b = el('button', q.words[n], 'icon-btn');
                    b.type = 'button';
                    b.onclick = () => {
                        saved[q.id] = saved[q.id].filter(x => x !== n);
                        render()
                    };
                    selection.append(b)
                })
            }

            append(area, instruction, el('div', 'Available words:', 'label'), pool, el('div', 'Your sentence:', 'label'), selection);
            render()
        }
    }
    const submit = el('button', 'Submit all answers', 'btn');
    submit.type = 'submit';
    const result = el('div');
    form.append(submit, result);
    form.onsubmit = e => {
        e.preventDefault();
        let total = 0;
        for (let i = 0; i < mod.practice.length; i++) {
            const q = mod.practice[i], a = saved[q.id];
            let points = 0;
            if (q.type === 'matching') points = q.pairs.reduce((s, p, n) => s + (a?.[n] === p[1] ? 1 / q.pairs.length : 0), 0);
            if (q.type === 'choice') points = a === q.answer ? 1 : 0;
            if (q.type === 'fill') points = q.answers.reduce((s, v, n) => s + (a?.[n]?.trim().toLowerCase() === v.toLowerCase() ? 1 / q.answers.length : 0), 0);
            if (q.type === 'error') points = (a?.word === q.errorIndex ? .5 : 0) + (a?.correction?.trim().toLowerCase() === q.correctWord.toLowerCase() ? .5 : 0);
            if (q.type === 'sentence') points = a?.map(n => q.words[n]).join('|') === q.answer.join('|') ? 1 : 0;
            total += points;
            areas[i].querySelectorAll('.feedback').forEach(x => x.remove());
            const f = el('div', `Score: ${Number(points.toFixed(2))} / 1`, 'feedback');
            areas[i].append(f)
        }
        result.replaceChildren(el('div', `${Number(total.toFixed(2))} / ${mod.practice.length} points (${Math.round(total / mod.practice.length * 100)}%)`, 'score'), el('p', 'All answers have been checked. You can edit and submit again.', 'muted'));
        result.scrollIntoView({behavior: 'smooth', block: 'nearest'})
    };
    app.append(form)
}

function cases(mod) {
    crumbs(app, mod, 'Teaching Cases');
    header(app, 'Teaching Cases', 'Classroom situations', 'Choose the teacher’s response and see how the student reacts. Feedback appears after the case.');
    demo(app);
    for (const scenario of mod.cases) {
        const panel = el('section', null, 'panel');
        append(panel, el('h2', scenario.title));
        const chat = el('div', null, 'chat'), controls = el('div');
        append(panel, chat, controls);
        app.append(panel);
        let current = scenario.start, points = 0, steps = 0;

        function render() {
            const node = scenario.nodes[current];
            chat.append(el('div', `${node.speaker}: ${node.text}`, 'bubble'));
            controls.replaceChildren();
            if (node.end) {
                append(controls, el('div', `Case complete · ${points} / ${steps} points`, 'score'), el('p', points === steps ? 'Good use of supportive classroom language.' : 'Consider how to give clearer and more supportive feedback.', 'feedback'));
                const again = el('button', 'Restart case', 'btn secondary');
                again.onclick = () => {
                    chat.replaceChildren();
                    current = scenario.start;
                    points = 0;
                    steps = 0;
                    render()
                };
                controls.append(again);
                return
            }
            for (const choice of node.choices) {
                const b = el('button', choice.text, 'case-option');
                b.onclick = () => {
                    chat.append(el('div', `Teacher: ${choice.text}`, 'bubble teacher'));
                    points += choice.points;
                    steps++;
                    current = choice.next;
                    render()
                };
                controls.append(b)
            }
        }

        render()
    }
}

async function route() {
    app.replaceChildren();
    try {
        const modules = await load('data/modules.json');
        const parts = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('/').filter(Boolean);
        document.body.classList.toggle('home-view', !parts.length);
        if (!parts.length) return home(modules);
        if (parts[0] === 'modules') {
            return modulesPage(modules);
        }
        if (parts[0] === 'note') return header(app, 'About the resource', 'Explanatory Note', 'A learning resource for students of teacher training colleges studying English in professional contexts.');
        if (parts[0] === 'guidelines') return header(app, 'For educators', 'Teaching Guidelines', 'Use Theory for familiarization, Practice for self-assessment, and Teaching Cases to discuss teacher–student communication.');
        if (parts[0] !== 'module') throw Error('Page not found');
        const info = modules.find(m => m.id === parts[1]);
        if (!info) throw Error('Unknown module');
        let mod;
        try {
            mod = await load(`data/${info.id}.json`)
        } catch {
            return notReady(app, info.title)
        }
        if (!parts[2]) return modulePage(mod);
        if (parts[2] === 'theory') return theory(mod);
        if (parts[2] === 'practice') return practice(mod);
        if (parts[2] === 'cases') return cases(mod);
        throw Error('Unknown section')
    } catch (err) {
        append(app, el('h1', 'Something went wrong'), el('p', err.message), link('Back to modules', '/', 'btn'))
    }
}

window.addEventListener('hashchange', route);
route();
