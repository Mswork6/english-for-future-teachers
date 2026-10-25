export function el(tag, text, cls) {
    const e = document.createElement(tag);
    if (text != null) e.textContent = text;
    if (cls) e.className = cls;
    return e
}

export function append(parent, ...children) {
    parent.append(...children);
    return parent
}

export function link(label, route, cls = '') {
    const a = el('a', label, cls);
    a.href = '#' + route;
    return a
}

export function header(parent, label, title, description) {
    append(parent, el('div', label, 'eyebrow'), el('h1', title), el('p', description, 'lead'))
}

export function crumbs(parent, mod, section) {
    const c = el('div', null, 'breadcrumbs');
    append(c, link('Learning Modules', '/modules'), el('span', '/'), link(mod.title, `/module/${mod.id}`));
    if (section) append(c, el('span', '/'), el('span', section));
    append(parent, c)
}

export function demo(parent) {
    append(parent, el('div', 'Demonstration content: the finalized educational materials and complete sets of 35 Practice tasks / 3 Teaching Cases per module will be added later.', 'note'))
}

export function notReady(parent, title) {
    header(parent, 'Learning module', title, 'This module is prepared for content entry.');
    append(parent, el('p', 'The content JSON for this module has not yet been created.', 'note'), link('Back to modules', '/modules', 'btn'))
}
