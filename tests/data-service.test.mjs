import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { load, DataLoadError } from '../js/data-service.js';

const previousFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = previousFetch; });

test('loads and caches a successful JSON response', async () => {
    let requests = 0;
    globalThis.fetch = async () => { requests++; return { ok: true, status: 200, json: async () => ({ count: 3 }) }; };
    const first = await load('test/success.json');
    const second = await load('test/success.json');
    assert.deepEqual(first, { count: 3 });
    assert.strictEqual(first, second);
    assert.equal(requests, 1);
});

test('shares one fetch between simultaneous requests', async () => {
    let requests = 0;
    globalThis.fetch = async () => { requests++; return { ok: true, status: 200, json: async () => [1, 2] }; };
    const [a, b] = await Promise.all([load('test/concurrent.json'), load('test/concurrent.json')]);
    assert.deepEqual(a, b);
    assert.equal(requests, 1);
});

test('reports HTTP 404 distinctly and permits retries', async () => {
    let requests = 0;
    globalThis.fetch = async () => {
        requests++;
        return requests === 1
            ? { ok: false, status: 404 }
            : { ok: true, status: 200, json: async () => ({ ready: true }) };
    };
    await assert.rejects(load('test/retry404.json'), error => error instanceof DataLoadError && error.status === 404);
    assert.deepEqual(await load('test/retry404.json'), { ready: true });
    assert.equal(requests, 2);
});

test('reports malformed JSON as an error rather than missing content', async () => {
    globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('invalid JSON'); } });
    await assert.rejects(load('test/broken.json'), error => error instanceof DataLoadError && error.status === 200);
});

test('handles network errors with retry capability', async () => {
    let requests = 0;
    globalThis.fetch = async () => {
        requests++;
        if (requests === 1) throw new TypeError('network error');
        return { ok: true, status: 200, json: async () => ({ ok: true }) };
    };
    await assert.rejects(load('test/network.json'), error => error instanceof DataLoadError && error.status === null);
    assert.deepEqual(await load('test/network.json'), { ok: true });
});
