import { app } from './state.js';
import { load } from './data-service.js';
import { el, append, link, header, notReady } from './utils/dom.js';
import { home } from './pages/home.js';
import { modulesPage } from './pages/modules.js';
import { modulePage } from './pages/module.js';
import { theory } from './pages/theory.js';
import { practice } from './pages/practice.js';
import { cases } from './pages/cases.js';

export async function route() {
    app.replaceChildren();
    try {
        const modules = await load('data/modules.json');
        const parts = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('/').filter(Boolean);
        document.body.classList.toggle('home-view', !parts.length);
        if (!parts.length) return home(modules);
        if (parts[0] === 'modules') {
            return modulesPage(modules);
        }
        if (parts[0] === 'note') return header(app, 'About the resource', 'Explanatory Note', 'A learning resource for students of teacher training colleges studying English in professional contexts.');
        if (parts[0] === 'guidelines') return header(app, 'For educators', 'Teaching Guidelines', 'Use Theory for familiarization, Practice for self-assessment, and Teaching Cases to discuss teacher–student communication.');
        if (parts[0] !== 'module') throw Error('Page not found');
        const info = modules.find(m => m.id === parts[1]);
        if (!info) throw Error('Unknown module');
        let mod;
        try {
            mod = await load(`data/${info.id}.json`)
        } catch {
            return notReady(app, info.title)
        }
        if (!parts[2]) return modulePage(mod);
        if (parts[2] === 'theory') return theory(mod);
        if (parts[2] === 'practice') return practice(mod);
        if (parts[2] === 'cases') return cases(mod);
        throw Error('Unknown section')
    } catch (err) {
        append(app, el('h1', 'Something went wrong'), el('p', err.message), link('Back to modules', '/modules', 'btn'))
    }
}
