import { app } from '../state.js';
import { crumbs, header, el, append, link } from '../utils/dom.js';

export function modulePage(mod) {
    crumbs(app, mod);

    header(
        app,
        'Learning Module',
        mod.title,
        'Study useful expressions, complete practice exercises and explore realistic teaching situations.'
    );

    const sections = [
        {
            title: 'Theory',
            description: 'Learn useful English expressions for classroom communication.',
            route: 'theory'
        },
        {
            title: 'Practice',
            description: 'Complete interactive exercises and check your knowledge.',
            route: 'practice'
        },
        {
            title: 'Teaching Cases',
            description: 'Make teaching decisions in realistic classroom situations.',
            route: 'cases'
        }
    ];

    const grid = el('div', null, 'grid');

    for (const section of sections) {
        const card = el('article', null, 'card');

        append(
            card,
            el('h2', section.title),
            el('p', section.description),
            link(
                'Open section',
                `/module/${mod.id}/${section.route}`
            )
        );

        grid.append(card);
    }

    app.append(grid);
}
