import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gradeTask,gradePractice,matchesAcceptedAnswer} from '../js/practice/grading.js';
const qs=JSON.parse(readFileSync(new URL('../data/module-01-practice.json',import.meta.url),'utf8'));
const question=qs.find(q=>q.id==='m01-fill-13');
test('both contraction and expanded version earn full credit',()=>{
  assert.equal(gradeTask(question,["isn't",'today']),1);
  assert.equal(gradeTask(question,['is not','today']),1);
  assert.equal(gradeTask(question,['  IS NOT  ','Today ']),1);
});
test('partial and incorrect responses retain previous scoring',()=>{
  assert.equal(gradeTask(question,['is not','tomorrow']),0.5);
  assert.equal(gradeTask(question,['are','today']),0.5);
  assert.equal(gradeTask(question,['are','tomorrow']),0);
});
test('single-string expected answers still work',()=>{
 const other=qs.find(q=>q.type==='fill'&&q.id!=='m01-fill-13');
 assert.ok(other);
 assert.equal(gradeTask(other,other.answers),1);
});
test('review and grading can use shared comparator',()=>{
 assert.ok(matchesAcceptedAnswer('is not',question.answers[0]));
 assert.ok(matchesAcceptedAnswer("isn't",question.answers[0]));
 assert.equal(matchesAcceptedAnswer('is',question.answers[0]),false);
});
test('all 35 expected question bank counts preserved',()=>{
 assert.equal(qs.length,66);
 for(const type of ['matching','choice','fill','error','sentence'])assert.equal(qs.filter(q=>q.type===type).length,type==='matching'?10:14);
});
