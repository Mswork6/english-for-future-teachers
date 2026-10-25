const cache = new Map();

export async function load(path) {
    if (!cache.has(path)) {
        const response = await fetch(path);
        if (!response.ok) throw Error(`Cannot load ${path}`);
        cache.set(path, await response.json())
    }
    return cache.get(path)
}
