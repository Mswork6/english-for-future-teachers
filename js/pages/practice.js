import { app } from '../state.js';
import { crumbs, header, el, append, link } from '../utils/dom.js';
import { gradePractice, matchesAcceptedAnswer } from '../practice/grading.js';
import { selectPracticeQuestions } from '../practice/question-bank.js';

const TYPES = {matching:'Matching Pairs',choice:'Multiple Choice',fill:'Fill in the Blanks',error:'Find and Correct the Error',sentence:'Sentence Building'};
const storageKey = mod => `eft:practice:${mod.id}:attempt:v4`;
const resultKey = mod => `eft:practice:${mod.id}:result:v2`;
const recentKey = mod => `eft:practice:${mod.id}:previous-question-ids:v1`;
const empty = q => q.type === 'matching' ? {} : q.type === 'fill' || q.type === 'sentence' ? [] : q.type === 'error' ? {word:null,correction:''} : null;
const answered = (q,a) => q.type === 'matching' ? q.pairs.every((_,i)=>Boolean(a?.[i])) : q.type === 'choice' ? Number.isInteger(a) : q.type === 'fill' ? q.answers.every((_,i)=>Boolean(a?.[i]?.trim())) : q.type === 'error' ? Number.isInteger(a?.word) && Boolean(a?.correction?.trim()) : q.type === 'sentence' ? a?.length === q.words.length : false;
const icon = name => { const i=el('i'); i.setAttribute('data-lucide',name);return i; };
function safeRead(key) { try {return JSON.parse(localStorage.getItem(key));}catch{return null;} }
function persist(key,value) {try{localStorage.setItem(key,JSON.stringify(value));}catch{/* storage may be disabled */}}
function navigate(path) {location.hash='#'+path;}
function button(label, cls, action, type='button') {const b=el('button',label,cls);b.type=type;b.addEventListener('click',action);return b;}

export function practice(mod) {
    const bank = mod.practice || [];
    // Reject stale/incompatible content instead of silently showing a previous bank.
    if(mod.id === 'the-beginning-of-the-lesson') {
        const matching = bank.filter(q => q.type === 'matching');
        const phrases = matching.flatMap(q => q.pairs?.map(pair => pair[0]) || []);
        const actual = new Map();
        for(const q of matching) actual.set(q.category, (actual.get(q.category) || 0) + 1);
        const expected = {Greetings:3,Introductions:1,'Time to Begin':3,Register:2,Late:1};
        const valid = matching.length === 10 && phrases.length === 32 &&
            new Set(phrases).size === 32 &&
            Object.entries(expected).every(([category, count]) => actual.get(category) === count);
        if(!valid) {
            throw new Error('The Matching Pairs question bank is outdated. Please reload the site and check data/module-01-practice.json.');
        }
    }
    const savedDraft = safeRead(storageKey(mod));
    // Validate stored question IDs and payload against the currently loaded bank.
    const bankById = new Map(bank.map(q => [q.id, q]));
    const draftIsCurrent = Array.isArray(savedDraft?.questions) && savedDraft.questions.length === 35 &&
        savedDraft.questions.every(q => bankById.has(q.id) &&
            JSON.stringify(q) === JSON.stringify(bankById.get(q.id)));
    const previous = draftIsCurrent ? savedDraft : null;
    if(savedDraft && !draftIsCurrent) {
        try { localStorage.removeItem(storageKey(mod)); } catch {}
    }
    // A draft is an immutable selection: reloading must restore exactly the same questions.
    const questions = Array.isArray(previous?.questions) && previous.questions.length===35
        ? previous.questions
        : selectPracticeQuestions(bank,{perType:7,previousIds:safeRead(recentKey(mod))||[]});
    document.body.classList.add('practice-view');
    const heading=el('div',null,'practice-page-heading');
    append(heading,link('← Back to Module',`/module/${mod.id}`,'practice-module-back'),el('h1','Practice Test'));
    app.append(heading);
    if(!questions.length){app.append(el('p','No practice questions are available yet.','note'));return;}
    const saved = Object.fromEntries(questions.map(q=>[q.id, previous?.answers?.[q.id] ?? empty(q)]));
    let index = Math.min(Math.max(Number(previous?.index)||0,0),questions.length-1);
    let drawerOpen=false;
    let confirmOpen=false;
    let selectListeners=new AbortController();
    const frame=el('div',null,'practice-shell');
    const main=el('div',null,'practice-main');
    const toolbar=el('div',null,'practice-toolbar');
    const count=el('span',null,'practice-count');
    const progress=el('div',null,'practice-progress');
    const bar=el('div',null,'practice-progress-bar');progress.append(bar);
    const openNav=button('All questions','btn secondary practice-nav-toggle',()=>setDrawer(true));
    const card=el('section',null,'question practice-active-question');
    const back=button('← Previous','btn secondary',()=>go(index-1));
    const next=button('Next →','btn',()=>go(index+1));
    const finish=button('Finish Practice','btn',()=>showConfirm());
    const controls=el('div',null,'practice-controls');append(controls,back,next,finish);
    const drawer=el('aside',null,'practice-drawer');drawer.setAttribute('aria-label','Question navigator');
    const drawerHeading=el('div',null,'practice-drawer-heading');
    const closeNav=button('×','practice-close',()=>setDrawer(false));closeNav.setAttribute('aria-label','Close navigator');
    append(drawerHeading,el('h2','Question Navigator'),closeNav);
    const groups=el('div',null,'practice-groups');
    const drawerSummary=el('p',null,'practice-summary');
    append(drawer,drawerHeading,groups,drawerSummary,button('Finish Practice','btn practice-finish',()=>{setDrawer(false);showConfirm();}));
    const dialog=el('div',null,'practice-dialog');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Finish practice confirmation');
    const modalOverlay=el('div',null,'practice-modal-overlay');
    modalOverlay.onclick=()=>hideConfirm();
    append(toolbar,count,openNav);
    append(main,toolbar,progress,card,controls);
    append(frame,main,drawer);
    app.append(frame);
    // Mount the modal at document level so its fixed backdrop covers the entire viewport.
    document.body.append(modalOverlay, dialog);
    const cleanupModal=()=>{modalOverlay.remove();dialog.remove();};
    window.addEventListener('hashchange',cleanupModal,{once:true});

    function save(){persist(storageKey(mod),{index,answers:saved,questions});}
    function setDrawer(open){
        drawerOpen=open;
        drawer.classList.toggle('is-open',open);
        frame.classList.toggle('navigator-open',open);
        openNav.setAttribute('aria-expanded',String(open));
        if(open)closeNav.focus();
    }
    function hideConfirm(){confirmOpen=false;dialog.classList.remove('is-open');modalOverlay.classList.remove('is-open');}
    function showConfirm(){
        setDrawer(false);confirmOpen=true;
        const missing=questions.filter(q=>!answered(q,saved[q.id])).length;
        dialog.replaceChildren();
        append(dialog,el('h2','Finish Practice?'),el('p',missing?`${missing} question(s) are not fully answered. You can return to them or submit anyway.`:'Your answers will be checked now. You will see the results on a separate page.'));
        const buttons=el('div',null,'practice-modal-actions');
        append(buttons,button('Keep working','btn secondary',hideConfirm),button('Submit answers','btn',()=>{
            const grading=gradePractice(questions,saved);
            persist(resultKey(mod),{grading,answers:saved,submittedAt:Date.now(),questionIds:questions.map(q=>q.id),questions});
            persist(recentKey(mod),questions.map(q=>q.id));
            try{localStorage.removeItem(storageKey(mod));}catch{}
            hideConfirm();
            navigate(`/module/${mod.id}/practice/results`);
        }));dialog.append(buttons);
        dialog.classList.add('is-open');modalOverlay.classList.add('is-open');buttons.querySelector('button').focus();
    }
    function go(n){if(n<0||n>=questions.length)return;index=n;save();render();window.scrollTo({top:0,behavior:'smooth'});}
    function render(){
        document.querySelectorAll('.practice-select.is-open').forEach(p=>p._closeMenu?.());
        selectListeners.abort();selectListeners=new AbortController();
        const q=questions[index];card.replaceChildren();
        count.textContent=`Question ${index+1} of ${questions.length}`;
        bar.style.width=`${(index+1)/questions.length*100}%`;
        append(card,el('div',`Task ${index+1} · ${TYPES[q.type]||q.type}`,'label'),el('h3',q.prompt));
        const area=el('div',null,'practice-answer-area');card.append(area);
        const update=()=>{save();renderGroups();};
        if(q.type==='matching'){
            const options=q.pairs.map(p=>p[1]).reverse();
            q.pairs.forEach(([source],n)=>{
                const wrap=el('div',null,'practice-match-row');
                wrap.append(el('span',source));
                const picker=el('div',null,'practice-select');
                const trigger=button('', 'practice-select-trigger',()=>toggle());
                trigger.setAttribute('aria-haspopup','listbox');
                trigger.setAttribute('aria-expanded','false');
                trigger.setAttribute('aria-label',`Select translation for ${source}`);
                const label=el('span',saved[q.id]?.[n]||'Select translation');
                const arrow=el('span',null,'practice-select-chevron');
                arrow.setAttribute('aria-hidden','true');
                trigger.append(label,arrow);
                const list=el('div',null,'practice-select-menu');
                list.setAttribute('role','listbox');
                list.setAttribute('aria-label',`Translations for ${source}`);
                const entries=[];
                // Place the options outside the document flow to avoid extending
                // the page/footer. The menu is returned to its picker on close.
                const close=()=>{
                    picker.classList.remove('is-open');
                    trigger.setAttribute('aria-expanded','false');
                    if(list.parentElement!==picker)picker.append(list);
                    list.removeAttribute('style');
                };
                picker._closeMenu=close;
                const positionMenu=()=>{
                    if(!picker.classList.contains('is-open'))return;
                    const rect=trigger.getBoundingClientRect();
                    const gap=6, edge=8;
                    const below=Math.max(0,window.innerHeight-rect.bottom-gap-edge);
                    const above=Math.max(0,rect.top-gap-edge);
                    const upwards=below<230 && above>below;
                    const space=upwards?above:below;
                    const height=Math.max(0,Math.min(230,space));
                    const left=Math.max(edge,Math.min(rect.left,window.innerWidth-edge-Math.min(rect.width,window.innerWidth-2*edge)));
                    list.style.position='fixed';
                    list.style.zIndex='1000';
                    list.style.left=`${left}px`;
                    list.style.width=`${Math.min(rect.width,window.innerWidth-2*edge)}px`;
                    list.style.maxHeight=`${height}px`;
                    list.style.top=upwards?`${Math.max(edge,rect.top-gap-height)}px`:`${rect.bottom+gap}px`;
                    list.style.bottom='auto';
                    list.style.overflowY='auto';
                    list.style.display='grid';
                    list.style.boxSizing='border-box';
                };
                window.addEventListener('resize',positionMenu,{signal:selectListeners.signal});
                // Capture scroll from nested scroll containers as well.
                window.addEventListener('scroll',positionMenu,{signal:selectListeners.signal,capture:true});
                const choose=value=>{
                    saved[q.id][n]=value;
                    label.textContent=value||'Select translation';
                    update();close();trigger.focus();
                };
                const allOptions=['',...options];
                allOptions.forEach((value,i)=>{
                    const opt=button(value||'Select translation','practice-select-option',()=>choose(value));
                    opt.setAttribute('role','option');
                    opt.setAttribute('aria-selected',String((saved[q.id]?.[n]||'')===value));
                    opt.dataset.optionIndex=String(i);
                    entries.push(opt);list.append(opt);
                });
                function toggle(){
                    const opening=!picker.classList.contains('is-open');
                    document.querySelectorAll('.practice-select.is-open').forEach(x=>x._closeMenu?.());
                    if(opening){
                        picker.classList.add('is-open');
                        trigger.setAttribute('aria-expanded','true');
                        document.body.append(list);
                        positionMenu();
                    }
                }
                trigger.addEventListener('keydown',e=>{
                    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
                        e.preventDefault();if(!picker.classList.contains('is-open'))toggle();
                        const selected=allOptions.indexOf(saved[q.id]?.[n]||'');
                        entries[Math.max(0,Math.min(entries.length-1,selected+(e.key==='ArrowDown'?1:-1)))].focus();
                    }
                });
                list.addEventListener('keydown',e=>{
                    const pos=entries.indexOf(document.activeElement);
                    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();trigger.focus();}
                    else if(e.key==='ArrowDown'||e.key==='ArrowUp'){
                        e.preventDefault();entries[(pos+(e.key==='ArrowDown'?1:-1)+entries.length)%entries.length].focus();
                    }else if(e.key==='Home'||e.key==='End'){
                        e.preventDefault();entries[e.key==='Home'?0:entries.length-1].focus();
                    }else if(e.key==='Tab')close();
                });
                document.addEventListener('pointerdown',e=>{
                    if(!picker.contains(e.target)&&!list.contains(e.target))close();
                },{signal:selectListeners.signal});
                picker.append(trigger,list);wrap.append(picker);area.append(wrap);
            });
        }else if(q.type==='choice'){
            q.options.forEach((opt,n)=>{
                const label=el('label',null,'choice');const radio=el('input');radio.type='radio';radio.name=q.id;radio.value=String(n);radio.checked=saved[q.id]===n;
                radio.onchange=()=>{saved[q.id]=n;update();};append(label,radio,el('span',opt));area.append(label);
            });
        }else if(q.type==='fill'){
            q.answers.forEach((_,n)=>{const input=el('input',null,'text-answer');input.type='text';input.placeholder=`Blank ${n+1}`;input.value=saved[q.id]?.[n]||'';input.oninput=()=>{saved[q.id][n]=input.value;update();};area.append(input);});
        }else if(q.type==='error'){
            const fragmentSize=q.errorLength||1;
            area.append(el('p',fragmentSize>1?'Select the incorrect word or phrase:':'Select the incorrect word:','muted'));
            const tokens=el('div',null,'row practice-tokens');
            const words=q.sentence.split(' ');
            if(fragmentSize>1){
                // Keep the relevant two-word fragment as one selectable item.
                for(let n=0;n<words.length;){
                    const size=n===q.errorIndex?fragmentSize:1;
                    const fragment=words.slice(n,n+size).join(' ');
                    const current=n;
                    const b=button(fragment,'icon-btn',()=>{saved[q.id].word=current;update();render();});
                    if(saved[q.id]?.word===current)b.classList.add('is-selected');
                    tokens.append(b);n+=size;
                }
            }else words.forEach((word,n)=>{
                const b=button(word,'icon-btn',()=>{saved[q.id].word=n;update();render();});
                if(saved[q.id]?.word===n)b.classList.add('is-selected');
                tokens.append(b);
            });
            const correction=el('input',null,'text-answer');correction.placeholder=fragmentSize>1?'Correct phrase':'Correct word';correction.value=saved[q.id]?.correction||'';correction.oninput=()=>{saved[q.id].correction=correction.value;update();};
            append(area,tokens,el('p','Type only the correct word or phrase, without punctuation (no full stop, comma, question mark or exclamation mark).','muted'),correction);
        }else if(q.type==='sentence'){
            const pool=el('div',null,'row practice-tokens'),selection=el('div',null,'row practice-tokens');
            const draw=()=>{pool.replaceChildren();selection.replaceChildren();q.words.forEach((w,n)=>{if(saved[q.id].includes(n))return;pool.append(button(w,'icon-btn',()=>{saved[q.id].push(n);update();draw();}));});saved[q.id].forEach(n=>selection.append(button(q.words[n],'icon-btn is-selected',()=>{saved[q.id]=saved[q.id].filter(x=>x!==n);update();draw();})));};
            append(area,el('p','Click words in the correct order. Click a selected word to undo.','muted'),el('div','Available words:','label'),pool,el('div','Your sentence:','label'),selection);draw();
        }
        back.disabled=index===0;next.hidden=index===questions.length-1;finish.hidden=index!==questions.length-1;
        renderGroups();window.lucide?.createIcons();
    }
    function renderGroups(){
        groups.replaceChildren();const segments=[];
        questions.forEach((q,n)=>{let segment=segments.find(s=>s.type===q.type);if(!segment){segment={type:q.type,items:[]};segments.push(segment);}segment.items.push({q,n});});
        segments.forEach(s=>{const section=el('section',null,'practice-nav-section');section.append(el('h3',TYPES[s.type]||s.type));const grid=el('div',null,'practice-number-grid');
            s.items.forEach(({q,n})=>{const b=button(String(n+1),'practice-number',()=>go(n));if(n===index){b.classList.add('is-current');b.setAttribute('aria-current','step');}if(answered(q,saved[q.id]))b.classList.add('is-answered');b.setAttribute('aria-label',`Question ${n+1}${answered(q,saved[q.id])?', answered':''}`);grid.append(b);});section.append(grid);groups.append(section);});
        const done=questions.filter(q=>answered(q,saved[q.id])).length;drawerSummary.textContent=`${done} of ${questions.length} answered`;
    }
    const onKey=e=>{if(e.key==='Escape'){if(confirmOpen)hideConfirm();else if(drawerOpen)setDrawer(false);}};
    // Remove the previous page's listener when navigating back to Practice.
    window.__practiceKeyController?.abort();
    const controller=new AbortController();window.__practiceKeyController=controller;
    document.addEventListener('keydown',onKey,{signal:controller.signal});
    save();render();
}

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
export function practiceReview(mod) {
    const data=safeRead(resultKey(mod));
    const questions=Array.isArray(data?.questions)?data.questions:[];
    crumbs(app,mod,'Review Answers');
    header(app,'Practice','Review Answers','Review all submitted answers, including correct, incorrect and partially correct tasks.');
    const actions=el('div',null,'practice-review-links');
    append(actions,link('← Back to Results',`/module/${mod.id}/practice/results`,'btn secondary'),link('Return to Module',`/module/${mod.id}`,'btn secondary'));
    app.append(actions);
    if(!data?.grading?.results || questions.length!==35){
        app.append(el('p','No completed attempt is available for review.','note'));
        return;
    }
    // A completed attempt contains a snapshot of its questions.
    // Use the current bank only to enrich explanation text, never to change
    // the original question, answer, option order, or score.
    const choiceExplanations = new Map(
        (mod.practice || [])
            .filter(q => q.type === 'choice' && typeof q.explanation === 'string')
            .map(q => [q.id, q.explanation])
    );
    const reviewed=questions.map((q,index)=>({q,index,points:data.grading.results[index]?.points??0,answer:data.answers?.[q.id]}));
    const correct=reviewed.filter(item=>item.points>=1-1e-9).length;
    const partial=reviewed.filter(item=>item.points>1e-9 && item.points<1-1e-9).length;
    const incorrect=reviewed.length-correct-partial;
    const count=el('p',`${correct} correct · ${partial} partially correct · ${incorrect} incorrect or unanswered. ${reviewed.length} tasks in total.`,'practice-review-count');
    app.append(count);
    const list=el('div',null,'practice-review-list');app.append(list);
    const normalize=v=>String(v??'').trim().toLowerCase();
    const field=(parent,label,value,kind='')=>{
        const item=el('div',null,`practice-review-field ${kind}`);
        append(item,el('span',label,'practice-review-label'),el('div',value||'Not answered','practice-review-value'));
        parent.append(item);
    };
    for(const {q,index,points,answer} of reviewed){
        const card=el('article',null,'panel practice-review-card');
        append(card,el('div',`Question ${index+1} · ${TYPES[q.type]||q.type} · ${Number(points.toFixed(2))} / 1 point`,'label'),el('p',q.prompt,'practice-review-prompt'));
        const answerBody=card; // Existing answer comparison remains visible.
        if(q.type==='matching'){
            for(const [i,[english,russian]] of q.pairs.entries()){
                const part=el('div',null,'practice-review-part');
                part.append(el('div',english,'practice-review-context'));
                field(part,'Your answer',answer?.[i]||'',normalize(answer?.[i])===normalize(russian)?'is-correct':'is-incorrect');
                if(normalize(answer?.[i])!==normalize(russian))field(part,'Correct answer',russian,'is-correct');
                answerBody.append(part);
            }
        }else if(q.type==='choice'){
            const chosen=Number.isInteger(answer)?q.options[answer]:null;
            field(answerBody,'Your answer',chosen||'',answer===q.answer?'is-correct':'is-incorrect');
            field(answerBody,'Correct answer',q.options[q.answer],'is-correct');
            // Only the original multiple-choice options are collapsible; the answer comparison stays visible.
            const choices=el('details',null,'practice-review-options');
            const optionsToggle=el('summary','Show all options','practice-review-options-toggle');
            choices.append(optionsToggle);
            const optionsBody=el('div',null,'practice-review-options-body');
            q.options.forEach((option,optionIndex)=>{
                const optionRow=el('div',null,'practice-review-option');
                optionRow.append(el('span',`${String.fromCharCode(65+optionIndex)}. ${option}`));
                const marks=el('span',null,'practice-review-option-marks');
                if(optionIndex===answer)marks.append(el('span','Your choice','practice-review-option-mark is-student'));
                if(optionIndex===q.answer)marks.append(el('span','Correct','practice-review-option-mark is-key'));
                optionRow.append(marks);optionsBody.append(optionRow);
            });
            choices.append(optionsBody);
            choices.addEventListener('toggle',()=>{optionsToggle.textContent=choices.open?'Hide all options':'Show all options';});
            card.append(choices);
        }else if(q.type==='fill'){
            if(q.sentence)answerBody.append(el('p',q.sentence,'practice-review-context'));
            q.answers.forEach((expected,i)=>{
                const part=el('div',null,'practice-review-part');
                part.append(el('div',`Blank ${i+1}`,'practice-review-context'));
                const accepted=Array.isArray(expected)?expected:[expected];
                const ok=matchesAcceptedAnswer(answer?.[i],expected);
                field(part,'Your answer',answer?.[i]||'',ok?'is-correct':'is-incorrect');
                if(!ok)field(part,accepted.length>1?'Accepted answers':'Correct answer',accepted.join(' / '),'is-correct');
                answerBody.append(part);
            });
        }else if(q.type==='error'){
            answerBody.append(el('p',q.sentence,'practice-review-context'));
            const words=q.sentence.split(' ');
            const expected=words.slice(q.errorIndex,q.errorIndex+(q.errorLength||1)).join(' ');
            const picked=Number.isInteger(answer?.word)?words.slice(answer.word,answer.word+(answer.word===q.errorIndex?(q.errorLength||1):1)).join(' '):'';
            const wordCorrect=answer?.word===q.errorIndex;
            field(answerBody,'Selected incorrect fragment',picked,wordCorrect?'is-correct':'is-incorrect');
            if(!wordCorrect)field(answerBody,'Correct fragment',expected,'is-correct');
            const correctionCorrect=normalize(answer?.correction)===normalize(q.correctWord);
            field(answerBody,'Your correction',answer?.correction||'',correctionCorrect?'is-correct':'is-incorrect');
            if(!correctionCorrect)field(answerBody,'Correct replacement',q.correctWord,'is-correct');
        }else if(q.type==='sentence'){
            const submitted=Array.isArray(answer)?answer.map(i=>q.words[i]||'').join(' '):'';
            field(answerBody,'Your sentence',submitted,points>=1-1e-9?'is-correct':'is-incorrect');
            field(answerBody,'Correct sentence',q.answer.join(' '),'is-correct');
        }
        // Explanations are shown only for Multiple Choice.
        // Updated content is available even for previously completed attempts.
        if(q.type==='choice'){
            const explanation=choiceExplanations.get(q.id) || q.explanation;
            if(explanation){
                const details=el('div',null,'practice-review-explanation');
                append(details,el('strong','Explanation'),el('p',explanation));
                answerBody.append(details);
            }
        }
        list.append(card);
    }
}
