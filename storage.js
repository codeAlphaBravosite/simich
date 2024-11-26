export const STORAGE_KEYS = {
    CHANNELS: 'yt_viewer_channels',
    THEME: 'theme'
};

export function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving to storage: ${error}`);
    }
}

export function getFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error reading from storage: ${error}`);
        return null;
    }
}