import {app} from '../state.js';
import {load} from '../data-service.js';
import {crumbs, el, append, link} from '../utils/dom.js';

const BASE = 'assets/teaching-cases/';
const caseFile = id => `data/teaching-case-${id}.json`;
const resultsKey = id => `efft:case:${id}:latest`;
const resultsRoute = (mod,id) => `#/module/${mod.id}/cases/${id}/results`;
const ACTORS = {
    teacher: {name:'You · Teacher', avatar:'teacher.webp'},
    maria: {name:'Maria', avatar:'maria.webp'},
    anton: {name:'Anton', avatar:'anton.webp'},
    alex: {name:'Alex', avatar:'alex.webp'},
    class: {name:'Class', avatar:'class.webp'},
    anna: {name:'Anna', avatar:'anna.webp'},
    sophie: {name:'Sofia', avatar:'sofia.webp'},
    sofia: {name:'Sofia', avatar:'sofia.webp'},
    some_pupils: {name:'Some pupils', avatar:'class.webp'},
    other_pupils: {name:'Other pupils', avatar:'class.webp'}
};

function icon(name) { const i=el('i'); i.dataset.lucide=name; return i; }
function node(tag, className, text) {return el(tag,text,className);}

export async function renderSchoolDay(mod, caseId, {onBack} = {}) {
    const root=node('section','tc-shell');
    root.innerHTML = `<div class="tc-intro"><div><span class="tc-kicker">TEACHING CASE · <span id="tc-difficulty"></span></span><h1 id="tc-case-title"></h1><p><span id="tc-case-meta"></span></p></div><button type="button" class="tc-back" id="tc-back-cases">← All cases</button></div><div class="tc-stage"><div class="tc-top"><div class="tc-top-line"><div><strong id="tc-step-title">Greeting the Class</strong><span id="tc-step-counter">Step 1 of 4</span></div><div class="tc-bars" id="tc-bars"></div></div><div class="tc-context"><span class="tc-context-icon">ⓘ</span><div><strong>Current situation</strong><div id="tc-context-text"></div></div></div></div><div class="tc-main"><section class="tc-chat" aria-label="Classroom conversation"><div class="tc-chat-head"><span class="tc-online"></span><strong>Classroom conversation</strong><span class="tc-chat-sub">9:00 AM</span></div><div class="tc-messages" id="tc-messages" aria-live="polite"></div><div class="tc-compose">Choose a response to send a message as the teacher</div></section><aside class="tc-decisions"><div class="tc-turn-label">YOUR TURN</div><h2 id="tc-question"></h2><div class="tc-options" id="tc-options" role="group" aria-label="Possible responses"></div><button type="button" class="tc-send" id="tc-send" disabled>Send response →</button><p class="tc-subnote">Scores and explanations appear after completing the case.</p></aside></div></div>`;
    app.append(root);
    root.querySelector('#tc-back-cases').addEventListener('click',()=>{root.remove();if(onBack)onBack();else location.hash=`#/module/${mod.id}/cases`;});
    let caseData;
    try { caseData = await load(caseFile(caseId)); }
    catch (err) { root.replaceChildren(node('p','tc-error',`Could not load teaching case: ${err.message}`)); return; }
    if (!root.isConnected) return;
    const $ = id => root.querySelector('#'+id);
    $('tc-case-title').textContent=caseData.title; root.querySelector('.tc-intro > div > p').title=caseData.scenario || ''; $('tc-case-meta').textContent=`${caseData.steps.length} steps · Maximum score: ${caseData.steps.length} points`; $('tc-difficulty').textContent=caseData.difficulty.toUpperCase();
    // Shuffle original choice indexes once for each step in this attempt.
    // Keep the original answer objects and IDs for reactions and grading.
    const choiceOrders = caseData.steps.map(data => {
        const order = data.choices.map((_, i) => i);
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }
        return order;
    });
    let step=0, choice=null, responses=[], mode='question';
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
        mode='question'; const data=caseData.steps[step]; choice=null;
        $('tc-step-title').textContent=data.title;
        $('tc-step-counter').textContent=`Step ${step+1} of ${caseData.steps.length}`;
        $('tc-context-text').replaceChildren(...data.opening.map(text=>node('p',null,text)));
        root.querySelector('.tc-context strong').textContent='Current situation';
        $('tc-question').textContent=data.question;
        $('tc-bars').replaceChildren();
        caseData.steps.forEach((_,i)=>$('tc-bars').append(node('span',i<step?'tc-done':i===step?'tc-current':'')));
        $('tc-options').replaceChildren();
        choiceOrders[step].forEach((originalIndex, displayIndex)=>{
            const option = data.choices[originalIndex];
            const displayLetter = String.fromCharCode(65 + displayIndex);
            const button=el('button',null,'tc-option');button.type='button'; button.setAttribute('aria-pressed','false');
            append(button,node('span','tc-letter',displayLetter),node('span','tc-option-text',option.text));
            button.addEventListener('click',()=>{
                choice=originalIndex;
                Array.from($('tc-options').children).forEach((item,j)=>{ item.classList.toggle('tc-selected',displayIndex===j);item.setAttribute('aria-pressed',String(displayIndex===j)); });
                $('tc-send').disabled=false;
            });
            $('tc-options').append(button);
        });
        $('tc-send').disabled=true;
        $('tc-send').textContent='Send response →';
        // Display spoken opening lines as chat messages, not as narration.
        // Each step is entered once, so opening messages are not duplicated.
        for (const event of data.openingMessages || []) {
            addMessage(event.speaker, event.text);
        }
        window.lucide?.createIcons();
    }
    function setStoryContext(lines, label='Story continues') {
        const box=$('tc-context-text'); box.replaceChildren(...lines.map(text=>node('p',null,text)));
        root.querySelector('.tc-context strong').textContent=label;
    }
    function finish() {
        if (responses.length !== caseData.steps.length) return;
        try { sessionStorage.setItem(resultsKey(caseId), JSON.stringify(responses.map(a=>a.id))); }
        catch { /* Session storage may be unavailable. */ }
        location.hash=resultsRoute(mod,caseId);
    }
    $('tc-send').addEventListener('click',()=>{
        const send=$('tc-send');
        if (send.disabled) return;
        if (mode==='reaction') {
            send.disabled=true;
            const current=caseData.steps[step];
            if(current.transition.length) {
                current.transition.forEach(text=>addMessage('narrator',text));
                setStoryContext(current.transition, 'Transition');
            } else if(step===caseData.steps.length-1) {
                caseData.final.forEach(text=>addMessage('narrator',text));
                setStoryContext(caseData.final,'Final scene');
            }
            mode='transition';
            send.textContent=step===caseData.steps.length-1?'View results →':'Next step →';
            send.disabled=false;
            return;
        }
        if (mode==='transition') {
            send.disabled=true;
            if(step===caseData.steps.length-1) finish();
            else {step++;showStep();}
            return;
        }
        if (mode!=='question' || choice===null) return;
        const data=caseData.steps[step], answer=data.choices[choice];
        responses.push(answer);addMessage('teacher',answer.text);
        answer.reaction.forEach(event=>addMessage(event.speaker,event.text));
        // Freeze the choice panel until the reaction and shared transition have been read.
        $('tc-options').replaceChildren();
        $('tc-question').textContent='How the class responds';
        setStoryContext(answer.reaction.filter(e=>e.speaker==='narrator').map(e=>e.text).length
            ? answer.reaction.filter(e=>e.speaker==='narrator').map(e=>e.text)
            : ['Read the response in the classroom conversation.'], 'Reaction');
        mode='reaction';send.textContent='Continue story →';send.disabled=false;
    });
    showStep();
}

/** Dedicated results route. No chat or active choice controls are mounted here. */
export async function renderSchoolDayResults(mod, caseId, {onBack} = {}) {
    const root = node('section', 'tc-shell tc-results-page');
    app.append(root);
    let caseData;
    try { caseData = await load(caseFile(caseId)); }
    catch (err) { root.append(node('p', 'tc-error', `Could not load results: ${err.message}`)); return; }
    if (!root.isConnected) return;
    let answerIds;
    try { answerIds = JSON.parse(sessionStorage.getItem(resultsKey(caseId)) || 'null'); }
    catch { answerIds = null; }
    const valid = Array.isArray(answerIds) && answerIds.length === caseData.steps.length &&
        answerIds.every((id,i) => caseData.steps[i].choices.some(c=>c.id===id));
    const heading = node('div','tc-result-heading');
    append(heading,node('span','tc-kicker','TEACHING CASE'),node('h1',null,caseData.title));
    const backButton = node('button','tc-back','← All teaching cases');
    backButton.type='button';
    backButton.addEventListener('click',()=>{location.hash=`#/module/${mod.id}/cases`;});
    if (!valid) {
        append(root,heading,node('p','tc-no-attempt','No completed attempt found. Complete the case to see your results.'),backButton);
        return;
    }
    const responses = answerIds.map((id,i) => caseData.steps[i].choices.find(c=>c.id===id));
    const total = responses.reduce((sum,c)=>sum+c.points,0);
    append(heading,node('span','tc-kicker','CASE COMPLETED'),node('h2',null,'Your teaching decisions'),node('p',null,'Review your responses and the pedagogical reasoning behind each one.'));
    const score=node('div','tc-result-score');
    append(score,node('span',null,'Total score'),node('strong',null,`${total} / ${caseData.steps.length}`),node('span',null,`${Math.round(total/caseData.steps.length*100)}%`));
    const reviews=node('div','tc-reviews');
    responses.forEach((answer,i)=>{
        const card=node('article','tc-review');
        const ideal=caseData.steps[i].choices.find(c=>c.points===1);
        append(card,node('span','tc-review-step',`STEP ${i+1} · ${caseData.steps[i].title}`),
            node('h3',null,answer.text),node('span','tc-review-score',`${answer.points} / 1 point`),
            node('p',null,answer.feedback));
        if(answer.points<1 && ideal) append(card,node('p','tc-ideal-answer',`Best response: ${ideal.text}`));
        reviews.append(card);
    });
    const buttons=node('div','tc-result-actions');
    const restart=node('button','tc-restart','Restart case');
    restart.type='button';
    restart.addEventListener('click',()=>{location.hash=`#/module/${mod.id}/cases/${caseId}`;});
    append(buttons,restart,backButton);
    append(root,heading,score,reviews,buttons);
    root.scrollIntoView({block:'start'});
}
