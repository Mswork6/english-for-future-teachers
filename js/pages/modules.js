import { app } from '../state.js';
import { header, el, append, link } from '../utils/dom.js';

export function modulesPage(modules) {
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
