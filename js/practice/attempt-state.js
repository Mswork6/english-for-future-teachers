import {selectPracticeQuestions} from './question-bank.js';
import {storageKey, resultKey, recentKey, safeRead, persist} from './shared.js';

// Keep the exact questions and answers when resuming a compatible draft.
// The selection snapshot is checked against the current question bank.
export function restoreAttempt(mod, bank) {
    const savedDraft = safeRead(storageKey(mod));
    // Validate stored question IDs and payload against the currently loaded bank.
    const bankById = new Map(bank.map(q => [q.id, q]));
    const draftIsCurrent = Array.isArray(savedDraft?.questions) && savedDraft.questions.length === 35 &&
        savedDraft.questions.every(q => bankById.has(q.id) &&
            JSON.stringify(q) === JSON.stringify(bankById.get(q.id)));
    const previous = draftIsCurrent ? savedDraft : null;
    if (savedDraft && !draftIsCurrent) {
        try {
            localStorage.removeItem(storageKey(mod));
        } catch {
        }
    }
    // A draft is an immutable selection: reloading must restore exactly the same questions.
    const questions = Array.isArray(previous?.questions) && previous.questions.length === 35
        ? previous.questions
        : selectPracticeQuestions(bank, {perType: 7, previousIds: safeRead(recentKey(mod)) || [], matchingQuotas: mod.matchingQuotas});
    return {questions, previous};
}

export function saveDraft(mod, draft) {
    persist(storageKey(mod), draft);
}

export function completeAttempt(mod, result) {
    persist(resultKey(mod), result);
    persist(recentKey(mod), result.questionIds);
    clearDraft(mod);
}

export function clearDraft(mod) {
    try {
        localStorage.removeItem(storageKey(mod));
    } catch { /* Storage may be blocked */
    }
}
