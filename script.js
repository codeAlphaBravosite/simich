let originalData = [];
let viewedChannels = 0;

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

function truncateTitle(title, maxLength = 25) {
    if (title.length <= maxLength) {
        return title;
    }
    return title.slice(0, 23) + '..';
}

function displayCards(data) {
    const cardsContainer = document.getElementById('cards');
    cardsContainer.innerHTML = '';
    data.forEach((channel, index) => {
        const formattedSubs = formatSubscribers(parseSubscribers(channel['Subscribers']));
        const truncatedTitle = truncateTitle(channel['Channel Name']);
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.innerHTML = `
            <div class="card-title" title="${channel['Channel Name']}">${truncatedTitle}</div>
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
}

function updateStatistics() {
    const totalChannels = originalData.length;
    viewedChannels = originalData.filter(channel => channel.viewed).length;
    const remainingChannels = totalChannels - viewedChannels;

    document.getElementById('totalChannels').textContent = totalChannels;
    document.getElementById('viewedChannels').textContent = viewedChannels;
    document.getElementById('remainingChannels').textContent = remainingChannels;
}

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

const currentTheme = localStorage.
