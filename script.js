import { STORAGE_KEYS, saveToStorage, getFromStorage } from './storage.js';
import { parseSubscribers } from './subscribers.js';
import { initializeTheme } from './theme.js';
import { updateStatistics, initializeStatistics } from './statistics.js';
import { createCard } from './card.js';
import { updateFileInputButton } from './fileInput.js';

let channels = [];
let originalChannels = [];

document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
    initializeTheme();
    setupSortingListener();
});

function loadSavedData() {
    const savedData = getFromStorage(STORAGE_KEYS.CHANNELS);
    if (savedData) {
        channels = [...savedData];
        originalChannels = [...savedData];
        displayCards(channels);
        document.getElementById('filterContainer').style.display = 'block';
        initializeStatistics();
        updateStatistics(channels);
    }
}

function loadFile(event) {
    const file = event.target.files[0];
    if (file) {
        updateFileInputButton(file.name);
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                const parsedData = results.data
                    .filter(channel => channel['Channel Name'] && channel.Subscribers)
                    .map(channel => ({
                        ...channel,
                        viewed: false
                    }));
                
                channels = [...parsedData];
                originalChannels = [...parsedData];
                saveToStorage(STORAGE_KEYS.CHANNELS, channels);
                displayCards(channels);
                document.getElementById('filterContainer').style.display = 'block';
                initializeStatistics();
                updateStatistics(channels);
                
                document.getElementById('sortOrder').value = 'none';
            }
        });
    }
}

function setupSortingListener() {
    const sortOrder = document.getElementById('sortOrder');
    if (sortOrder) {
        sortOrder.addEventListener('change', applySorting);
    }
}

function applySorting() {
    const sortOrder = document.getElementById('sortOrder').value;
    let sortedData;

    if (sortOrder === 'none') {
        sortedData = [...originalChannels];
    } else {
        sortedData = [...channels].sort((a, b) => {
            const subsA = parseSubscribers(a['Subscribers'] || '0');
            const subsB = parseSubscribers(b['Subscribers'] || '0');
            return sortOrder === 'ascending' ? subsA - subsB : subsB - subsA;
        });
    }

    channels = sortedData;
    saveToStorage(STORAGE_KEYS.CHANNELS, channels);
    displayCards(sortedData);
}

function displayCards(data) {
    const cardsContainer = document.getElementById('cards');
    if (!cardsContainer) return;

    cardsContainer.innerHTML = '';
    
    data.forEach((channel, index) => {
        const card = createCard(channel, index);
        cardsContainer.appendChild(card);
    });
    updateStatistics(channels);
}

function toggleVisibility(index) {
    if (index < 0 || index >= channels.length) return;

    channels[index].viewed = !channels[index].viewed;
    const card = document.querySelector(`.card[data-index='${index}']`);
    if (card) {
        card.classList.toggle('viewed');
    }
    
    // Update the same channel in originalChannels
    const originalIndex = originalChannels.findIndex(ch => 
        ch['Channel Name'] === channels[index]['Channel Name']);
    if (originalIndex !== -1) {
        originalChannels[originalIndex].viewed = channels[index].viewed;
    }
    
    saveToStorage(STORAGE_KEYS.CHANNELS, channels);
    updateStatistics(channels);
}

// Export functions for global access
window.loadFile = loadFile;
window.applySorting = applySorting;
window.toggleVisibility = toggleVisibility;
