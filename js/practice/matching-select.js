import {el} from '../utils/dom.js';
import {button} from './shared.js';

// Matching Pairs dropdown, including viewport positioning and focus behavior.
// Event listeners are cleaned up by the owning Practice page.
export function renderMatching(q, area, {saved, update, selectListeners}) {
    const options = q.pairs.map(p => p[1]).reverse();
    q.pairs.forEach(([source], n) => {
        const wrap = el('div', null, 'practice-match-row');
        wrap.append(el('span', source));
        const picker = el('div', null, 'practice-select');
        const trigger = button('', 'practice-select-trigger', () => toggle());
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-label', `Select translation for ${source}`);
        const label = el('span', saved[q.id]?.[n] || 'Select translation');
        const arrow = el('span', null, 'practice-select-chevron');
        arrow.setAttribute('aria-hidden', 'true');
        trigger.append(label, arrow);
        const list = el('div', null, 'practice-select-menu');
        list.setAttribute('role', 'listbox');
        list.setAttribute('aria-label', `Translations for ${source}`);
        const entries = [];
        // Place the options outside the document flow to avoid extending
        // the page/footer. The menu is returned to its picker on close.
        const animationMs = 180;
        let closingTimer = null;
        let openingFrame = null;
        let openUpwards = false;
        const resetMenu = () => {
            if (closingTimer !== null) {
                clearTimeout(closingTimer);
                closingTimer = null;
            }
            if (openingFrame !== null) {
                cancelAnimationFrame(openingFrame);
                openingFrame = null;
            }
            if (list.parentElement !== picker) picker.append(list);
            list.removeAttribute('style');
        };
        const close = (immediate = false) => {
            if (!picker.classList.contains('is-open')) {
                if (immediate) resetMenu();
                return;
            }
            picker.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
            if (openingFrame !== null) {
                cancelAnimationFrame(openingFrame);
                openingFrame = null;
            }
            if (immediate) {
                resetMenu();
                return;
            }
            list.style.pointerEvents = 'none';
            list.style.opacity = '0';
            closingTimer = setTimeout(resetMenu, animationMs);
        };
        picker._closeMenu = close;
        const positionMenu = () => {
            if (!picker.classList.contains('is-open')) return;
            const rect = trigger.getBoundingClientRect();
            const gap = 6, edge = 8;
            const below = Math.max(0, window.innerHeight - rect.bottom - gap - edge);
            const above = Math.max(0, rect.top - gap - edge);
            const upwards = below < 230 && above > below;
            openUpwards = upwards;
            const space = upwards ? above : below;
            const height = Math.max(0, Math.min(230, space));
            const left = Math.max(edge, Math.min(rect.left, window.innerWidth - edge - Math.min(rect.width, window.innerWidth - 2 * edge)));
            list.style.position = 'fixed';
            list.style.zIndex = '1000';
            list.style.left = `${left}px`;
            list.style.width = `${Math.min(rect.width, window.innerWidth - 2 * edge)}px`;
            list.style.maxHeight = `${height}px`;
            list.style.top = upwards ? `${Math.max(edge, rect.top - gap - height)}px` : `${rect.bottom + gap}px`;
            list.style.bottom = 'auto';
            list.style.overflowY = 'auto';
            list.style.display = 'grid';
            list.style.boxSizing = 'border-box';
            // Animate visibility only. Keeping a transform on a fixed menu
            // can cause blurry glyph rasterization in Chromium.
            list.style.transition = `opacity ${animationMs}ms ease`;
        };
        window.addEventListener('resize', positionMenu, {signal: selectListeners.signal});
        // Capture scroll from nested scroll containers as well.
        window.addEventListener('scroll', positionMenu, {signal: selectListeners.signal, capture: true});
        const choose = value => {
            saved[q.id][n] = value;
            label.textContent = value || 'Select translation';
            update();
            close();
            trigger.focus();
        };
        const allOptions = ['', ...options];
        allOptions.forEach((value, i) => {
            const opt = button(value || 'Select translation', 'practice-select-option', () => choose(value));
            opt.setAttribute('role', 'option');
            opt.setAttribute('aria-selected', String((saved[q.id]?.[n] || '') === value));
            opt.dataset.optionIndex = String(i);
            entries.push(opt);
            list.append(opt);
        });

        function toggle() {
            const opening = !picker.classList.contains('is-open');
            document.querySelectorAll('.practice-select.is-open').forEach(x => x._closeMenu?.(true));
            if (opening) {
                resetMenu();
                picker.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
                document.body.append(list);
                positionMenu();
                list.style.opacity = '0';
                list.style.pointerEvents = 'auto';
                openingFrame = requestAnimationFrame(() => {
                    openingFrame = null;
                    if (picker.classList.contains('is-open')) {
                        list.style.opacity = '1';
                    }
                });
            }
        }

        trigger.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                if (!picker.classList.contains('is-open')) toggle();
                const selected = allOptions.indexOf(saved[q.id]?.[n] || '');
                entries[Math.max(0, Math.min(entries.length - 1, selected + (e.key === 'ArrowDown' ? 1 : -1)))].focus();
            }
        });
        list.addEventListener('keydown', e => {
            const pos = entries.indexOf(document.activeElement);
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                close();
                trigger.focus();
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                entries[(pos + (e.key === 'ArrowDown' ? 1 : -1) + entries.length) % entries.length].focus();
            } else if (e.key === 'Home' || e.key === 'End') {
                e.preventDefault();
                entries[e.key === 'Home' ? 0 : entries.length - 1].focus();
            } else if (e.key === 'Tab') close();
        });
        document.addEventListener('pointerdown', e => {
            if (!picker.contains(e.target) && !list.contains(e.target)) close();
        }, {signal: selectListeners.signal});
        picker.append(trigger, list);
        wrap.append(picker);
        area.append(wrap);
    });
}
