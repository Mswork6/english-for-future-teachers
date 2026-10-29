import {app} from './state.js';
import {load, DataLoadError} from './data-service.js';
import {loadModule} from './module-loader.js';
import {el, append, link, header, notReady} from './utils/dom.js';
import {home} from './pages/home.js';
import {explanatoryNote} from './pages/note.js';
import {teachingGuidelines} from './pages/guidelines.js';
import {modulesPage} from './pages/modules.js';
import {modulePage} from './pages/module.js';
import {theory} from './pages/theory.js';
import {practice} from './pages/practice.js';
import {practiceResults} from './pages/practice-results.js';
import {practiceReview} from './pages/practice-review.js';
import {cases} from './pages/cases.js';

let navigationId = 0;

export async function route() {
    const currentNavigation = ++navigationId;
    const isCurrent = () => currentNavigation === navigationId;
    const hash = location.hash;

    document.body.classList.remove('practice-view');
    app.replaceChildren();

    try {
        const parts = decodeURIComponent(hash.replace(/^#\/?/, '')).split('/').filter(Boolean);
        const modules = await load('data/modules.json');
        if (!isCurrent()) return;

        document.body.classList.toggle('home-view', parts.length === 0);

        if (!parts.length) return home(modules);
        if (parts[0] === 'modules') return modulesPage(modules);
        if (parts[0] === 'note') return explanatoryNote();
        if (parts[0] === 'guidelines') return teachingGuidelines();
        if (parts[0] !== 'module') throw new Error('Page not found');

        const info = modules.find(module => module.id === parts[1]);
        if (!info) throw new Error('Unknown module');

        let mod;
        try {
            mod = await loadModule(info, {includePractice: parts[2] === 'practice'});
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
        if (parts[2] === 'practice' && parts[3] === 'review' && parts.length === 4) return practiceReview(mod);
        if (parts[2] === 'practice' && parts.length === 3) return practice(mod);
        if (parts[2] === 'cases') return cases(mod, parts[3], parts[4]);
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
