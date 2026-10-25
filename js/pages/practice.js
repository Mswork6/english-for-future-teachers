import { app } from '../state.js';
import { crumbs, header, demo, el, append } from '../utils/dom.js';

export function practice(mod) {
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
