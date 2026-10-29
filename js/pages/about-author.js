import {app} from '../state.js';
import {el, link} from '../utils/dom.js';

export function aboutAuthor() {
    const page = el('section', null, 'author-page');
    page.append(link('← Back to home page', '/', 'page-back'));
    page.append(el('h1', 'Об авторе', 'author-page-title'));

    const profile = el('div', null, 'author-profile');
    const text = el('div', null, 'author-profile-text');

    const subjects = el('div', null, 'author-subjects');
    subjects.append(
        el('p', 'Преподаваемые дисциплины:', 'author-subjects-heading'),
        el('p', 'иностранный язык в профессиональной деятельности (английский язык)', 'author-position'),
        el('p', 'ПМ 04 Преподавание иностранных языков', 'author-position')
    );

    text.append(
        el('h2', 'Чашина Альмира Финарисовна'),
        el('p', 'Заведующий кафедрой иностранных языков', 'author-position'),
        el('p', 'Преподаватель высшей квалификационной категории', 'author-position'),
        subjects,
        el('p', 'ГБПОУ "Челябинский педагогический колледж №1"', 'author-organization')
    );

    const picture = el('div', null, 'author-photo');
    const placeholder = el('div', 'Фотография автора', 'author-photo-placeholder');
    const img = document.createElement('img');
    img.src = 'assets/author/portrait.webp';
    img.alt = 'Чашина Альмира Финарисовна';
    img.loading = 'eager';
    img.addEventListener('load', () => {
        placeholder.hidden = true;
        img.hidden = false;
    });
    img.addEventListener('error', () => {
        img.hidden = true;
        placeholder.hidden = false;
    });
    img.hidden = true;
    picture.append(img, placeholder);

    profile.append(text, picture);
    page.append(profile);
    app.append(page);
}
