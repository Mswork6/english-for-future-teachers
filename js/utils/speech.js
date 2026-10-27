/** Play an English phrase using the browser Speech Synthesis API.
 * Returns false when the API is unavailable (and shows the existing warning).
 * Dependencies are injected to keep browser behavior testable in Node.js.
 */
export function speakEnglish(text, {
    browser = globalThis.window,
    Utterance = globalThis.SpeechSynthesisUtterance
} = {}) {
    if (!browser?.speechSynthesis || typeof Utterance !== 'function') {
        browser?.alert?.('Speech synthesis is not supported in this browser.');
        return false;
    }
    browser.speechSynthesis.cancel();
    const utterance = new Utterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.9;
    browser.speechSynthesis.speak(utterance);
    return true;
}
