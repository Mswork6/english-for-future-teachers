import {el} from '../utils/dom.js';

export const TYPES = {
    matching: 'Matching Pairs',
    choice: 'Multiple Choice',
    fill: 'Fill in the Blanks',
    error: 'Find and Correct the Error',
    sentence: 'Sentence Building'
};
export const storageKey = mod => `eft:practice:${mod.id}:attempt:v4`;
export const resultKey = mod => `eft:practice:${mod.id}:result:v2`;
export const recentKey = mod => `eft:practice:${mod.id}:previous-question-ids:v1`;
export const empty = q => q.type === 'matching' ? {} : q.type === 'fill' || q.type === 'sentence' ? [] : q.type === 'error' ? {
    word: null,
    correction: ''
} : null;
export const answered = (q, a) => q.type === 'matching' ? q.pairs.every((_, i) => Boolean(a?.[i])) : q.type === 'choice' ? Number.isInteger(a) : q.type === 'fill' ? q.answers.every((_, i) => Boolean(a?.[i]?.trim())) : q.type === 'error' ? Number.isInteger(a?.word) && Boolean(a?.correction?.trim()) : q.type === 'sentence' ? a?.length === q.words.length : false;
export const icon = name => {
    const i = el('i');
    i.setAttribute('data-lucide', name);
    return i;
};

export function safeRead(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch {
        return null;
    }
}

export function persist(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {/* storage may be disabled */
    }
}

export function navigate(path) {
    location.hash = '#' + path;
}

export function button(label, cls, action, type = 'button') {
    const b = el('button', label, cls);
    b.type = type;
    b.addEventListener('click', action);
    return b;
}
