import test from 'node:test';
import assert from 'node:assert/strict';
import { loadModule } from '../js/module-loader.js';

test('loads a module by its default id-based path', async () => {
    const visited = [];
    const result = await loadModule({ id: 'example' }, {
        loadJson: async path => { visited.push(path); return { id: 'example' }; }
    });
    assert.deepEqual(visited, ['data/example.json']);
    assert.deepEqual(result, { id: 'example' });
});

test('loads optional separate practice bank when requested', async () => {
    const visited = [];
    const info = { id: 'example', contentFile: 'data/unit.json', practiceFile: 'data/tasks.json' };
    const loadJson = async path => { visited.push(path); return path === 'data/tasks.json' ? [{ id: 'q1' }] : { title: 'Unit', theory: [] }; };
    const theory = await loadModule(info, { loadJson });
    assert.deepEqual(visited, ['data/unit.json']);
    assert.equal(theory.practice, undefined);
    const practice = await loadModule(info, { includePractice: true, loadJson });
    assert.deepEqual(visited, ['data/unit.json', 'data/unit.json', 'data/tasks.json']);
    assert.deepEqual(practice.practice, [{ id: 'q1' }]);
});

test('propagates failed loading instead of swallowing errors', async () => {
    await assert.rejects(loadModule({ id: 'missing' }, { loadJson: async () => { throw new Error('Not found'); } }), /Not found/);
});
