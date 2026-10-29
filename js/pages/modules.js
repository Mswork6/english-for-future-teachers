import {app} from '../state.js';
import {el, append, link} from '../utils/dom.js';

// Module icons intentionally differ from the main-screen section icons.
const ICONS = ['sunrise', 'presentation', 'flag-triangle-right'];

export function modulesPage(modules) {
    const page = el('section', null, 'catalog-page');

    page.append(link('← Back to home page', '/', 'page-back'));

    const heading = el('div', null, 'catalog-heading');
    append(heading,
        el('span', 'LEARNING MODULES', 'eyebrow'),
        el('h1', 'Learning Modules'),
        el('p', 'Choose a module to start learning.', 'lead')
    );
    page.append(heading);

    const grid = el('div', null, 'catalog-grid modules-catalog-grid');
    modules.forEach((module, index) => {
        const card = link('', `/module/${module.id}`, 'catalog-card modules-catalog-card');
        const top = el('div', null, 'modules-card-top');
        const num = el('span', `MODULE ${String(index + 1).padStart(2, '0')}`, 'modules-card-number');
        const iconBox = el('div', null, 'modules-card-icon');
        const icon = el('i');
        icon.setAttribute('data-lucide', ICONS[index % ICONS.length]);
        iconBox.append(icon);
        append(top, num, iconBox);

        const body = el('div', null, 'modules-card-body');
        append(body, el('h2', module.title), el('p', module.description));
        append(card, top, body, el('span', 'Explore module →', 'modules-card-action'));
        grid.append(card);
    });

    page.append(grid);
    app.append(page);
    window.lucide?.createIcons();
}
