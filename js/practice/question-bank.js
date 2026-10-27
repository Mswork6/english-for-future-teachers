export const TYPE_ORDER=['matching','choice','fill','error','sentence'];

// Fisher–Yates without replacement; pure function so it can be tested separately.
export function shuffleQuestions(items, random=Math.random) {
    const values=[...items];
    for(let i=values.length-1;i>0;i--){
        const j=Math.floor(random()*(i+1));
        [values[i],values[j]]=[values[j],values[i]];
    }
    return values;
}

export function selectPracticeQuestions(bank,{perType=7,previousIds=[],random=Math.random}={}){
    const used=new Set(previousIds);
    const picked=[];
    for(const type of TYPE_ORDER){
        const pool=bank.filter(q=>q.type===type);
        if(pool.length<perType) throw new Error(`Not enough ${type} questions: ${pool.length} available, ${perType} required`);
        if(new Set(pool.map(q=>q.id)).size!==pool.length)throw new Error(`Duplicate IDs in ${type} bank`);
        const fresh=shuffleQuestions(pool.filter(q=>!used.has(q.id)),random);
        const repeats=shuffleQuestions(pool.filter(q=>used.has(q.id)),random);
        picked.push(...[...fresh,...repeats].slice(0,perType));
    }
    return picked;
}
