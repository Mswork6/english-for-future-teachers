import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {selectPracticeQuestions,MATCHING_QUOTAS} from '../js/practice/question-bank.js';
const bank=JSON.parse(fs.readFileSync(new URL('../data/module-01-practice.json',import.meta.url),'utf8'));
const mapping=bank.filter(q=>q.type==='matching');
test('bank contains exactly 10 unique Matching Pairs tasks and 32 nonduplicated expressions',()=>{
 assert.equal(mapping.length,10);
 const all=mapping.flatMap(q=>q.pairs.map(([english])=>english));
 assert.equal(all.length,32);
 assert.equal(new Set(all).size,32);
});
test('every sample preserves five topics and never repeats a matching expression',()=>{
 for(let attempt=0;attempt<1000;attempt++){
  const questions=selectPracticeQuestions(bank);
  assert.equal(questions.length,35);
  assert.equal(new Set(questions.map(q=>q.id)).size,35);
  const matching=questions.filter(q=>q.type==='matching');
  assert.equal(matching.length,7);
  for(const [topic,n] of Object.entries(MATCHING_QUOTAS)){
   assert.equal(matching.filter(q=>q.category===topic).length,n);
  }
  const expressions=matching.flatMap(q=>q.pairs.map(([english])=>english));
  assert.equal(new Set(expressions).size,expressions.length);
  for(const type of ['choice','fill','error','sentence']) assert.equal(questions.filter(q=>q.type===type).length,7);
 }
});
test('tries to avoid previous tasks per topic when alternatives exist',()=>{
 const previous=selectPracticeQuestions(bank);
 const next=selectPracticeQuestions(bank,{previousIds:previous.map(q=>q.id)});
 for(const topic of ['Greetings','Time to Begin','Register']){
  const first=previous.filter(q=>q.category===topic && q.type==='matching');
  const second=next.filter(q=>q.category===topic && q.type==='matching');
  const overlap=first.filter(q=>second.some(b=>b.id===q.id)).length;
  assert.ok(overlap<= (topic==='Register'?0:1));
 }
});
