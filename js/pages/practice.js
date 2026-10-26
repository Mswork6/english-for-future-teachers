import {app} from '../state.js';
import {crumbs, header, el, append, link} from '../utils/dom.js';
import {gradePractice} from '../practice/grading.js';

const TYPES = {
    matching: 'Matching Pairs',
    choice: 'Multiple Choice',
    fill: 'Fill in the Blanks',
    error: 'Find and Correct the Error',
    sentence: 'Sentence Building'
};
const storageKey = mod => `eft:practice:${mod.id}:attempt:v1`;
const resultKey = mod => `eft:practice:${mod.id}:result:v1`;
const empty = q => q.type === 'matching' ? {} : q.type === 'fill' || q.type === 'sentence' ? [] : q.type === 'error' ? {
    word: null,
    correction: ''
} : null;
const answered = (q, a) => q.type === 'matching' ? q.pairs.every((_, i) => Boolean(a?.[i])) : q.type === 'choice' ? Number.isInteger(a) : q.type === 'fill' ? q.answers.every((_, i) => Boolean(a?.[i]?.trim())) : q.type === 'error' ? Number.isInteger(a?.word) && Boolean(a?.correction?.trim()) : q.type === 'sentence' ? a?.length === q.words.length : false;
const icon = name => {
    const i = el('i');
    i.setAttribute('data-lucide', name);
    return i;
};

function safeRead(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch {
        return null;
    }
}

function persist(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {/* storage may be disabled */
    }
}

function navigate(path) {
    location.hash = '#' + path;
}

function button(label, cls, action, type = 'button') {
    const b = el('button', label, cls);
    b.type = type;
    b.addEventListener('click', action);
    return b;
}

export function practice(mod) {
    const questions = mod.practice || [];
    document.body.classList.add('practice-view');
    const heading = el('div', null, 'practice-page-heading');
    append(heading, link('← Back to Module', `/module/${mod.id}`, 'practice-module-back'), el('h1', 'Practice Test'));
    app.append(heading);
    if (!questions.length) {
        app.append(el('p', 'No practice questions are available yet.', 'note'));
        return;
    }
    const previous = safeRead(storageKey(mod));
    const saved = Object.fromEntries(questions.map(q => [q.id, previous?.answers?.[q.id] ?? empty(q)]));
    let index = Math.min(Math.max(Number(previous?.index) || 0, 0), questions.length - 1);
    let drawerOpen = false;
    let confirmOpen = false;
    const frame = el('div', null, 'practice-shell');
    const main = el('div', null, 'practice-main');
    const toolbar = el('div', null, 'practice-toolbar');
    const count = el('span', null, 'practice-count');
    const progress = el('div', null, 'practice-progress');
    const bar = el('div', null, 'practice-progress-bar');
    progress.append(bar);
    const openNav = button('All questions', 'btn secondary practice-nav-toggle', () => setDrawer(true));
    const card = el('section', null, 'question practice-active-question');
    const back = button('← Previous', 'btn secondary', () => go(index - 1));
    const next = button('Next →', 'btn', () => go(index + 1));
    const finish = button('Finish Practice', 'btn', () => showConfirm());
    const controls = el('div', null, 'practice-controls');
    append(controls, back, next, finish);
    const drawer = el('aside', null, 'practice-drawer');
    drawer.setAttribute('aria-label', 'Question navigator');
    const drawerHeading = el('div', null, 'practice-drawer-heading');
    const closeNav = button('×', 'practice-close', () => setDrawer(false));
    closeNav.setAttribute('aria-label', 'Close navigator');
    append(drawerHeading, el('h2', 'Question Navigator'), closeNav);
    const groups = el('div', null, 'practice-groups');
    const drawerSummary = el('p', null, 'practice-summary');
    append(drawer, drawerHeading, groups, drawerSummary, button('Finish Practice', 'btn practice-finish', () => {
        setDrawer(false);
        showConfirm();
    }));
    const dialog = el('div', null, 'practice-dialog');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', 'Finish practice confirmation');
    const modalOverlay = el('div', null, 'practice-modal-overlay');
    modalOverlay.onclick = () => hideConfirm();
    append(toolbar, count, openNav);
    append(main, toolbar, progress, card, controls);
    append(frame, main, drawer, modalOverlay, dialog);
    app.append(frame);

    function save() {
        persist(storageKey(mod), {index, answers: saved});
    }

    function setDrawer(open) {
        drawerOpen = open;
        drawer.classList.toggle('is-open', open);
        frame.classList.toggle('navigator-open', open);
        openNav.setAttribute('aria-expanded', String(open));
        if (open) closeNav.focus();
    }

    function hideConfirm() {
        confirmOpen = false;
        dialog.classList.remove('is-open');
        modalOverlay.classList.remove('is-open');
    }

    function showConfirm() {
        setDrawer(false);
        confirmOpen = true;
        const missing = questions.filter(q => !answered(q, saved[q.id])).length;
        dialog.replaceChildren();
        append(dialog, el('h2', 'Finish Practice?'), el('p', missing ? `${missing} question(s) are not fully answered. You can return to them or submit anyway.` : 'Your answers will be checked now. You will see the results on a separate page.'));
        const buttons = el('div', null, 'practice-modal-actions');
        append(buttons, button('Keep working', 'btn secondary', hideConfirm), button('Submit answers', 'btn', () => {
            const grading = gradePractice(questions, saved);
            persist(resultKey(mod), {
                grading,
                answers: saved,
                submittedAt: Date.now(),
                questionIds: questions.map(q => q.id)
            });
            try {
                localStorage.removeItem(storageKey(mod));
            } catch {
            }
            navigate(`/module/${mod.id}/practice/results`);
        }));
        dialog.append(buttons);
        dialog.classList.add('is-open');
        modalOverlay.classList.add('is-open');
        buttons.querySelector('button').focus();
    }

    function go(n) {
        if (n < 0 || n >= questions.length) return;
        index = n;
        save();
        render();
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

    function render() {
        const q = questions[index];
        card.replaceChildren();
        count.textContent = `Question ${index + 1} of ${questions.length}`;
        bar.style.width = `${(index + 1) / questions.length * 100}%`;
        append(card, el('div', `Task ${index + 1} · ${TYPES[q.type] || q.type}`, 'label'), el('h3', q.prompt));
        const area = el('div', null, 'practice-answer-area');
        card.append(area);
        const update = () => {
            save();
            renderGroups();
        };
        if (q.type === 'matching') {
            const options = q.pairs.map(p => p[1]).reverse();
            q.pairs.forEach(([source], n) => {
                const wrap = el('label', null, 'practice-match-row');
                wrap.append(el('span', source));
                const sel = el('select', null, 'text-answer');
                sel.append(new Option('Select translation', ''));
                options.forEach(opt => sel.append(new Option(opt, opt)));
                sel.value = saved[q.id]?.[n] || '';
                sel.onchange = () => {
                    saved[q.id][n] = sel.value;
                    update();
                };
                wrap.append(sel);
                area.append(wrap);
            });
        } else if (q.type === 'choice') {
            q.options.forEach((opt, n) => {
                const label = el('label', null, 'choice');
                const radio = el('input');
                radio.type = 'radio';
                radio.name = q.id;
                radio.value = String(n);
                radio.checked = saved[q.id] === n;
                radio.onchange = () => {
                    saved[q.id] = n;
                    update();
                };
                append(label, radio, el('span', opt));
                area.append(label);
            });
        } else if (q.type === 'fill') {
            q.answers.forEach((_, n) => {
                const input = el('input', null, 'text-answer');
                input.type = 'text';
                input.placeholder = `Blank ${n + 1}`;
                input.value = saved[q.id]?.[n] || '';
                input.oninput = () => {
                    saved[q.id][n] = input.value;
                    update();
                };
                area.append(input);
            });
        } else if (q.type === 'error') {
            area.append(el('p', 'Select the incorrect word:', 'muted'));
            const tokens = el('div', null, 'row practice-tokens');
            q.sentence.split(' ').forEach((word, n) => {
                const b = button(word, 'icon-btn', () => {
                    saved[q.id].word = n;
                    update();
                    render();
                });
                if (saved[q.id]?.word === n) b.classList.add('is-selected');
                tokens.append(b);
            });
            const correction = el('input', null, 'text-answer');
            correction.placeholder = 'Correct word';
            correction.value = saved[q.id]?.correction || '';
            correction.oninput = () => {
                saved[q.id].correction = correction.value;
                update();
            };
            append(area, tokens, el('p', 'Type the correct replacement:', 'muted'), correction);
        } else if (q.type === 'sentence') {
            const pool = el('div', null, 'row practice-tokens'), selection = el('div', null, 'row practice-tokens');
            const draw = () => {
                pool.replaceChildren();
                selection.replaceChildren();
                q.words.forEach((w, n) => {
                    if (saved[q.id].includes(n)) return;
                    pool.append(button(w, 'icon-btn', () => {
                        saved[q.id].push(n);
                        update();
                        draw();
                    }));
                });
                saved[q.id].forEach(n => selection.append(button(q.words[n], 'icon-btn is-selected', () => {
                    saved[q.id] = saved[q.id].filter(x => x !== n);
                    update();
                    draw();
                })));
            };
            append(area, el('p', 'Click words in the correct order. Click a selected word to undo.', 'muted'), el('div', 'Available words:', 'label'), pool, el('div', 'Your sentence:', 'label'), selection);
            draw();
        }
        back.disabled = index === 0;
        next.hidden = index === questions.length - 1;
        finish.hidden = index !== questions.length - 1;
        renderGroups();
        window.lucide?.createIcons();
    }

    function renderGroups() {
        groups.replaceChildren();
        const segments = [];
        questions.forEach((q, n) => {
            let segment = segments.find(s => s.type === q.type);
            if (!segment) {
                segment = {type: q.type, items: []};
                segments.push(segment);
            }
            segment.items.push({q, n});
        });
        segments.forEach(s => {
            const section = el('section', null, 'practice-nav-section');
            section.append(el('h3', TYPES[s.type] || s.type));
            const grid = el('div', null, 'practice-number-grid');
            s.items.forEach(({q, n}) => {
                const b = button(String(n + 1), 'practice-number', () => {
                    setDrawer(false);
                    go(n);
                });
                if (n === index) {
                    b.classList.add('is-current');
                    b.setAttribute('aria-current', 'step');
                }
                if (answered(q, saved[q.id])) b.classList.add('is-answered');
                b.setAttribute('aria-label', `Question ${n + 1}${answered(q, saved[q.id]) ? ', answered' : ''}`);
                grid.append(b);
            });
            section.append(grid);
            groups.append(section);
        });
        const done = questions.filter(q => answered(q, saved[q.id])).length;
        drawerSummary.textContent = `${done} of ${questions.length} answered`;
    }

    const onKey = e => {
        if (e.key === 'Escape') {
            if (confirmOpen) hideConfirm(); else if (drawerOpen) setDrawer(false);
        }
    };
    // Remove the previous page's listener when navigating back to Practice.
    window.__practiceKeyController?.abort();
    const controller = new AbortController();
    window.__practiceKeyController = controller;
    document.addEventListener('keydown', onKey, {signal: controller.signal});
    save();
    render();
}

export function practiceResults(mod) {
    crumbs(app, mod, 'Practice Results');
    const data = safeRead(resultKey(mod));
    header(app, 'Practice', 'Practice Results', 'Your final score for the completed attempt.');
    if (!data || !data.grading || JSON.stringify(data.questionIds) !== JSON.stringify((mod.practice || []).map(q => q.id))) {
        append(app, el('p', 'There are no results for a completed attempt yet.', 'note'), link('Go to Practice', `/module/${mod.id}/practice`, 'btn'));
        return;
    }
    const {grading} = data;
    const panel = el('section', null, 'panel practice-results');
    append(panel, el('div', `${Number(grading.total.toFixed(2))} / ${grading.maximum}`, 'practice-results-score'), el('div', `${grading.percentage}%`, 'practice-results-percent'), el('p', 'Your final score', 'muted'));
    const byType = el('div', null, 'practice-result-breakdown');
    const groups = [];
    (mod.practice || []).forEach((q, n) => {
        let item = groups.find(x => x.type === q.type);
        if (!item) {
            item = {type: q.type, score: 0, count: 0};
            groups.push(item);
        }
        item.score += grading.results[n]?.points || 0;
        item.count++;
    });
    groups.forEach(item => {
        const row = el('div', null, 'practice-result-row');
        append(row, el('span', TYPES[item.type] || item.type), el('strong', `${Number(item.score.toFixed(2))} / ${item.count}`));
        byType.append(row);
    });
    panel.append(byType);
    const actions = el('div', null, 'practice-result-actions');
    actions.append(link('Return to Module', `/module/${mod.id}`, 'btn'));
    actions.append(button('Try Again', 'btn secondary', () => {
        try {
            localStorage.removeItem(storageKey(mod));
            localStorage.removeItem(resultKey(mod));
        } catch {
        }
        navigate(`/module/${mod.id}/practice`);
    }));
    panel.append(actions);
    app.append(panel);
}
