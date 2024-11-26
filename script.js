// Global state
let originalData = [];
let viewedChannels = 0;

// Load saved data from localStorage on startup
function initializeLocalStorage() {
    const savedData = localStorage.getItem('channelData');
    if (savedData) {
        originalData = JSON.parse(savedData);
        displayCards(originalData);
        document.getElementById('filterContainer').style.display = 'block';
        initializeStatistics();
    }
}

// Save data to localStorage
function saveToLocalStorage() {
    localStorage.setItem('channelData', JSON.stringify(originalData));
}

function loadFile(event) {
    const file = event.target.files[0];
    if (file) {
        updateFileInputButton(file.name);
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                originalData = results.data.map(channel => ({
                    ...channel,
                    viewed: false // Ensure viewed property exists
                }));
                saveToLocalStorage(); // Save immediately after loading
                displayCards(originalData);
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
    } else {
        return number.toString();
    }
}

function displayCards(data) {
    const cardsContainer = document.getElementById('cards');
    cardsContainer.innerHTML = '';
    data.forEach((channel, index) => {
        const formattedSubs = formatSubscribers(parseSubscribers(channel['Subscribers']));
        const card = document.createElement('div');
        card.className = 'card';
        if (channel.viewed) {
            card.classList.add('viewed');
        }
        card.dataset.index = index;
        card.innerHTML = `
            <div class="card-title">${channel['Channel Name']}</div>
            <div class="card-subtitle">${formattedSubs} subscribers</div>
            <a href="https://www.youtube.com/channel/${channel['channelId']}" target="_blank">visit channel</a>
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
    originalData[index].viewed = !originalData[index].viewed;
    updateStatistics();
    saveToLocalStorage(); // Save after toggling visibility
}

function updateStatistics() {
    const totalChannels = originalData.length;
    viewedChannels = originalData.filter(channel => channel.viewed).length;
    const remainingChannels = totalChannels - viewedChannels;

    document.getElementById('totalChannels').textContent = totalChannels;
    document.getElementById('viewedChannels').textContent = viewedChannels;
    document.getElementById('remainingChannels').textContent = remainingChannels;
}

function initializeStatistics() {
    const statsContainer = document.getElementById('statisticsContainer');
    const themeSwitch = document.querySelector('.theme-switch-wrapper');
    
    statsContainer.style.display = 'flex';
    
    // Create placeholder with proper spacing
    let placeholder = document.getElementById('statisticsPlaceholder');
    if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.id = 'statisticsPlaceholder';
        statsContainer.insertAdjacentElement('beforebegin', placeholder);
    }
    
    updateStatistics();
    makeStatisticsSticky();
}

function makeStatisticsSticky() {
    const statsContainer = document.getElementById('statisticsContainer');
    const themeSwitch = document.querySelector('.theme-switch-wrapper');
    const placeholder = document.getElementById('statisticsPlaceholder');
    const h1 = document.querySelector('h1');
    
    const statsRect = statsContainer.getBoundingClientRect();
    const h1Rect = h1.getBoundingClientRect();
    
    if (window.pageYOffset > statsRect.top) {
        if (!statsContainer.classList.contains('sticky')) {
            statsContainer.classList.add('sticky');
            placeholder.style.height = `${statsRect.height}px`;
            
            // Ensure theme switch stays visible
            themeSwitch.style.position = 'fixed';
            themeSwitch.style.top = `${statsRect.height + 10}px`; // Add padding
        }
    } else {
        statsContainer.classList.remove('sticky');
        placeholder.style.height = '0';
        themeSwitch.style.position = 'absolute';
        themeSwitch.style.top = '25px';
    }
}

// Throttle function to limit the rate at which a function can fire
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

// Dark mode toggle functionality
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize local storage
    initializeLocalStorage();
    
    // Add throttled scroll listener
    window.addEventListener('scroll', throttle(makeStatisticsSticky, 100));
    
    // Initialize theme
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.body.classList[currentTheme === 'dark' ? 'add' : 'remove']('dark-mode');
        if (currentTheme === 'dark') {
            toggleSwitch.checked = true;
        }
    }
    
    // Add theme switch event listener
    toggleSwitch.addEventListener('change', switchTheme, false);
    
    // Hide containers initially
    document.getElementById('filterContainer').style.display = 'none';
    document.getElementById('statisticsContainer').style.display = 'none';
});
