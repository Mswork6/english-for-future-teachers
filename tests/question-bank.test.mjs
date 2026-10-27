import test from 'node:test';
import assert from 'node:assert/strict';
import {selectPracticeQuestions, TYPE_ORDER} from '../js/practice/question-bank.js';

const bank = TYPE_ORDER.flatMap(type => Array.from({length: 14}, (_, i) => ({
    id: `${type}-${i}`,
    type,
    ...(type === 'matching' ? {pairs: [[`phrase-${i}`, `translation-${i}`]]} : {})
})));
test('selects exactly 7 unique questions per type', () => {
    const selected = selectPracticeQuestions(bank);
    assert.equal(selected.length, 35);
    assert.equal(new Set(selected.map(q => q.id)).size, 35);
    for (const type of TYPE_ORDER) assert.equal(selected.filter(q => q.type === type).length, 7);
});
test('avoids all previous questions if seven fresh remain', () => {
    const first = selectPracticeQuestions(bank);
    const next = selectPracticeQuestions(bank, {previousIds: first.map(q => q.id)});
    assert.equal(first.filter(q => next.some(x => x.id === q.id)).length, 0);
});
test('falls back to repeats when pool is too small', () => {
    const first = selectPracticeQuestions(bank);
    const next = selectPracticeQuestions(bank, {previousIds: bank.filter(x => x.type === 'matching').slice(0, 12).map(q => q.id)});
    assert.equal(next.length, 35);
});
test('rejects an undersized bank', () => {
    assert.throws(() => selectPracticeQuestions(bank.slice(0, -8)), /Not enough sentence/);
});


test('supports a second module with independent Matching Pairs categories', () => {
    const second = bank.filter(q => q.type !== 'matching');
    for (let i = 0; i < 9; i++) second.push({
        id: `new-match-${i}`, type: 'matching',
        category: i < 5 ? 'Instructions' : 'Feedback',
        pairs: [[`phrase ${i}`, `translation ${i}`]]
    });
    const matchingQuotas = {Instructions: 4, Feedback: 3};
    const selected = selectPracticeQuestions(second, {matchingQuotas});
    assert.equal(selected.length, 35);
    assert.equal(selected.filter(q => q.type === 'matching' && q.category === 'Instructions').length, 4);
    assert.equal(selected.filter(q => q.type === 'matching' && q.category === 'Feedback').length, 3);
});

test('samples matching without category configuration', () => {
    const second = bank.filter(q => q.type !== 'matching');
    for (let i = 0; i < 9; i++) second.push({id: `match-${i}`, type: 'matching', category: 'Different', pairs: [[`unique ${i}`, `value ${i}`]]});
    const selected = selectPracticeQuestions(second);
    assert.equal(selected.filter(q => q.type === 'matching').length, 7);
});

test('rejects invalid quotas clearly', () => {
    assert.throws(() => selectPracticeQuestions(bank, {matchingQuotas: {Other: 6}}), /require exactly 7/);
    assert.throws(() => selectPracticeQuestions(bank, {matchingQuotas: {Other: 7}}), /Not enough questions/);
});
