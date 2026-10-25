import test from 'node:test';
import assert from 'node:assert/strict';
import {gradeTask, gradePractice} from '../js/practice/grading.js';

test('matching awards partial points', () => {
    const q = {type: 'matching', pairs: [['a', 'A'], ['b', 'B']]};
    assert.equal(gradeTask(q, {0: 'A', 1: 'X'}), 0.5);
});
test('multiple choice is all or nothing', () => {
    const q = {type: 'choice', answer: 2};
    assert.equal(gradeTask(q, 2), 1);
    assert.equal(gradeTask(q, 1), 0);
});
test('fill supports partial credit and ignores case/outer spaces', () => {
    const q = {type: 'fill', answers: ['book', 'page']};
    assert.equal(gradeTask(q, [' Book ', 'wrong']), 0.5);
});
test('error detection and correction each worth 0.5', () => {
    const q = {type: 'error', errorIndex: 1, correctWord: 'your'};
    assert.equal(gradeTask(q, {word: 1, correction: 'no'}), 0.5);
    assert.equal(gradeTask(q, {word: 0, correction: 'Your'}), 0.5);
});
test('sentence requires the expected order', () => {
    const q = {type: 'sentence', words: ['your', 'Open', 'books'], answer: ['Open', 'your', 'books']};
    assert.equal(gradeTask(q, [1, 0, 2]), 1);
    assert.equal(gradeTask(q, [0, 1, 2]), 0);
});
test('practice totals results and percentage', () => {
    const questions = [{id: 'x', type: 'choice', answer: 0}, {id: 'y', type: 'choice', answer: 1}];
    assert.deepEqual(gradePractice(questions, {x: 0, y: 0}), {
        results: [{id: 'x', points: 1}, {id: 'y', points: 0}],
        total: 1,
        maximum: 2,
        percentage: 50
    });
});
