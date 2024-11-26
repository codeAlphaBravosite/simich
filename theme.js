import { STORAGE_KEYS, saveToStorage } from './storage.js';

export function initializeTheme() {
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const currentTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    
    if (currentTheme) {
        document.body.classList[currentTheme === 'dark' ? 'add' : 'remove']('dark-mode');
        toggleSwitch.checked = currentTheme === 'dark';
    }

    toggleSwitch.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('dark-mode');
            saveToStorage(STORAGE_KEYS.THEME, 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            saveToStorage(STORAGE_KEYS.THEME, 'light');
        }
    });
}