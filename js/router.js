import { app } from './state.js';
import { load, DataLoadError } from './data-service.js';
import { el, append, link, header, notReady } from './utils/dom.js';
import { home } from './pages/home.js';
import { modulesPage } from './pages/modules.js';
import { modulePage } from './pages/module.js';
import { theory } from './pages/theory.js';
import { practice, practiceResults } from './pages/practice.js';
import { cases } from './pages/cases.js';

let navigationId = 0;

export async function route() {
    const currentNavigation = ++navigationId;
    const isCurrent = () => currentNavigation === navigationId;
    const hash = location.hash;

    app.replaceChildren();

    try {
        // Read the URL before the first await so navigation stays consistent.
        const parts = decodeURIComponent(hash.replace(/^#\/?/, '')).split('/').filter(Boolean);
        const modules = await load('data/modules.json');
        if (!isCurrent()) return;

        document.body.classList.toggle('home-view', parts.length === 0);

        if (!parts.length) return home(modules);
        if (parts[0] === 'modules') return modulesPage(modules);
        if (parts[0] === 'note') {
            return header(app, 'About the resource', 'Explanatory Note', 'A learning resource for students of teacher training colleges studying English in professional contexts.');
        }
        if (parts[0] === 'guidelines') {
            return header(app, 'For educators', 'Teaching Guidelines', 'Use Theory for familiarization, Practice for self-assessment, and Teaching Cases to discuss teacher–student communication.');
        }
        if (parts[0] !== 'module') throw new Error('Page not found');

        const info = modules.find(module => module.id === parts[1]);
        if (!info) throw new Error('Unknown module');

        let mod;
        try {
            mod = await load(`data/${info.id}.json`);
        } catch (error) {
            if (!isCurrent()) return;
            if (error instanceof DataLoadError && error.status === 404) {
                return notReady(app, info.title);
            }
            throw error;
        }
        if (!isCurrent()) return;

        if (!parts[2]) return modulePage(mod);
        if (parts[2] === 'theory') return theory(mod);
        if (parts[2] === 'practice' && parts[3] === 'results' && parts.length === 4) return practiceResults(mod);
        if (parts[2] === 'practice' && parts.length === 3) return practice(mod);
        if (parts[2] === 'cases') return cases(mod);
        throw new Error('Unknown section');
    } catch (error) {
        if (!isCurrent()) return;
        document.body.classList.toggle('home-view', false);
        append(
            app,
            el('h1', 'Something went wrong'),
            el('p', error.message),
            link('Back to modules', '/modules', 'btn')
        );
        console.error('Navigation failed:', error);
    }
}
