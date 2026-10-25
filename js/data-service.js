const cache = new Map();

export class DataLoadError extends Error {
    constructor(path, status = null, cause = null) {
        super(status === 404
            ? `Content not found: ${path}`
            : `Failed to load ${path}${status == null ? '' : ` (HTTP ${status})`}`);
        this.name = 'DataLoadError';
        this.path = path;
        this.status = status;
        if (cause) this.cause = cause;
    }
}

export async function load(path) {
    if (!cache.has(path)) {
        const pending = (async () => {
            let response;
            try {
                response = await fetch(path);
            } catch (cause) {
                throw new DataLoadError(path, null, cause);
            }
            if (!response.ok) {
                throw new DataLoadError(path, response.status);
            }
            try {
                return await response.json();
            } catch (cause) {
                throw new DataLoadError(path, response.status, cause);
            }
        })();
        cache.set(path, pending);
        pending.catch(() => {
            if (cache.get(path) === pending) cache.delete(path);
        });
    }
    return cache.get(path);
}
