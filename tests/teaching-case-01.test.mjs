import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../data/teaching-case-01.json',import.meta.url)));
test('four complete steps',()=>{assert.equal(data.steps.length,4); for(const s of data.steps){assert.equal(s.choices.length,3);assert.ok(s.context && s.question && s.incoming && s.after);assert.deepEqual([...s.choices.map(x=>x.points)].sort(),[0,.5,1]);}});
test('correct choices and scores from script',()=>{assert.deepEqual(data.steps.map(s=>s.choices.find(c=>c.points===1).id),['A','A','B','B']);assert.equal(data.steps.reduce((n,s)=>n+Math.max(...s.choices.map(c=>c.points)),0),4);});
test('every alternative has a pedagogical explanation',()=>{assert.equal(data.steps.flatMap(s=>s.choices).filter(x=>x.feedback.length>20).length,12);});
