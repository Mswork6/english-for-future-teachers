import {app} from '../state.js';

export function home(modules) {
    const section = document.createElement('section');
    section.className = 'home-page';

    section.innerHTML = `
        <div class="home-heading">
            <span class="home-badge">ENGLISH LANGUAGE LEARNING</span>

            <h1>Welcome to English for Future Teachers!</h1>

            <p>Develop your English skills and prepare for real classroom situations.</p>
        </div>

        <div class="home-cards">
            <a class="home-card" href="#/modules">
                <div class="home-icon blue">
                    <i data-lucide="book-open"></i>
                </div>

                <h2>Learning Modules</h2>

                <p>Explore interactive lessons, exercises and teaching cases.</p>

                <span class="home-link blue-text">Explore →</span>
            </a>

            <a class="home-card" href="#/note">
                <div class="home-icon green">
                    <i data-lucide="file-text"></i>
                </div>

                <h2>Explanatory Note</h2>

                <p>Learn about the purpose, objectives and structure of the resource.</p>

                <span class="home-link green-text">Read More →</span>
            </a>

            <a class="home-card" href="#/guidelines">
                <div class="home-icon purple">
                    <i data-lucide="clipboard-list"></i>
                </div>

                <h2>Teaching Guidelines</h2>

                <p>Read recommendations for effective use of this learning resource.</p>

                <span class="home-link purple-text">Read More →</span>
            </a>
        </div>
    `;

    app.append(section);

    if (window.lucide) {
        lucide.createIcons();
    }
}
