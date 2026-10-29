/** Minimal DOM helpers shared by the site's pages. */
export function el(tag, text, cls) {
    const element = document.createElement(tag);
    if (text != null) element.textContent = text;
    if (cls) element.className = cls;
    return element;
}

export function append(parent, ...children) {
    parent.append(...children);
    return parent;
}

export function link(label, route, cls = '') {
    const anchor = el('a', label, cls);
    anchor.href = '#' + route;
    return anchor;
}

export function header(parent, label, title, description) {
    append(parent,
        el('div', label, 'eyebrow'),
        el('h1', title),
        el('p', description, 'lead')
    );
}

export function crumbs(parent, mod, section) {
    const container = el('div', null, 'breadcrumbs');
    append(container,
        link('Learning Modules', '/modules'),
        el('span', '/'),
        link(mod.title, `/module/${mod.id}`)
    );
    if (section) append(container, el('span', '/'), el('span', section));
    append(parent, container);
}

export function demo(parent) {
    append(parent,
        el('div', 'Demonstration content: the finalized educational materials and complete sets of 35 Practice tasks / 3 Teaching Cases per module will be added later.', 'note')
    );
}

export function notReady(parent, title) {
    header(parent, 'Learning module', title, 'This module is prepared for content entry.');
    append(parent,
        el('p', 'The content JSON for this module has not yet been created.', 'note'),
        link('Back to Modules', '/modules', 'btn')
    );
}
