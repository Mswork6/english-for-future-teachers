import { app } from '../state.js';
import { el, append, link } from '../utils/dom.js';

export function theory(mod) {
    const page = el('section', null, 'theory-page');
    const back = link('← Back to module', `/module/${mod.id}`, 'theory-back');
    const top = el('div', null, 'theory-intro');
    append(top,
        el('div', `THEORY · ${mod.title.toUpperCase()}`, 'eyebrow'),
        el('h1', mod.theoryTitle || 'Useful classroom expressions'),
        el('p', 'Learn expressions for greeting students, introducing yourself and starting a lesson. Listen to each phrase and expand a card to see it in context.', 'lead'),
        el('div', `${mod.theory.length} expressions · ${new Set(mod.theory.map(p => p.category)).size} categories`, 'theory-count')
    );
    append(page, back, top);

    let section = null;
    let currentCategory = null;
    let categoryCount = 0;
    for (const [index, phrase] of mod.theory.entries()) {
        if (phrase.category !== currentCategory) {
            currentCategory = phrase.category;
            categoryCount += 1;
            const heading = el('div', null, 'theory-category-heading');
            append(heading, el('span', String(categoryCount).padStart(2, '0'), 'theory-category-number'), el('h2', phrase.category));
            section = el('section', null, 'theory-category');
            append(section, heading);
            page.append(section);
        }
        const card = el('article', null, 'theory-phrase');
        const row = el('div', null, 'theory-phrase-row');
        const number = el('span', String(index + 1).padStart(2, '0'), 'theory-phrase-number');
        const words = el('div', null, 'theory-phrase-words');
        append(words, el('h3', phrase.en), el('p', phrase.ru));
        const buttons = el('div', null, 'theory-phrase-actions');
        const listen = el('button', null, 'theory-listen');
        listen.type = 'button';
        listen.title = 'Listen to the phrase';
        listen.setAttribute('aria-label', `Listen to: ${phrase.en}`);
        listen.textContent = '🔊';
        listen.addEventListener('click', () => {
            if (!('speechSynthesis' in window)) {
                window.alert('Speech synthesis is not supported in this browser.');
                return;
            }
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(phrase.en);
            utterance.lang = 'en-GB';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        });
        const example = el('div', null, 'theory-example');
        example.id = `theory-example-${index + 1}`;
        const exampleInner = el('div', null, 'theory-example-inner');
        const exampleContent = el('div', null, 'theory-example-content');
        append(exampleContent, el('strong', 'Example in Context'), el('p', phrase.example));
        append(exampleInner, exampleContent);
        example.append(exampleInner);
        const toggle = el('button', 'Example ▾', 'theory-toggle');
        toggle.type = 'button';
        toggle.setAttribute('aria-controls', example.id);
        toggle.setAttribute('aria-expanded', 'false');
        toggle.addEventListener('click', () => {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            toggle.textContent = expanded ? 'Example ▾' : 'Hide example ▴';
            card.classList.toggle('expanded', !expanded);
        });
        append(buttons, listen, toggle);
        append(row, number, words, buttons);
        append(card, row, example);
        section.append(card);
    }
    app.append(page);
}
