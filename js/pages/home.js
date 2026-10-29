
import {app} from '../state.js';

export function home(modules) {
    const section = document.createElement('section');
    section.className = 'home-page';

    section.innerHTML = `
        <div class="home-heading">
            <h1>Welcome to TeachLab: English for Future Teachers!</h1>

            <div class="home-quote">
                <p>"I never teach my pupils. I only attempt to provide the conditions in which they can learn."</p>

                <div class="home-quote-author">
                    <span>Albert Einstein</span>
                </div>
            </div>
        </div>

        <div class="home-cards">
            <a class="home-card" href="#/modules">
                <div class="home-icon blue">
                    <i data-lucide="library-big"></i>
                </div>

                <h2>Learning Modules</h2>
                <span class="home-card-translation">Учебные модули</span>

                <p>Explore interactive lessons, exercises and teaching cases.</p>

                <span class="home-link blue-text">Explore →</span>
            </a>

            <a class="home-card" href="#/note">
                <div class="home-icon green">
                    <i data-lucide="file-text"></i>
                </div>

                <h2>Explanatory Note</h2>
                <span class="home-card-translation">Пояснительная записка</span>

                <p>Learn about the purpose, objectives and structure of the resource.</p>

                <span class="home-link green-text">Read More →</span>
            </a>

            <a class="home-card" href="#/guidelines">
                <div class="home-icon purple">
                    <i data-lucide="clipboard-list"></i>
                </div>

                <h2>Teaching Guidelines</h2>
                <span class="home-card-translation">Методические рекомендации</span>

                <p>Read recommendations for effective use of this learning resource.</p>

                <span class="home-link purple-text">Read More →</span>
            </a>
        </div>

        <section class="home-author" aria-label="Сведения об авторе">
            <p class="home-author-name">Чашина Альмира Финарисовна</p>
            <p class="home-author-role">Преподаватель английского языка</p>
            <p class="home-author-role">Заведующий кафедрой иностранных языков</p>
            <p class="home-author-college">ГБПОУ "Челябинский педагогический колледж №1"</p>
        </section>
    `;

    app.append(section);

    if (window.lucide) {
        lucide.createIcons();
    }
}
