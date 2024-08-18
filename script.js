// Global Variables
let originalData = [];
let viewedChannels = 0;

// Load CSV File
function loadFile(event) {
    const file = event.target.files[0];
    if (file) {
        updateFileInputButton(file.name);
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                originalData = results.data;
                displayCards(originalData);
                document.getElementById('filterContainer').style.display = 'block';
                initializeStatistics();
            }
        });
    }
}

// Update File Input Button Text
function updateFileInputButton(fileName) {
    const button = document.querySelector('.file-input-button');
    button.textContent = fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName;
}

// Apply Sorting
function applySorting() {
    const sortOrder = document.getElementById('sortOrder').value;
    let sortedData = [...originalData];

    if (sortOrder !== 'none') {
        sortedData.sort((a, b) => {
            const subsA = parseSubscribers(a['Subscribers']);
            const subsB = parseSubscribers(b['Subscribers']);
            return sortOrder === 'ascending' ? subsA - subsB : subsB - subsA;
        });
    }

    displayCards(sortedData);
}

// Parse Subscriber String to Number
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

// Format Subscriber Number for Display
function formatSubscribers(number) {
    if (number >= 1000000000) {
        return (number / 1000000000).toFixed(1) + 'B';
    } else if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'K';
    } else {
        return number.toString();
    }
}

// Display Channel Cards
function displayCards(data) {
    const cardsContainer = document.getElementById('cards');
    cardsContainer.innerHTML = '';
    data.forEach((channel, index) => {
        const formattedSubs = formatSubscribers(parseSubscribers(channel['Subscribers']));
        let channelName = channel['Channel Name'];

        // Truncate channel name if it exceeds 25 characters
        if (channelName.length > 25) {
            channelName = channelName.substring(0, 23) + '..';
        }

        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.innerHTML = `
            <div class="card-title">${channelName}</div>
            <div class="card-subtitle">${formattedSubs} subscribers</div>
            <a href="https://youtube.com/channel/${channel['channelId']}" target="_blank">visit channel</a>
            <label>
                <input type="checkbox" onchange="toggleVisibility(${index})" ${channel.viewed ? 'checked' : ''}> Viewed?
            </label>
        `;
        cardsContainer.appendChild(card);
    });
    updateStatistics(); // Update statistics after displaying cards
}

// Toggle Visibility of Viewed Channels
function toggleVisibility(index) {
    const card = document.querySelector(`.card[data-index='${index}']`);
    card.classList.toggle('viewed');
    originalData[index].viewed = !originalData[index].viewed;
    updateStatistics();
}

// Update Statistics
function updateStatistics() {
    const totalChannels = originalData.length;
    viewedChannels = originalData.filter(channel => channel.viewed).length;
    const remainingChannels = totalChannels - viewedChannels;

    document.getElementById('totalChannels').textContent = totalChannels;
    document.getElementById('viewedChannels').textContent = viewedChannels;
    document.getElementById('remainingChannels').textContent = remainingChannels;
}

// Dark Mode Toggle
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

function switchTheme(e) {
    if (e.target.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

toggleSwitch.addEventListener('change', switchTheme, false);

// Check for saved user preference on load
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.body.classList[currentTheme === 'dark' ? 'add' : 'remove']('dark-mode');
    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}

// Initialize Statistics Section
function initializeStatistics() {
    document.getElementById('statisticsContainer').style.display = 'flex';
    const placeholder = document.createElement('div');
    placeholder.id = 'statisticsPlaceholder';
    document.getElementById('statisticsContainer').insertAdjacentElement('beforebegin', placeholder);
    updateStatistics();
    makeStatisticsSticky();
}

// Make Statistics Sticky During Scroll
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

// Throttle Function for Optimizing Scroll Events
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

// Add Scroll Event Listener for Sticky Statistics
window.addEventListener('scroll', throttle(makeStatisticsSticky, 100));

// Initial Setup: Hide filter and statistics containers until needed
document.getElementById('filterContainer').style.display = 'none';
document.getElementById('statisticsContainer').style.display = 'none';
