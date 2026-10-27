import {el, append} from '../utils/dom.js';
import {button} from './shared.js';
import {renderMatching} from './matching-select.js';

// The Practice page owns state and navigation; these functions only build answers.
function renderChoice(q, area, {saved, update, render}) {
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
}

function renderFill(q, area, {saved, update, render}) {
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
}

function renderError(q, area, {saved, update, render}) {
    const fragmentSize = q.errorLength || 1;
    area.append(el('p', fragmentSize > 1 ? 'Select the incorrect word or phrase:' : 'Select the incorrect word:', 'muted'));
    const tokens = el('div', null, 'row practice-tokens');
    const words = q.sentence.split(' ');
    if (fragmentSize > 1) {
        // Keep the relevant two-word fragment as one selectable item.
        for (let n = 0; n < words.length;) {
            const size = n === q.errorIndex ? fragmentSize : 1;
            const fragment = words.slice(n, n + size).join(' ');
            const current = n;
            const b = button(fragment, 'icon-btn', () => {
                saved[q.id].word = current;
                update();
                render();
            });
            if (saved[q.id]?.word === current) b.classList.add('is-selected');
            tokens.append(b);
            n += size;
        }
    } else words.forEach((word, n) => {
        const b = button(word, 'icon-btn', () => {
            saved[q.id].word = n;
            update();
            render();
        });
        if (saved[q.id]?.word === n) b.classList.add('is-selected');
        tokens.append(b);
    });
    const correction = el('input', null, 'text-answer');
    correction.placeholder = fragmentSize > 1 ? 'Correct phrase' : 'Correct word';
    correction.value = saved[q.id]?.correction || '';
    correction.oninput = () => {
        saved[q.id].correction = correction.value;
        update();
    };
    append(area, tokens, el('p', 'Type only the correct word or phrase, without punctuation (no full stop, comma, question mark or exclamation mark).', 'muted'), correction);
}

function renderSentence(q, area, {saved, update, render}) {
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

export function renderAnswer(q, area, context) {
    switch (q.type) {
        case 'matching':
            return renderMatching(q, area, context);
        case 'choice':
            return renderChoice(q, area, context);
        case 'fill':
            return renderFill(q, area, context);
        case 'error':
            return renderError(q, area, context);
        case 'sentence':
            return renderSentence(q, area, context);
        default:
            throw new Error(`Unsupported task type: ${q.type}`);
    }
}
