import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { el, append, link, header, crumbs, demo, notReady } from '../js/utils/dom.js';

const originalDocument = globalThis.document;

function element(tagName) {
    return {
        tagName, textContent: '', className: '', href: '', children: [],
        append(...nodes) { this.children.push(...nodes); }
    };
}

before(() => {
    globalThis.document = { createElement: element };
});
after(() => {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
});

test('el creates element with optional text and class', () => {
    assert.deepEqual([el('h2', 'Title', 'heading').tagName, el('p').textContent], ['h2', '']);
    const node = el('h2', 'Title', 'heading');
    assert.equal(node.textContent, 'Title');
    assert.equal(node.className, 'heading');
    assert.equal(el('p', '0').textContent, '0');
});

test('append returns parent and maintains child order', () => {
    const parent = el('section');
    const first = el('p', 'First');
    const second = el('p', 'Second');
    assert.strictEqual(append(parent, first, second), parent);
    assert.deepEqual(parent.children, [first, second]);
});

test('link uses hash routes and CSS class', () => {
    const anchor = link('Open', '/module/example', 'btn');
    assert.equal(anchor.href, '#/module/example');
    assert.equal(anchor.textContent, 'Open');
    assert.equal(anchor.className, 'btn');
});

test('header adds expected elements in order', () => {
    const root = el('main');
    header(root, 'Label', 'Heading', 'Description');
    assert.deepEqual(root.children.map(node => node.tagName), ['div', 'h1', 'p']);
    assert.deepEqual(root.children.map(node => node.textContent), ['Label', 'Heading', 'Description']);
});

test('breadcrumbs render module and optional section', () => {
    const root = el('main');
    crumbs(root, { id: 'test-module', title: 'Test Module' }, 'Practice');
    const nodes = root.children[0].children;
    assert.equal(root.children[0].className, 'breadcrumbs');
    assert.equal(nodes[0].href, '#/modules');
    assert.equal(nodes[2].href, '#/module/test-module');
    assert.equal(nodes[4].textContent, 'Practice');

    const short = el('main');
    crumbs(short, { id: 'test-module', title: 'Test Module' });
    assert.equal(short.children[0].children.length, 3);
});

test('placeholder screens preserve their messages and navigation', () => {
    const root = el('main');
    demo(root);
    assert.match(root.children[0].textContent, /Demonstration content/);

    const other = el('main');
    notReady(other, 'Example');
    assert.equal(other.children[1].textContent, 'Example');
    assert.equal(other.children[4].href, '#/modules');
});
