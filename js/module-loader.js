import {load} from './data-service.js';

// Resolve module content from its catalog entry, rather than hard-coding module IDs.
export async function loadModule(info, {includePractice = false, loadJson = load} = {}) {
    const moduleFile = info.contentFile ?? `data/${info.id}.json`;
    const mod = await loadJson(moduleFile);
    const configured = info.matchingQuotas ? {...mod, matchingQuotas: info.matchingQuotas} : mod;
    if (!includePractice || !info.practiceFile) return configured;
    const practice = await loadJson(info.practiceFile);
    return {...configured, practice};
}
