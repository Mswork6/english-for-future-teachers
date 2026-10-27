import { load } from './data-service.js';

// Resolve module content from its catalog entry, rather than hard-coding module IDs.
export async function loadModule(info, { includePractice = false, loadJson = load } = {}) {
    const moduleFile = info.contentFile ?? `data/${info.id}.json`;
    const mod = await loadJson(moduleFile);
    if (!includePractice || !info.practiceFile) return mod;
    const practice = await loadJson(info.practiceFile);
    return { ...mod, practice };
}
