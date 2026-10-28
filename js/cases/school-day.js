import {app} from '../state.js';
import {load} from '../data-service.js';
import {crumbs, el, append, link} from '../utils/dom.js';

const BASE = 'assets/teaching-cases/';
const ACTORS = {
    teacher: {name:'You · Teacher', avatar:'teacher.webp'},
    sophie: {name:'Sophie', avatar:'sophie.webp'},
    class: {name:'Class', avatar:'max.webp'}
};

function icon(name) { const i=el('i'); i.dataset.lucide=name; return i; }
function node(tag, className, text) {return el(tag,text,className);}

export async function renderSchoolDay(mod) {
    crumbs(app, mod, 'Teaching Cases');
    const root=node('section','tc-shell');
    root.innerHTML = `<div class="tc-intro"><div><span class="tc-kicker">TEACHING CASE 1 · EASY</span><h1>Starting the School Day</h1><p>4 steps · Maximum score: 4 points</p></div><a class="tc-back" href="#/module/${encodeURIComponent(mod.id)}">Back to module</a></div><div class="tc-stage"><div class="tc-top"><div class="tc-top-line"><div><strong id="tc-step-title">Greeting the Class</strong><span id="tc-step-counter">Step 1 of 4</span></div><div class="tc-bars" id="tc-bars"></div></div><div class="tc-context"><span class="tc-context-icon">ⓘ</span><div><strong>Current situation</strong><p id="tc-context-text"></p></div></div></div><div class="tc-main"><section class="tc-chat" aria-label="Classroom conversation"><div class="tc-chat-head"><span class="tc-online"></span><strong>Classroom conversation</strong><span class="tc-chat-sub">9:00 AM</span></div><div class="tc-messages" id="tc-messages" aria-live="polite"></div><div class="tc-compose">Choose a response to send a message as the teacher</div></section><aside class="tc-decisions"><div class="tc-turn-label">YOUR TURN</div><h2 id="tc-question"></h2><div class="tc-options" id="tc-options" role="group" aria-label="Possible responses"></div><button type="button" class="tc-send" id="tc-send" disabled>Send response →</button><p class="tc-subnote">Scores and explanations appear after all four steps.</p></aside></div></div><div id="tc-results" class="tc-results" hidden></div>`;
    app.append(root);
    let caseData;
    try { caseData = await load('data/teaching-case-01.json'); }
    catch (err) { root.replaceChildren(node('p','tc-error',`Could not load teaching case: ${err.message}`)); return; }
    if (!root.isConnected) return;
    const $ = id => root.querySelector('#'+id);
    let step=0, choice=null, responses=[];
    const messages=$('tc-messages');
    function addMessage(speaker,text) {
        const row=node('div',`tc-message ${speaker==='teacher'?'tc-mine':''} ${speaker==='narrator'?'tc-system':''}`);
        if (speaker==='narrator') {
            row.append(node('span','tc-system-text',text));
        } else {
            const actor=ACTORS[speaker]??ACTORS.class;
            const avatar=el('img',null,'tc-avatar'); avatar.src=BASE+actor.avatar; avatar.alt=actor.name;
            const bubble=node('div','tc-bubble');
            append(bubble,node('strong','tc-sender',actor.name),node('p',null,text));
            append(row,avatar,bubble);
        }
        messages.append(row); messages.scrollTop=messages.scrollHeight;
    }
    function showStep() {
        const data=caseData.steps[step]; choice=null;
        $('tc-step-title').textContent=data.title;
        $('tc-step-counter').textContent=`Step ${step+1} of ${caseData.steps.length}`;
        $('tc-context-text').textContent=data.context;
        $('tc-question').textContent=data.question;
        $('tc-bars').replaceChildren();
        caseData.steps.forEach((_,i)=>$('tc-bars').append(node('span',i<step?'tc-done':i===step?'tc-current':'')));
        $('tc-options').replaceChildren();
        data.choices.forEach((option,i)=>{
            const button=el('button',null,'tc-option');button.type='button'; button.setAttribute('aria-pressed','false');
            append(button,node('span','tc-letter',option.id),node('span','tc-option-text',option.text));
            button.addEventListener('click',()=>{
                choice=i;
                Array.from($('tc-options').children).forEach((item,j)=>{ item.classList.toggle('tc-selected',i===j);item.setAttribute('aria-pressed',String(i===j)); });
                $('tc-send').disabled=false;
            });
            $('tc-options').append(button);
        });
        $('tc-send').disabled=true;
        $('tc-send').textContent=step===caseData.steps.length-1?'Finish case →':'Send response →';
        data.incoming.forEach(message=>addMessage(message.speaker,message.text));
        window.lucide?.createIcons();
    }
    function finish() {
        const total=responses.reduce((sum,r)=>sum+r.points,0);
        const result=$('tc-results');result.replaceChildren();result.hidden=false;
        const heading=node('div','tc-result-heading');
        append(heading,node('span','tc-kicker','CASE COMPLETED'),node('h2',null,'Your teaching decisions'),node('p',null,'Review your responses and the pedagogical reasoning behind each one.'));
        const score=node('div','tc-result-score');append(score,node('span',null,'Total score'),node('strong',null,`${total} / 4`),node('span',null,`${Math.round(total/4*100)}%`));
        const reviews=node('div','tc-reviews');
        responses.forEach((answer,i)=>{
            const card=node('article','tc-review');
            append(card,node('span','tc-review-step',`STEP ${i+1} · ${caseData.steps[i].title}`),node('h3',null,answer.text),node('span','tc-review-score',`${answer.points} / 1 point`),node('p',null,answer.feedback));
            reviews.append(card);
        });
        const restart=node('button','tc-restart','Restart case');restart.type='button';restart.addEventListener('click',()=>{
            step=0; choice=null; responses=[];messages.replaceChildren();$('tc-results').hidden=true;$('tc-stage').hidden=false;showStep();
        });
        append(result,heading,score,reviews,restart);
        $('tc-stage').hidden=true;
        result.scrollIntoView({behavior:'smooth',block:'start'});
    }
    $('tc-send').addEventListener('click',()=>{
        if (choice===null) return;
        const data=caseData.steps[step]; const answer=data.choices[choice];
        responses.push(answer);addMessage('teacher',answer.text);
        data.after.forEach(message=>addMessage(message.speaker,message.text));
        if(step===caseData.steps.length-1)finish();else {step++;showStep();}
    });
    showStep();
}
