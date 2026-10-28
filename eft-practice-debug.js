
(() => {
    'use strict';

    // EFT Practice Debugger
    // Показывает правильные ответы в консоли.
    // Не изменяет ответы, результаты или систему оценивания.

    window.eftDebug?.stop?.();

    const PREFIX = 'eft:practice:';
    const SUFFIX = ':attempt:v4';

    let observer = null;
    let lastShown = '';

    function getModuleId() {
        const match = location.hash.match(
            /\/module\/([^/]+)\/practice(?:\/|$)/
        );

        return match ? decodeURIComponent(match[1]) : null;
    }

    function getDraft() {
        const moduleId = getModuleId();

        if (!moduleId) {
            console.warn(
                '[EFT Debug] Сначала открой Practice.'
            );
            return null;
        }

        const key = PREFIX + moduleId + SUFFIX;
        const raw = localStorage.getItem(key);

        if (!raw) {
            console.warn(
                '[EFT Debug] Активная попытка не найдена.'
            );
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            console.error(
                '[EFT Debug] Ошибка чтения теста:',
                error
            );
            return null;
        }
    }

    function getCorrectAnswer(q) {
        switch (q.type) {

            case 'matching':
                return q.pairs
                    .map(([phrase, definition], index) =>
                        `${index + 1}. ${phrase} → ${definition}`
                    )
                    .join('\n');

            case 'choice':
                return (
                    `${q.answer + 1}. ${q.options[q.answer]}` +
                    (q.explanation
                        ? `\nExplanation: ${q.explanation}`
                        : '')
                );

            case 'fill':
                return q.answers
                    .map((answer, index) => {
                        const value = Array.isArray(answer)
                            ? answer.join(' / ')
                            : answer;

                        return `${index + 1}. ${value}`;
                    })
                    .join('\n');

            case 'error': {
                const words = q.sentence.split(/\s+/);
                const start = q.errorIndex;
                const length = q.errorLength || 1;

                const incorrect = words
                    .slice(start, start + length)
                    .join(' ');

                return (
                    `Incorrect: ${incorrect}\n` +
                    `Correct: ${q.correctWord}`
                );
            }

            case 'sentence':
                return q.answer
                    .join(' ')
                    .replace(/\s+([,.!?;:])/g, '$1');

            default:
                return 'Unknown question type';
        }
    }

    function getCurrentIndex(draft) {
        const counter = document.querySelector(
            '.practice-count'
        )?.textContent;

        const match = counter?.match(
            /Question\s+(\d+)\s+of/i
        );

        if (match) {
            return Number(match[1]) - 1;
        }

        return Math.max(0, Number(draft.index) || 0);
    }

    function showQuestion(number = null) {
        const draft = getDraft();
        if (!draft) return;

        const index = number === null
            ? getCurrentIndex(draft)
            : Number(number) - 1;

        const question = draft.questions?.[index];

        if (!question) {
            console.warn(
                `[EFT Debug] Вопрос ${number} не найден.`
            );
            return;
        }

        console.group(
            `%c[EFT Debug] Question ${index + 1}/${draft.questions.length}`,
            'color: #22c55e; font-weight: bold'
        );

        console.log('Type:', question.type);
        console.log('ID:', question.id);
        console.log('Question:', question.prompt);

        console.log(
            '%cCorrect Answer:',
            'color: #22c55e; font-weight: bold'
        );

        console.log(getCorrectAnswer(question));

        console.groupEnd();
    }

    function showAll() {
        const draft = getDraft();
        if (!draft) return;

        const rows = draft.questions.map((q, index) => ({
            Number: index + 1,
            Type: q.type,
            ID: q.id,
            Answer: getCorrectAnswer(q)
        }));

        console.table(rows);
    }

    function checkForChange() {
        const draft = getDraft();
        if (!draft) return;

        const index = getCurrentIndex(draft);
        const marker = `${getModuleId()}:${index}`;

        if (marker !== lastShown) {
            lastShown = marker;
            showQuestion(index + 1);
        }
    }

    function stopWatching() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }

        console.info(
            '[EFT Debug] Автоматический вывод отключён.'
        );
    }

    function startWatching() {
        stopWatching();

        observer = new MutationObserver(checkForChange);

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        lastShown = '';
        checkForChange();

        console.info(
            '[EFT Debug] Автоматический вывод включён.'
        );
    }

    window.eftDebug = {
        current: () => showQuestion(),
        question: showQuestion,
        all: showAll,
        watch: startWatching,
        stop: stopWatching
    };

    console.log(
        '%cEFT Practice Debugger READY',
        'color: #22c55e; font-size: 16px; font-weight: bold'
    );

    console.log('Доступные команды:');
    console.log('eftDebug.current()');
    console.log('eftDebug.question(12)');
    console.log('eftDebug.all()');
    console.log('eftDebug.watch()');
    console.log('eftDebug.stop()');

    startWatching();
})();
