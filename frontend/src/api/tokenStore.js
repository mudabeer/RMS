let accessToken = null;
const listeners = new Set();

export const tokenStore = {
    get() {
        return accessToken;
    },

    set(token) {
        accessToken = token;
        listeners.forEach((listener) => listener(token));
    },

    subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};