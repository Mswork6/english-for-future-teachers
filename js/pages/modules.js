import {app} from '../state.js';
import {el, append, link} from '../utils/dom.js';

const ICONS = [
    {name: 'book-open', color: 'blue'},
    {name: 'messages-square', color: 'green'},
    {name: 'graduation-cap', color: 'purple'}
];

export function modulesPage(modules) {
    const page = el('section', null, 'catalog-page');
    page.append(link('← Back to main screen', '/', 'page-back'));

    const heading = el('div', null, 'catalog-heading');
    append(heading,
        el('span', 'LEARNING MODULES', 'eyebrow'),
        el('h1', 'Learning Modules'),
        el('p', 'Choose a module to start learning.', 'lead')
    );
    page.append(heading);

    const grid = el('div', null, 'catalog-grid');
    modules.forEach((module, index) => {
        const style = ICONS[index % ICONS.length];
        const card = link('', `/module/${module.id}`, 'catalog-card');
        const iconBox = el('div', null, `home-icon ${style.color}`);
        const icon = el('i');
        icon.setAttribute('data-lucide', style.name);
        iconBox.append(icon);
        append(card,
            iconBox,
            el('h2', module.title),
            el('p', module.description),
            el('span', 'Open module →', `home-link ${style.color}-text`)
        );
        grid.append(card);
    });

    page.append(grid);
    app.append(page);
    window.lucide?.createIcons();
}
