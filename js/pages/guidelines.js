import {app} from '../state.js';

export function teachingGuidelines() {
    const section = document.createElement('section');
    section.className = 'teaching-guidelines-page';
    section.innerHTML = `
        <style>
            .teaching-guidelines-page { width: min(100% - 40px, 960px); margin: 42px auto 76px; }
            .teaching-guidelines-page .guidelines-back { display: inline-flex; align-items: center; gap: 8px; padding: 12px 16px; margin-bottom: 30px; background: #fff; border: 1px solid #dce5f5; border-radius: 999px; color: #3f67b1; text-decoration: none; font-weight: 700; font-size: 15px; transition: background-color .2s ease, border-color .2s ease; }
            .teaching-guidelines-page .guidelines-back:hover { background: #f4f7fc; border-color: #b7c9ea; }
            .teaching-guidelines-page .guidelines-heading { margin-bottom: 30px; }
            .teaching-guidelines-page .guidelines-eyebrow { color: #3f67b1; font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; margin: 0 0 10px; }
            .teaching-guidelines-page h1 { font-size: clamp(27px, 4vw, 39px); line-height: 1.2; color: #1e2a45; letter-spacing: -.025em; margin: 0; }
            .teaching-guidelines-page .guidelines-content { padding: clamp(22px, 4vw, 48px); background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 8px 30px rgba(15,23,42,.045); }
            .teaching-guidelines-page .guidelines-content p, .teaching-guidelines-page .guidelines-content li { font-size: 16px; line-height: 1.8; color: #334155; }
            .teaching-guidelines-page .guidelines-content p { margin: 0 0 18px; }
            .teaching-guidelines-page .guidelines-content h2 { font-size: 24px; line-height: 1.3; color: #1e2a45; margin: 34px 0 18px; padding-top: 20px; border-top: 1px solid #e8edf5; }
            .teaching-guidelines-page .guidelines-content h3 { font-size: 17px; line-height: 1.5; color: #274b8e; margin: 22px 0 8px; }
            .teaching-guidelines-page .guidelines-content .guidelines-intro { font-size: 15px; color: #64748b; }
            .teaching-guidelines-page .guidelines-content .guidelines-ending { text-align: center; font-weight: 700; margin-top: 28px; }
            .teaching-guidelines-page .guidelines-content ul { margin: 8px 0 24px; padding-left: 24px; }
            .teaching-guidelines-page .guidelines-content li { margin: 8px 0; }
            .teaching-guidelines-page .guidelines-table-wrap { overflow-x: auto; margin: 18px 0 26px; border: 1px solid #e2e8f0; border-radius: 12px; }
            .teaching-guidelines-page .guidelines-content table { width: 100%; border-collapse: collapse; font-size: 15px; }
            .teaching-guidelines-page .guidelines-content th, .teaching-guidelines-page .guidelines-content td { padding: 13px 16px; text-align: left; vertical-align: top; border-bottom: 1px solid #e2e8f0; color: #334155; }
            .teaching-guidelines-page .guidelines-content tr:last-child td { border-bottom: 0; }
            .teaching-guidelines-page .guidelines-content th { background: #f1f5fc; color: #274b8e; font-weight: 700; }
            .teaching-guidelines-page .guidelines-content td:first-child { font-weight: 600; width: 39%; }
            @media (max-width: 640px) { .teaching-guidelines-page { width: min(100% - 28px, 960px); margin: 24px auto 48px; } .teaching-guidelines-page .guidelines-content p, .teaching-guidelines-page .guidelines-content li { font-size: 15px; } .teaching-guidelines-page .guidelines-content h2 { font-size: 21px; } .teaching-guidelines-page .guidelines-content th, .teaching-guidelines-page .guidelines-content td { font-size: 14px; padding: 10px; } }
        </style>
        <a class="guidelines-back" href="#/">← Back to home page</a>
        <header class="guidelines-heading">
            <p class="guidelines-eyebrow">Teaching Guidelines · Методические рекомендации</p>
            <h1>Инструкция по использованию TeachLab: English for Future Teachers</h1>
        </header>
        <article class="guidelines-content" lang="ru">
            <p class="guidelines-intro">Пошаговое руководство для студентов, преподавателей и проверяющих</p>
            <p>TeachLab: English for Future Teachers («Английский язык для будущих учителей») – интерактивный веб-тренажёр для студентов педагогического колледжа. Он направлен на освоение Classroom English – устойчивых английских выражений, которыми учитель организует работу класса: приветствует детей, объясняет задания, задаёт вопросы, поддерживает учеников, проверяет понимание и завершает урок.</p>
            <p>Ресурс ориентирован прежде всего на подготовку будущих учителей начальных классов, в том числе в рамках дисциплин «Английский язык в профессиональной деятельности» и «Методика преподавания английского языка». Его можно использовать на занятиях под руководством преподавателя, для самостоятельной тренировки и при подготовке к учебной практике.</p>
            <p>Тренажёр помогает будущим учителям начальных классов освоить английские фразы для проведения урока: начать занятие, объяснить задание, поддержать учеников и правильно завершить урок. Знание английского языка для понимания этой инструкции не требуется.</p>
            <h2>1. Как открыть тренажёр</h2>
            <h3>1. Откройте сайт тренажёра</h3>
            <p>Запустите сайт в браузере на компьютере, планшете или телефоне. На главном экране находятся три большие карточки.</p>
            <div class="guidelines-table-wrap"><table><tr><th>Надпись на сайте</th><th>Что означает / куда ведёт</th></tr><tr><td>Learning Modules</td><td>«Учебные модули» – переход к занятиям</td></tr><tr><td>Explanatory Note</td><td>«Пояснительная записка» – описание назначения тренажёра</td></tr><tr><td>Teaching Guidelines</td><td>«Методические рекомендации» – инструкция по работе</td></tr></table></div>
            <h3>2. Нажмите Learning Modules («Учебные модули»)</h3>
            <p>Откроется список из трёх модулей. Каждый соответствует одному этапу обычного школьного урока.</p>
            <div class="guidelines-table-wrap"><table><tr><th>Модуль</th><th>Что изучается</th></tr><tr><td>Module 1 – The Beginning of the Lesson</td><td>Начало урока: приветствие, проверка присутствующих, начало работы</td></tr><tr><td>Module 2 – During the Lesson</td><td>Основная часть: объяснение заданий, проверка понимания, помощь и похвала</td></tr><tr><td>Module 3 – The End of the Lesson</td><td>Конец урока: завершение работы, домашнее задание, прощание</td></tr></table></div>
            <h3>3. Выберите нужный модуль</h3>
            <p>Нажмите на карточку модуля. Вы увидите три раздела: Vocabulary, Practice и Teaching Cases. Рекомендуемый порядок – именно такой: изучить фразы → потренироваться → применить их в ситуации урока.</p>
            <h2>2. Vocabulary – изучить фразы учителя</h2>
            <h3>1. Нажмите Vocabulary («Вокабуляр»)</h3>
            <p>Откроется список английских фраз. Они разделены по темам, например приветствие или инструкции ученикам. Сразу под английской фразой показан русский перевод.</p>
            <h3>2. Прослушайте и изучите фразу</h3>
            <p>Нажмите значок 🔊 рядом с выражением – браузер произнесёт его вслух. Нажмите Example («Пример»), чтобы раскрыть пример использования в обстановке урока; повторное нажатие скрывает его.</p>
            <h3>3. Вернитесь к модулю</h3>
            <p>Используйте Back to Module («Назад к модулю»). Перейдите в Practice, когда познакомитесь с нужными фразами.</p>
            <p>Пример: Good morning, everybody! – «Доброе утро всем!». Студент видит перевод, слушает произношение и узнаёт, когда преподаватель может использовать эту реплику.</p>
            <h2>3. Practice – выполнить упражнения</h2>
            <h3>1. Нажмите Practice («Практика»)</h3>
            <p>Откроется тест из 35 заданий: по 7 заданий каждого из пяти типов. Вопросы показываются по одному. Задания случайным образом подбираются из расширенного банка упражнений, поэтому состав теста может отличаться при каждом новом прохождении.</p>
            <div class="guidelines-table-wrap"><table><tr><th>Тип упражнения на сайте</th><th>Что нужно сделать</th></tr><tr><td>Matching Pairs</td><td>Соединить английские фразы с подходящими значениями или определениями</td></tr><tr><td>Multiple Choice</td><td>Выбрать один правильный вариант из предложенных</td></tr><tr><td>Fill in the Blanks</td><td>Вписать пропущенные слова в выражение</td></tr><tr><td>Find and Correct the Error</td><td>Нажать на неправильное слово (или фразу) и ввести исправление</td></tr><tr><td>Sentence Building</td><td>Нажимать на слова в нужном порядке, чтобы составить предложение</td></tr></table></div>
            <h3>2. Отвечайте и перемещайтесь между вопросами</h3>
            <p>Кнопка Next («Далее») открывает следующий вопрос, Previous («Назад») – предыдущий. Кнопка All questions («Все вопросы») показывает меню номеров: можно сразу перейти к любому заданию и увидеть, какие уже заполнены. Данные введённых ответов сохраняются в браузере в ходе попытки.</p>
            <h3>3. Завершите тест</h3>
            <p>Нажмите Finish Practice («Завершить практику»). Если ответы даны не на все вопросы, появится предупреждение. Выберите Keep working («Продолжить работу») либо Submit answers («Отправить ответы») для проверки.</p>
            <h3>4. Изучите результаты</h3>
            <p>На отдельном экране появятся набранные баллы (максимум 35), процент выполнения и баллы по пяти типам упражнений. Нажмите Review Answers («Посмотреть ответы»), чтобы увидеть собственные и правильные ответы. В этом разделе также есть меню All questions для быстрого перехода к конкретному разбору.</p>
            <h3>5. Повторите при необходимости</h3>
            <p>Try Again («Пройти снова») запускает новую попытку. Return to Module / Back to Module («Вернуться к модулю») позволяет перейти к другим разделам.</p>
            <p>Преимущество повторного прохождения. В тренажёре предусмотрен банк заданий, который больше одного теста. При нажатии Try Again система формирует новый набор из 35 заданий. Благодаря этому студент может встретить упражнения, которых не было в первой попытке, закрепить материал на новых примерах и повторно проверить знания. Полное обновление всех вопросов при каждом прохождении не гарантируется: часть заданий может повториться.</p>
            <p>Как оценивается Practice: каждое задание даёт максимум 1 балл. В заданиях на соответствия и пропуски возможна часть балла за правильно выполненные элементы. В поиске ошибки 0,5 балла даётся за нахождение ошибки и ещё 0,5 – за исправление. При составлении предложения важен точный порядок слов. Результаты показываются после отправки всего теста, а не после каждого ответа.</p>
            <h2>4. Teaching Cases – попробовать себя в роли учителя</h2>
            <h3>1. Нажмите Teaching Cases («Учебные ситуации»)</h3>
            <p>Откроются две ситуации выбранного модуля. Всего в тренажёре шесть сценариев: два для начала урока, два для основной части и два для завершения. В первом модуле каждый сценарий содержит 4 решения, во втором и третьем – по 6.</p>
            <h3>2. Выберите ситуацию и нажмите Start case («Начать ситуацию»)</h3>
            <p>Появится описание происходящего в классе: что делают ученики и какая задача стоит перед учителем. Ниже отображается переписка с учениками, а справа – три варианта реплики преподавателя.</p>
            <h3>3. Выберите ответ и нажмите Send response («Отправить ответ»)</h3>
            <p>Ваша реплика появится в чате, а ученики отреагируют на неё. Прочитайте реакцию: она показывает, как выбранные слова влияют на развитие ситуации. Затем нажимайте Continue story («Продолжить историю») и Next step («Следующий шаг») согласно надписям на экране.</p>
            <h3>4. Дойдите до конца сценария и откройте результаты</h3>
            <p>Нажмите View results («Посмотреть результаты»). Вы увидите итоговые баллы и разбор каждого решения: выбранную фразу, объяснение её уместности и, если ответ неидеален, лучший вариант. Кнопка Restart case («Начать заново») позволяет повторить сценарий.</p>
            <p>Пример: ученица говорит «Мне нужно ещё немного времени», а до звонка остаётся несколько минут. Вы выбираете реплику учителя. Система показывает, как ученица отреагирует, а в конце объясняет, насколько уместным было решение. Это не беседа с реальными людьми и не свободный чат: ситуации и возможные реакции подготовлены заранее.</p>
            <div class="guidelines-table-wrap"><table><tr><th>Баллы за решение в Teaching Cases</th><th>Значение</th></tr><tr><td>1 балл</td><td>Подходящая реплика, которая решает задачу учителя</td></tr><tr><td>0,5 балла</td><td>Допустимая реплика, но менее точная или удачная</td></tr><tr><td>0 баллов</td><td>Реплика не подходит к текущей ситуации</td></tr></table></div>
            <h2>5. Быстрый маршрут для демонстрации</h2>
            <ul class="guidelines-list">
            <li>На главной странице нажмите Learning Modules → Module 1.</li>
            <li>Откройте Vocabulary: покажите перевод, нажмите 🔊 и Example.</li>
            <li>Вернитесь в модуль и откройте Practice: ответьте на несколько вопросов, покажите All questions.</li>
            <li>При демонстрации готовой завершённой попытки откройте результаты и Review Answers; для новой попытки завершите тест через Finish Practice → Submit answers.</li>
            <li>Вернитесь в модуль → Teaching Cases → выберите сценарий → Start case. Отправьте ответ через Send response, покажите реакцию ученика и, после прохождения всех шагов, итоговый разбор.</li>
            <h2>6. Рекомендации перед началом работы</h2>
            <p>Браузер. Рекомендуется использовать Google Chrome или Яндекс Браузер. Перед началом работы убедитесь, что браузер обновлён до актуальной версии.</p>
            <p>Устройство. Для комфортной работы предпочтительны ноутбук или планшет: на большом экране удобнее читать задания, выбирать ответы и просматривать результаты. Использование смартфона возможно, но менее удобно.</p>
            <p>Перевод страниц. Не используйте встроенный переводчик браузера или сторонние сервисы автоматического перевода содержимого сайта. Они могут изменять формулировки заданий и вариантов ответа, из-за чего упражнения теряют учебный смысл и проверка становится некорректной. Пользуйтесь русскими переводами фраз, предусмотренными в разделе изучения лексики.</p>
            <h2>7. Полезно знать</h2>
            <ul class="guidelines-list">
            <li>Английские подписи на кнопках в этой инструкции сопровождаются русским пояснением. На самом сайте основные учебные действия выполняются через английский интерфейс.</li>
            <li>Для озвучивания необходимо, чтобы браузер поддерживал синтез речи и на устройстве был включён звук.</li>
            <li>Незавершённый тест и результаты Practice хранятся локально в используемом браузере. При очистке данных браузера они могут исчезнуть. Система не требует личного кабинета и не формирует журнал оценок преподавателя.</li>
            <li>Оценивание происходит автоматически. Баллы позволяют увидеть ошибки и прогресс в тренировке, но не заменяют полноценную оценку умения преподавать на реальном уроке.</li>
            </ul>
            <p>Итог: Vocabulary помогает узнать и услышать нужные выражения; Practice – закрепить их и проверить себя; Teaching Cases – выбрать фразу в конкретной педагогической ситуации и увидеть последствия решения.</p>
            <p>Таким образом, TeachLab: English for Future Teachers сочетает лексическую подготовку, автоматизированную тренировку и педагогическое моделирование. Его основная методическая ценность состоит в том, что изучение английского языка подчинено конкретной профессиональной задаче будущего учителя – понятно, корректно и доброжелательно организовать взаимодействие с детьми на уроке.</p>
            <p class="guidelines-ending">Желаем успехов!<br>Fly High in English!</p>
        </article>
    `;
    app.append(section);
}
