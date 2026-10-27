export const TYPE_ORDER = ['matching', 'choice', 'fill', 'error', 'sentence'];

// Fisher–Yates without replacement; pure function so it can be tested separately.
export function shuffleQuestions(items, random = Math.random) {
    const values = [...items];
    for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
}

export const MATCHING_QUOTAS = Object.freeze({
    Greetings: 2,
    Introductions: 1,
    'Time to Begin': 2,
    Register: 1,
    Late: 1
});

function sampleWithPriority(pool, count, used, random) {
    if (pool.length < count) throw new Error(`Not enough questions: ${pool.length} available, ${count} required`);
    const fresh = shuffleQuestions(pool.filter(q => !used.has(q.id)), random);
    const repeats = shuffleQuestions(pool.filter(q => used.has(q.id)), random);
    return [...fresh, ...repeats].slice(0, count);
}

export function selectPracticeQuestions(bank, {perType = 7, previousIds = [], random = Math.random} = {}) {
    const used = new Set(previousIds);
    const picked = [];
    for (const type of TYPE_ORDER) {
        const pool = bank.filter(q => q.type === type);
        if (new Set(pool.map(q => q.id)).size !== pool.length) throw new Error(`Duplicate IDs in ${type} bank`);
        if (type === 'matching' && pool.every(q => typeof q.category === 'string')) {
            const quotaTotal = Object.values(MATCHING_QUOTAS).reduce((sum, n) => sum + n, 0);
            if (perType !== quotaTotal) throw new Error(`Matching quotas require ${quotaTotal} tasks`);
            const selection = [];
            for (const [category, count] of Object.entries(MATCHING_QUOTAS)) {
                const group = pool.filter(q => q.category === category);
                selection.push(...sampleWithPriority(group, count, used, random));
            }
            // Verify that matching expressions do not repeat across selected tasks.
            const expressions = selection.flatMap(q => q.pairs.map(pair => pair[0]));
            if (new Set(expressions).size !== expressions.length) throw new Error('Matching bank contains repeated expressions');
            picked.push(...shuffleQuestions(selection, random));
        } else {
            if (pool.length < perType) throw new Error(`Not enough ${type} questions: ${pool.length} available, ${perType} required`);
            picked.push(...sampleWithPriority(pool, perType, used, random));
        }
    }
    return picked;
}
