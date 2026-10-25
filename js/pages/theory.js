import { app } from '../state.js';
import { crumbs, header, demo, el, append } from '../utils/dom.js';

export function theory(mod) {
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
