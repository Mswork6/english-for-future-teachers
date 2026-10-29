import {app} from '../state.js';
import {el, append, link} from '../utils/dom.js';
import {gradePractice} from '../practice/grading.js';
import {renderAnswer} from '../practice/question-renderers.js';
import {restoreAttempt, saveDraft, completeAttempt} from '../practice/attempt-state.js';
import {TYPES, empty, answered, navigate, button} from '../practice/shared.js';

export function practice(mod) {
    const bank = mod.practice || [];
    const {questions, previous} = restoreAttempt(mod, bank);
    document.body.classList.add('practice-view');
    const heading = el('div', null, 'practice-page-heading');
    append(heading, link('← Back to Module', `/module/${mod.id}`, 'practice-module-back'), el('h1', 'Practice Test'));
    app.append(heading);
    if (!questions.length) {
        app.append(el('p', 'No practice questions are available yet.', 'note'));
        return;
    }
    const matchingOrders = Object.fromEntries(questions.filter(q => q.type === 'matching').map(q => {
        const values = q.pairs.map(pair => pair[1]);
        const stored = previous?.matchingOrders?.[q.id];
        const valid = Array.isArray(stored) && stored.length === values.length &&
            new Set(stored).size === values.length && values.every(value => stored.includes(value));
        if (valid) return [q.id, stored];
        const shuffled = [...values];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return [q.id, shuffled];
    }));
    const saved = Object.fromEntries(questions.map(q => [q.id, previous?.answers?.[q.id] ?? empty(q)]));
    let index = Math.min(Math.max(Number(previous?.index) || 0, 0), questions.length - 1);
    let drawerOpen = false;
    let confirmOpen = false;
    let selectListeners = new AbortController();
    const mobileQuery = window.matchMedia('(max-width: 740px)');
    const frame = el('div', null, 'practice-shell');
    const main = el('div', null, 'practice-main');
    const toolbar = el('div', null, 'practice-toolbar');
    const count = el('span', null, 'practice-count');
    const progress = el('div', null, 'practice-progress');
    const bar = el('div', null, 'practice-progress-bar');
    progress.append(bar);
    const openNav = button('All questions', 'btn secondary practice-nav-toggle', () => setDrawer(true));
    openNav.setAttribute('aria-haspopup', 'dialog');
    openNav.setAttribute('aria-expanded', 'false');
    const card = el('section', null, 'question practice-active-question');
    const back = button('← Previous', 'btn secondary', () => go(index - 1));
    const next = button('Next →', 'btn', () => go(index + 1));
    const finish = button('Finish Practice', 'btn', () => showConfirm());
    const controls = el('div', null, 'practice-controls');
    append(controls, back, next, finish);
    const drawer = el('aside', null, 'practice-drawer');
    drawer.id = 'practice-question-navigator';
    drawer.setAttribute('aria-label', 'Question navigator');
    openNav.setAttribute('aria-controls', drawer.id);
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
    const drawerOverlay = el('div', null, 'practice-drawer-overlay');
    drawerOverlay.setAttribute('aria-hidden', 'true');
    drawerOverlay.addEventListener('click', () => setDrawer(false));
    const dialog = el('div', null, 'practice-dialog');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', 'Finish practice confirmation');
    const modalOverlay = el('div', null, 'practice-modal-overlay');
    modalOverlay.onclick = () => hideConfirm();
    append(toolbar, count, openNav);
    append(main, toolbar, progress, card, controls);
    append(frame, main, drawer);
    app.append(frame);
    document.body.append(drawerOverlay, modalOverlay, dialog);
    const cleanupModal = () => {
        drawerOverlay.remove();
        drawer.remove();
        modalOverlay.remove();
        dialog.remove();
        document.body.classList.remove('practice-drawer-open');
    };
    window.addEventListener('hashchange', cleanupModal, {once: true});

    function save() {
        saveDraft(mod, {index, answers: saved, questions, matchingOrders});
    }

    function setDrawer(open, restoreFocus = true) {
        const wasOpen = drawerOpen;
        drawerOpen = open;
        // On phones, portal the navigator to <body> so its overlay cannot
        // cover it through an ancestor stacking context.
        if (open && mobileQuery.matches && drawer.parentElement !== document.body) {
            document.body.append(drawer);
        } else if ((!open || !mobileQuery.matches) && drawer.parentElement !== frame) {
            frame.append(drawer);
        }
        drawer.classList.toggle('is-open', open);
        frame.classList.toggle('navigator-open', open);
        drawerOverlay.classList.toggle('is-open', open);
        document.body.classList.toggle('practice-drawer-open', open && mobileQuery.matches);
        openNav.setAttribute('aria-expanded', String(open));
        drawer.setAttribute('role', mobileQuery.matches ? 'dialog' : 'region');
        if (mobileQuery.matches) drawer.setAttribute('aria-modal', String(open));
        else drawer.removeAttribute('aria-modal');
        if (open) closeNav.focus();
        else if (wasOpen && restoreFocus) openNav.focus();
    }

    function hideConfirm() {
        confirmOpen = false;
        dialog.classList.remove('is-open');
        modalOverlay.classList.remove('is-open');
    }

    function showConfirm() {
        setDrawer(false, false);
        confirmOpen = true;
        const missing = questions.filter(q => !answered(q, saved[q.id])).length;
        dialog.replaceChildren();
        append(dialog, el('h2', 'Finish Practice?'), el('p', missing ? `${missing} question(s) are not fully answered. You can return to them or submit anyway.` : 'Your answers will be checked now. You will see the results on a separate page.'));
        const buttons = el('div', null, 'practice-modal-actions');
        append(buttons, button('Keep working', 'btn secondary', hideConfirm), button('Submit answers', 'btn', () => {
            const grading = gradePractice(questions, saved);
            completeAttempt(mod, {
                grading,
                answers: saved,
                submittedAt: Date.now(),
                questionIds: questions.map(q => q.id),
                questions
            });
            hideConfirm();
            navigate(`/module/${mod.id}/practice/results`);
        }));
        dialog.append(buttons);
        dialog.classList.add('is-open');
        modalOverlay.classList.add('is-open');
        buttons.querySelector('button').focus();
    }

    function go(n) {
        if (n < 0 || n >= questions.length) return;
        setDrawer(false, false);
        index = n;
        save();
        render();
        // Once a mobile question is selected, reveal the question instead of
        // leaving the viewport at the old navigator position.
        if (mobileQuery.matches) {
            window.scrollTo(0, 0);
            requestAnimationFrame(() => window.scrollTo(0, 0));
        } else {
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    }

    function render() {
        document.querySelectorAll('.practice-select.is-open').forEach(p => p._closeMenu?.(true));
        selectListeners.abort();
        selectListeners = new AbortController();
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
        renderAnswer(q, area, {saved, update, render, selectListeners, matchingOrders});
        back.disabled = index === 0;
        next.hidden = index === questions.length - 1;
        // Students can submit the practice at any point, even with unanswered items.
        finish.hidden = false;
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
                const b = button(String(n + 1), 'practice-number', () => go(n));
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
        if (drawerOpen && mobileQuery.matches && e.key === 'Tab') {
            const focusable = [...drawer.querySelectorAll('button:not(:disabled)')];
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {e.preventDefault(); last.focus();}
            else if (!e.shiftKey && document.activeElement === last) {e.preventDefault(); first.focus();}
        }
    };
    window.__practiceKeyController?.abort();
    const controller = new AbortController();
    window.__practiceKeyController = controller;
    document.addEventListener('keydown', onKey, {signal: controller.signal});
    mobileQuery.addEventListener('change', () => {
        if (drawerOpen) setDrawer(false);
    }, {signal: controller.signal});
    save();
    render();
}
