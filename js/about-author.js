const trigger = document.getElementById('about-author-trigger');
const dialog = document.getElementById('about-author-dialog');
const closeButton = document.getElementById('about-author-close');

if (trigger && dialog && closeButton) {
    trigger.addEventListener('click', () => dialog.showModal());
    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => {
        if (e.target === dialog) dialog.close();
    });
    window.addEventListener('hashchange', () => {
        if (dialog.open) dialog.close();
    });
}
