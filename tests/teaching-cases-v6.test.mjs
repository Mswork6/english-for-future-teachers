import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for (const id of ['starting-the-school-day','a-late-pupil']) {
  const c=JSON.parse(readFileSync(new URL(`../data/teaching-case-${id}.json`,import.meta.url)));
  test(`${id}: four steps with branch reactions and transitions`,()=>{
    assert.equal(c.steps.length,4);
    assert.equal(c.steps.at(-1).transition.length,0);
    assert.ok(c.final.length>0);
    c.steps.forEach((s,i)=>{
      assert.ok(s.opening.length>=2);
      assert.equal(s.choices.length,3);
      assert.deepEqual(s.choices.map(c=>c.id),['A','B','C']);
      assert.deepEqual(s.choices.map(c=>c.points).sort(),[0,.5,1]);
      s.choices.forEach(ch=>assert.ok(ch.reaction.length>0));
      if(i<3)assert.ok(s.transition.length>0);
    });
  });
}
