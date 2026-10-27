import test from 'node:test';
import assert from 'node:assert/strict';
import {speakEnglish} from '../js/utils/speech.js';

test('speech uses en-GB at the original speaking rate and cancels prior audio', () => {
    const calls = [];
    const browser = {
        speechSynthesis: {
            cancel: () => calls.push('cancel'),
            speak: utterance => calls.push(utterance)
        }
    };

    class Utterance {
        constructor(text) {
            this.text = text;
        }
    }

    assert.equal(speakEnglish('Good morning', {browser, Utterance}), true);
    assert.equal(calls[0], 'cancel');
    assert.equal(calls[1].text, 'Good morning');
    assert.equal(calls[1].lang, 'en-GB');
    assert.equal(calls[1].rate, 0.9);
});

test('speech warns and does not throw when unavailable', () => {
    let message = '';
    const browser = {
        alert: text => {
            message = text;
        }
    };
    assert.equal(speakEnglish('Hello', {browser, Utterance: undefined}), false);
    assert.match(message, /not supported/);
});
