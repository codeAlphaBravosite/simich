let channels = [];
let viewedChannels = 0;

// Local Storage Keys
const STORAGE_KEYS = {
    CHANNELS: 'yt_viewer_channels',
    THEME: 'theme'
};

// Load saved data on startup
document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
    initializeTheme();
});

function loadSavedData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEYS.CHANNELS);
        if (savedData) {
            channels = JSON.parse(savedData);
            displayCards(channels);
            document.getElementById('filterContainer').style.display = 'block';
            initializeStatistics();
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
        updateStatistics();
    } catch (error) {
        console.error('Error saving to local storage:', error);
    }
}

function loadFile(event) {
    const file = event.target.files[0];
    if (file) {
        updateFileInputButton(file.name);
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                // Reset channels array with new data
                channels = results.data.map(channel => ({
                    ...channel,
                    viewed: false
                }));
                
                saveToLocalStorage();
                displayCards(channels);
                document.getElementById('filterContainer').style.display = 'block';
                initializeStatistics();
            }
        });
    }
}

function updateFileInputButton(fileName) {
    const button = document.querySelector('.file-input-button');
    button.textContent = fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName;
}

function applySorting() {
    const sortOrder = document.getElementById('sortOrder').value;
    let sortedData = [...channels];

    if (sortOrder !== 'none') {
        sortedData.sort((a, b) => {
            const subsA = parseSubscribers(a['Subscribers']);
            const subsB = parseSubscribers(b['Subscribers']);
            return sortOrder === 'ascending' ? subsA - subsB : subsB - subsA;
        });
        channels = sortedData; // Update the main channels array
        saveToLocalStorage();
    }

    displayCards(sortedData);
}

function parseSubscribers(subString) {
    if (!subString) return 0;
    subString = subString.replace(/,/g, '').toUpperCase();
    let multiplier = 1;
    if (subString.endsWith('K')) {
        multiplier = 1000;
        subString = subString.slice(0, -1);
    } else if (subString.endsWith('M')) {
        multiplier = 1000000;
        subString = subString.slice(0, -1);
    } else if (subString.endsWith('B')) {
        multiplier = 1000000000;
        subString = subString.slice(0, -1);
    }
    const number = parseFloat(subString);
    return isNaN(number) ? 0 : Math.round(number * multiplier);
}

function formatSubscribers(number) {
    if (number >= 1000000000) {
        return (number / 1000000000).toFixed(1) + 'B';
    } else if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
}

function displayCards(data) {
    const cardsContainer = document.getElementById('cards');
    cardsContainer.innerHTML = '';
    data.forEach((channel, index) => {
        const formattedSubs = formatSubscribers(parseSubscribers(channel['Subscribers']));
        const card = document.createElement('div');
        card.className = `card ${channel.viewed ? 'viewed' : ''}`;
        card.dataset.index = index;
        card.innerHTML = `
            <div class="card-title">${channel['Channel Name']}</div>
            <div class="card-subtitle">${formattedSubs} subscribers</div>
            <a href="https://www.youtube.com/channel/${channel.channelId}" target="_blank" rel="noopener noreferrer">visit channel</a>
            <label>
                <input type="checkbox" onchange="toggleVisibility(${index})" ${channel.viewed ? 'checked' : ''}> Viewed?
            </label>
        `;
        cardsContainer.appendChild(card);
    });
    updateStatistics();
}

function toggleVisibility(index) {
    const card = document.querySelector(`.card[data-index='${index}']`);
    card.classList.toggle('viewed');
    channels[index].viewed = !channels[index].viewed;
    saveToLocalStorage();
}

function updateStatistics() {
    const totalChannels = channels.length;
    viewedChannels = channels.filter(channel => channel.viewed).length;
    const remainingChannels = totalChannels - viewedChannels;

    document.getElementById('totalChannels').textContent = totalChannels;
    document.getElementById('viewedChannels').textContent = viewedChannels;
    document.getElementById('remainingChannels').textContent = remainingChannels;
}

// Theme management
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

function initializeTheme() {
    const currentTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (currentTheme) {
        document.body.classList[currentTheme === 'dark' ? 'add' : 'remove']('dark-mode');
        toggleSwitch.checked = currentTheme === 'dark';
    }
}

function switchTheme(e) {
    if (e.target.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }    
}

toggleSwitch.addEventListener('change', switchTheme, false);

// Statistics sticky behavior
function makeStatisticsSticky() {
    const statisticsContainer = document.getElementById('statisticsContainer');
    const placeholder = document.getElementById('statisticsPlaceholder');
    const statsRect = statisticsContainer.getBoundingClientRect();
    const statsTop = statsRect.top;

    if (window.pageYOffset > statsTop) {
        if (!statisticsContainer.classList.contains('sticky')) {
            statisticsContainer.classList.add('sticky');
            placeholder.style.height = `${statsRect.height}px`;
        }
    } else {
        statisticsContainer.classList.remove('sticky');
        placeholder.style.height = '0';
    }
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

window.addEventListener('scroll', throttle(makeStatisticsSticky, 100));

function initializeStatistics() {
    document.getElementById('statisticsContainer').style.display = 'flex';
    if (!document.getElementById('statisticsPlaceholder')) {
        const placeholder = document.createElement('div');
        placeholder.id = 'statisticsPlaceholder';
        document.getElementById('statisticsContainer').insertAdjacentElement('beforebegin', placeholder);
    }
    updateStatistics();
    makeStatisticsSticky();
            }
