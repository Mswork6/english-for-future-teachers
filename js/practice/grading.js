// Pure grading functions: each task is worth at most one point.
const normalize = value => String(value ?? '').trim().toLowerCase();
export const matchesAcceptedAnswer = (submitted, expected) =>
    (Array.isArray(expected) ? expected : [expected]).some(candidate => normalize(submitted) === normalize(candidate));

export function gradeTask(question, answer) {
    switch (question.type) {
        case 'matching': {
            const pairs = question.pairs;
            return pairs.length ? pairs.reduce((sum, pair, index) => sum + (answer?.[index] === pair[1] ? 1 / pairs.length : 0), 0) : 0;
        }
        case 'choice':
            return answer === question.answer ? 1 : 0;
        case 'fill': {
            const answers = question.answers;
            return answers.length ? answers.reduce((sum, expected, index) =>
                sum + (matchesAcceptedAnswer(answer?.[index], expected) ? 1 / answers.length : 0), 0) : 0;
        }
        case 'error':
            return (answer?.word === question.errorIndex ? 0.5 : 0) + (normalize(answer?.correction) === normalize(question.correctWord) ? 0.5 : 0);
        case 'sentence':
            return answer?.map(index => question.words[index]).join('|') === question.answer.join('|') ? 1 : 0;
        default:
            throw new Error(`Unsupported task type: ${question.type}`);
    }
}

export function gradePractice(questions, answers) {
    const results = questions.map(question => ({id: question.id, points: gradeTask(question, answers[question.id])}));
    const total = results.reduce((sum, result) => sum + result.points, 0);
    return {
        results,
        total,
        maximum: questions.length,
        percentage: questions.length ? Math.round(total / questions.length * 100) : 0
    };
}
