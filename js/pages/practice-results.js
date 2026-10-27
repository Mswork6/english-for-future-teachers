import { app } from '../state.js';
import { crumbs, header, el, append, link } from '../utils/dom.js';
import { TYPES, storageKey, resultKey, safeRead, navigate, button } from '../practice/shared.js';

export function practiceResults(mod){
    crumbs(app,mod,'Practice Results');
    const data=safeRead(resultKey(mod));
    header(app,'Practice','Practice Results','Your final score for the completed attempt.');
    const resultQuestions=Array.isArray(data?.questions)?data.questions:[];
    if(!data?.grading || resultQuestions.length!==35){
        append(app,el('p','There are no results for a completed attempt yet.','note'),link('Go to Practice',`/module/${mod.id}/practice`,'btn'));return;
    }
    const {grading}=data;const panel=el('section',null,'panel practice-results');
    append(panel,el('div',`${Number(grading.total.toFixed(2))} / ${grading.maximum}`,'practice-results-score'),el('div',`${grading.percentage}%`,'practice-results-percent'),el('p','Your final score','muted'));
    const byType=el('div',null,'practice-result-breakdown');
    const groups=[];resultQuestions.forEach((q,n)=>{let item=groups.find(x=>x.type===q.type);if(!item){item={type:q.type,score:0,count:0};groups.push(item);}item.score+=grading.results[n]?.points||0;item.count++;});
    groups.forEach(item=>{const row=el('div',null,'practice-result-row');append(row,el('span',TYPES[item.type]||item.type),el('strong',`${Number(item.score.toFixed(2))} / ${item.count}`));byType.append(row);});
    panel.append(byType);const actions=el('div',null,'practice-result-actions');actions.append(link('Return to Module',`/module/${mod.id}`,'btn'));
    actions.append(link('Review Answers',`/module/${mod.id}/practice/review`,'btn secondary'));
    actions.append(button('Try Again','btn secondary',()=>{try{localStorage.removeItem(storageKey(mod));localStorage.removeItem(resultKey(mod));}catch{}navigate(`/module/${mod.id}/practice`);}));
    panel.append(actions);app.append(panel);
}


// Read-only review of the submitted attempt. All keys come from the approved module data.
