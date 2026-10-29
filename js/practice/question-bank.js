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

function validateQuotas(quotas, perType) {
    if (quotas == null) return null;
    if (typeof quotas !== 'object' || Array.isArray(quotas) || !Object.keys(quotas).length) {
        throw new Error('matchingQuotas must be a non-empty category-to-count object');
    }
    const entries = Object.entries(quotas);
    if (entries.some(([category, count]) => !category.trim() || !Number.isInteger(count) || count < 1)) {
        throw new Error('matchingQuotas values must be positive integers');
    }
    if (entries.reduce((sum, [, count]) => sum + count, 0) !== perType) {
        throw new Error(`Matching quotas require exactly ${perType} tasks`);
    }
    return entries;
}

function assertUniqueMatchingExpressions(questions) {
    const expressions = questions.flatMap(q => q.pairs.map(pair => pair[0]));
    if (new Set(expressions).size !== expressions.length) {
        throw new Error('Matching bank contains repeated expressions');
    }
}

function sampleWithPriority(pool, count, used, random) {
    if (pool.length < count) throw new Error(`Not enough questions: ${pool.length} available, ${count} required`);
    const fresh = shuffleQuestions(pool.filter(q => !used.has(q.id)), random);
    const repeats = shuffleQuestions(pool.filter(q => used.has(q.id)), random);
    return [...fresh, ...repeats].slice(0, count);
}

// Choose as many unused sets as possible while ensuring no phrase appears twice
// in the same practice attempt. Works with banks containing overlapping sets.
function selectNonOverlappingMatching(pool, count, used, random) {
    const candidates = [
        ...shuffleQuestions(pool.filter(q => !used.has(q.id)), random),
        ...shuffleQuestions(pool.filter(q => used.has(q.id)), random)
    ];
    function search(selected, occupied, remaining) {
        if (selected.length === count) return selected;
        if (selected.length + remaining.length < count) return null;
        for (let i = 0; i < remaining.length; i++) {
            const q = remaining[i];
            const phrases = q.pairs.map(pair => pair[0]);
            if (phrases.some(p => occupied.has(p))) continue;
            const next = search([...selected, q], new Set([...occupied, ...phrases]), remaining.slice(i + 1));
            if (next) return next;
        }
        return null;
    }
    const result = search([], new Set(), candidates);
    if (!result) throw new Error(`Cannot select ${count} non-overlapping matching tasks`);
    return result;
}

export function selectPracticeQuestions(bank, {perType = 7, previousIds = [], random = Math.random, matchingQuotas = null} = {}) {
    const used = new Set(previousIds);
    const picked = [];
    for (const type of TYPE_ORDER) {
        const pool = bank.filter(q => q.type === type);
        if (new Set(pool.map(q => q.id)).size !== pool.length) throw new Error(`Duplicate IDs in ${type} bank`);
        if (type === 'matching') {
            const quotas = validateQuotas(matchingQuotas, perType);
            let selection;
            if (quotas) {
                selection = [];
                for (const [category, count] of quotas) {
                    const group = pool.filter(q => q.category === category);
                    selection.push(...sampleWithPriority(group, count, used, random));
                }
                selection = shuffleQuestions(selection, random);
            } else {
                if (pool.length < perType) throw new Error(`Not enough matching questions: ${pool.length} available, ${perType} required`);
                selection = selectNonOverlappingMatching(pool, perType, used, random);
            }
            assertUniqueMatchingExpressions(selection);
            picked.push(...selection);
        } else {
            if (pool.length < perType) throw new Error(`Not enough ${type} questions: ${pool.length} available, ${perType} required`);
            picked.push(...sampleWithPriority(pool, perType, used, random));
        }
    }
    return picked;
}
