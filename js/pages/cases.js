import {app} from '../state.js';
import {crumbs, el, append, link} from '../utils/dom.js';
import {renderSchoolDay, renderSchoolDayResults} from '../cases/school-day.js';

const CASES = {
    'the-beginning-of-the-lesson': [
        {id:'starting-the-school-day',title:'Starting the School Day',description:'Greet the pupils, check attendance and begin the lesson.',difficulty:'Easy',steps:4,available:true},
        {id:'a-late-pupil',title:'A Late Pupil',description:'Calmly manage class conversations and a late arrival.',difficulty:'Medium',steps:4,available:true}
    ],
    'during-the-lesson': [
        {id:'managing-a-classroom-activity',title:'Managing a Classroom Activity',description:'Organise reading, turns and classroom participation.',difficulty:'Easy–Medium',steps:6,available:true},
        {id:'helping-a-pupil-learn',title:'Helping a Pupil Learn',description:'Support Anna with instructions, mistakes and feedback.',difficulty:'Medium',steps:6,available:true}
    ]
};

export function cases(mod, caseId, subpage) {
    if (['starting-the-school-day','a-late-pupil','managing-a-classroom-activity','helping-a-pupil-learn'].includes(caseId) && subpage === 'results') {
        return renderSchoolDayResults(mod, caseId);
    }
    if (['starting-the-school-day','a-late-pupil','managing-a-classroom-activity','helping-a-pupil-learn'].includes(caseId) && !subpage) {
        return renderSchoolDay(mod, caseId);
    }

    crumbs(app,mod,'Teaching Cases');
    const page=el('section',null,'tc-catalog');
    const heading=el('div',null,'tc-catalog-heading');
    append(heading,el('span','INTERACTIVE CLASSROOM SCENARIOS','tc-kicker'),el('h1','Teaching Cases'),
        el('p','Choose a classroom situation. Make decisions as the teacher and review your pedagogical feedback at the end.'));
    append(page,link('← Back to module',`/module/${mod.id}`,'tc-back'),heading);
    const grid=el('div',null,'tc-case-grid');
    const entries=CASES[mod.id] ?? Array.from({length:3},(_,i)=>({id:`case-0${i+1}`,title:`Teaching Case ${i+1}`,description:'This scenario will be available soon.',available:false}));
    entries.forEach((item,index)=>{
        const card=el('article',null,`tc-case-card ${item.available?'':'tc-case-disabled'}`);
        append(card,el('span',`CASE ${index+1} · ${item.available?item.difficulty:'COMING SOON'}`,'tc-kicker'),
            el('h2',item.title),el('p',item.description));
        if(item.available){
            append(card,el('span',`${item.steps} steps · ${item.steps} points`,'tc-case-meta'));
            const launch=el('button','Start case →','tc-send');launch.type='button';
            launch.addEventListener('click',()=>{location.hash=`#/module/${mod.id}/cases/${item.id}`;});
            card.append(launch);
        } else append(card,el('span','Not available yet','tc-case-meta'));
        grid.append(card);
    });
    page.append(grid);app.append(page);
}
