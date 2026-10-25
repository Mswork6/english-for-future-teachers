import { app } from '../state.js';
import { el, append, link } from '../utils/dom.js';

const ICONS = [
    { name: 'book-open', color: 'blue' },
    { name: 'messages-square', color: 'green' },
    { name: 'graduation-cap', color: 'purple' }
];

function makeIcon(name, color) {
    const wrapper = el('div', null, `home-icon ${color}`);
    const icon = el('i');
    icon.setAttribute('data-lucide', name);
    wrapper.append(icon);
    return wrapper;
}

export function modulesPage(modules) {
    const page = el('section', null, 'catalog-page');
    append(page, link('← Back to main screen', '/', 'page-back'));

    const heading = el('div', null, 'home-heading');
    append(heading,
        el('span', 'CHOOSE YOUR PATH', 'home-badge'),
        el('h1', 'Learning Modules'),
        el('p', 'Choose a module to start learning.')
    );
    page.append(heading);

    const cards = el('div', null, 'home-cards');
    modules.forEach((module, index) => {
        const style = ICONS[index % ICONS.length];
        const card = link('', `/module/${module.id}`, 'home-card catalog-card');
        card.setAttribute('aria-label', `Open ${module.title} module`);
        append(card,
            makeIcon(style.name, style.color),
            el('h2', module.title),
            el('p', module.description),
            el('span', 'Open module →', `home-link ${style.color}-text`)
        );
        cards.append(card);
    });

    page.append(cards);
    app.append(page);
    window.lucide?.createIcons();
}
