
import {app} from '../state.js';
import {el, append, link} from '../utils/dom.js';

const SECTIONS = [
    {
        title: 'Vocabulary',
        description: 'Learn useful English expressions for classroom communication.',
        route: 'theory',
        icon: 'book-open',
        color: '#5965C9',
        background: '#EDEEFF'
    },
    {
        title: 'Practice',
        description: 'Complete interactive exercises and check your knowledge.',
        route: 'practice',
        icon: 'list-checks',
        color: '#168b99',
        background: '#dff5f7'
    },
    {
        title: 'Teaching Cases',
        description: 'Make teaching decisions in realistic classroom situations.',
        route: 'cases',
        icon: 'messages-square',
        color: '#c7507d',
        background: '#ffebf1'
    }
];

export function modulePage(mod) {
    const page = el('section', null, 'catalog-page');
    page.append(link('← Back to Modules', '/modules', 'page-back'));

    const heading = el('div', null, 'catalog-heading');
    append(heading,
        el('span', 'LEARNING MODULE', 'eyebrow'),
        el('h1', mod.title),
        el('p', 'Study useful expressions, complete practice exercises and explore realistic teaching situations.', 'lead')
    );
    page.append(heading);

    const grid = el('div', null, 'catalog-grid');

    for (const section of SECTIONS) {
        const card = link('', `/module/${mod.id}/${section.route}`, 'catalog-card');

        const iconBox = el('div', null, 'home-icon');
        iconBox.style.backgroundColor = section.background;
        iconBox.style.color = section.color;

        const icon = el('i');
        icon.setAttribute('data-lucide', section.icon);
        iconBox.append(icon);

        const action = el('span', 'Open section →', 'home-link');
        action.style.color = section.color;

        append(card,
            iconBox,
            el('h2', section.title),
            el('p', section.description),
            action
        );

        grid.append(card);
    }

    page.append(grid);
    app.append(page);
    window.lucide?.createIcons();
}
