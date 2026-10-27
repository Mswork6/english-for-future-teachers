import {app} from '../state.js';
import {crumbs, header, demo, el, append} from '../utils/dom.js';

export function cases(mod) {
    crumbs(app, mod, 'Teaching Cases');
    header(app, 'Teaching Cases', 'Classroom situations', 'Choose the teacher’s response and see how the student reacts. Feedback appears after the case.');
    demo(app);
    for (const scenario of mod.cases) {
        const panel = el('section', null, 'panel');
        append(panel, el('h2', scenario.title));
        const chat = el('div', null, 'chat'), controls = el('div');
        append(panel, chat, controls);
        app.append(panel);
        let current = scenario.start, points = 0, steps = 0;

        function render() {
            const node = scenario.nodes[current];
            chat.append(el('div', `${node.speaker}: ${node.text}`, 'bubble'));
            controls.replaceChildren();
            if (node.end) {
                append(controls, el('div', `Case complete · ${points} / ${steps} points`, 'score'), el('p', points === steps ? 'Good use of supportive classroom language.' : 'Consider how to give clearer and more supportive feedback.', 'feedback'));
                const again = el('button', 'Restart case', 'btn secondary');
                again.onclick = () => {
                    chat.replaceChildren();
                    current = scenario.start;
                    points = 0;
                    steps = 0;
                    render()
                };
                controls.append(again);
                return
            }
            for (const choice of node.choices) {
                const b = el('button', choice.text, 'case-option');
                b.onclick = () => {
                    chat.append(el('div', `Teacher: ${choice.text}`, 'bubble teacher'));
                    points += choice.points;
                    steps++;
                    current = choice.next;
                    render()
                };
                controls.append(b)
            }
        }

        render()
    }
}
