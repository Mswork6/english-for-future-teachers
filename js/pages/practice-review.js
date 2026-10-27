import {app} from '../state.js';
import {crumbs, header, el, append, link} from '../utils/dom.js';
import {matchesAcceptedAnswer} from '../practice/grading.js';
import {TYPES, resultKey, safeRead} from '../practice/shared.js';

export function practiceReview(mod) {
    const data = safeRead(resultKey(mod));
    const questions = Array.isArray(data?.questions) ? data.questions : [];
    crumbs(app, mod, 'Review Answers');
    header(app, 'Practice', 'Review Answers', 'Review all submitted answers, including correct, incorrect and partially correct tasks.');
    const actions = el('div', null, 'practice-review-links');
    append(actions, link('← Back to Results', `/module/${mod.id}/practice/results`, 'btn secondary'), link('Return to Module', `/module/${mod.id}`, 'btn secondary'));
    app.append(actions);
    if (!data?.grading?.results || questions.length !== 35) {
        app.append(el('p', 'No completed attempt is available for review.', 'note'));
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
    const reviewed = questions.map((q, index) => ({
        q,
        index,
        points: data.grading.results[index]?.points ?? 0,
        answer: data.answers?.[q.id]
    }));
    const correct = reviewed.filter(item => item.points >= 1 - 1e-9).length;
    const partial = reviewed.filter(item => item.points > 1e-9 && item.points < 1 - 1e-9).length;
    const incorrect = reviewed.length - correct - partial;
    const count = el('p', `${correct} correct · ${partial} partially correct · ${incorrect} incorrect or unanswered. ${reviewed.length} tasks in total.`, 'practice-review-count');
    app.append(count);
    const list = el('div', null, 'practice-review-list');
    app.append(list);
    const normalize = v => String(v ?? '').trim().toLowerCase();
    const field = (parent, label, value, kind = '') => {
        const item = el('div', null, `practice-review-field ${kind}`);
        append(item, el('span', label, 'practice-review-label'), el('div', value || 'Not answered', 'practice-review-value'));
        parent.append(item);
    };
    for (const {q, index, points, answer} of reviewed) {
        const card = el('article', null, 'panel practice-review-card');
        append(card, el('div', `Question ${index + 1} · ${TYPES[q.type] || q.type} · ${Number(points.toFixed(2))} / 1 point`, 'label'), el('p', q.prompt, 'practice-review-prompt'));
        const answerBody = card; // Existing answer comparison remains visible.
        if (q.type === 'matching') {
            for (const [i, [english, russian]] of q.pairs.entries()) {
                const part = el('div', null, 'practice-review-part');
                part.append(el('div', english, 'practice-review-context'));
                field(part, 'Your answer', answer?.[i] || '', normalize(answer?.[i]) === normalize(russian) ? 'is-correct' : 'is-incorrect');
                if (normalize(answer?.[i]) !== normalize(russian)) field(part, 'Correct answer', russian, 'is-correct');
                answerBody.append(part);
            }
        } else if (q.type === 'choice') {
            const chosen = Number.isInteger(answer) ? q.options[answer] : null;
            field(answerBody, 'Your answer', chosen || '', answer === q.answer ? 'is-correct' : 'is-incorrect');
            field(answerBody, 'Correct answer', q.options[q.answer], 'is-correct');
            // Only the original multiple-choice options are collapsible; the answer comparison stays visible.
            const choices = el('details', null, 'practice-review-options');
            const optionsToggle = el('summary', 'Show all options', 'practice-review-options-toggle');
            choices.append(optionsToggle);
            const optionsBody = el('div', null, 'practice-review-options-body');
            q.options.forEach((option, optionIndex) => {
                const optionRow = el('div', null, 'practice-review-option');
                optionRow.append(el('span', `${String.fromCharCode(65 + optionIndex)}. ${option}`));
                const marks = el('span', null, 'practice-review-option-marks');
                if (optionIndex === answer) marks.append(el('span', 'Your choice', 'practice-review-option-mark is-student'));
                if (optionIndex === q.answer) marks.append(el('span', 'Correct', 'practice-review-option-mark is-key'));
                optionRow.append(marks);
                optionsBody.append(optionRow);
            });
            choices.append(optionsBody);
            choices.addEventListener('toggle', () => {
                optionsToggle.textContent = choices.open ? 'Hide all options' : 'Show all options';
            });
            card.append(choices);
        } else if (q.type === 'fill') {
            if (q.sentence) answerBody.append(el('p', q.sentence, 'practice-review-context'));
            q.answers.forEach((expected, i) => {
                const part = el('div', null, 'practice-review-part');
                part.append(el('div', `Blank ${i + 1}`, 'practice-review-context'));
                const accepted = Array.isArray(expected) ? expected : [expected];
                const ok = matchesAcceptedAnswer(answer?.[i], expected);
                field(part, 'Your answer', answer?.[i] || '', ok ? 'is-correct' : 'is-incorrect');
                if (!ok) field(part, accepted.length > 1 ? 'Accepted answers' : 'Correct answer', accepted.join(' / '), 'is-correct');
                answerBody.append(part);
            });
        } else if (q.type === 'error') {
            answerBody.append(el('p', q.sentence, 'practice-review-context'));
            const words = q.sentence.split(' ');
            const expected = words.slice(q.errorIndex, q.errorIndex + (q.errorLength || 1)).join(' ');
            const picked = Number.isInteger(answer?.word) ? words.slice(answer.word, answer.word + (answer.word === q.errorIndex ? (q.errorLength || 1) : 1)).join(' ') : '';
            const wordCorrect = answer?.word === q.errorIndex;
            field(answerBody, 'Selected incorrect fragment', picked, wordCorrect ? 'is-correct' : 'is-incorrect');
            if (!wordCorrect) field(answerBody, 'Correct fragment', expected, 'is-correct');
            const correctionCorrect = normalize(answer?.correction) === normalize(q.correctWord);
            field(answerBody, 'Your correction', answer?.correction || '', correctionCorrect ? 'is-correct' : 'is-incorrect');
            if (!correctionCorrect) field(answerBody, 'Correct replacement', q.correctWord, 'is-correct');
        } else if (q.type === 'sentence') {
            const submitted = Array.isArray(answer) ? answer.map(i => q.words[i] || '').join(' ') : '';
            field(answerBody, 'Your sentence', submitted, points >= 1 - 1e-9 ? 'is-correct' : 'is-incorrect');
            field(answerBody, 'Correct sentence', q.answer.join(' '), 'is-correct');
        }
        // Explanations are shown only for Multiple Choice.
        // Updated content is available even for previously completed attempts.
        if (q.type === 'choice') {
            const explanation = choiceExplanations.get(q.id) || q.explanation;
            if (explanation) {
                const details = el('div', null, 'practice-review-explanation');
                append(details, el('strong', 'Explanation'), el('p', explanation));
                answerBody.append(details);
            }
        }
        list.append(card);
    }
}
