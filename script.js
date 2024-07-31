let originalData = [];

function loadFile(event) {
    const file = event.target.files[0];
    Papa.parse(file, {
        header: true,
        complete: function(results) {
            originalData = results.data;
            console.log("Loaded data:", originalData);
            displayCards(originalData);
            setupFilterOptions();
        }
    });
}

function setupFilterOptions() {
    const filterContainer = document.createElement('div');
    filterContainer.innerHTML = `
        <label for="sortOrder">Sort by Subscribers:</label>
        <select id="sortOrder" onchange="applySorting()">
            <option value="none">None</option>
            <option value="ascending">Ascending</option>
            <option value="descending">Descending</option>
        </select>
    `;
    document.body.insertBefore(filterContainer, document.getElementById('cards'));
}

function applySorting() {
    const sortOrder = document.getElementById('sortOrder').value;
    console.log("Applying sort order:", sortOrder);
    
    let sortedData = [...originalData];

    if (sortOrder !== 'none') {
        sortedData.sort((a, b) => {
            const subsA = parseSubscribers(a['Subscribers']);
            const subsB = parseSubscribers(b['Subscribers']);
            console.log(`Comparing: ${a['Channel Name']} (${subsA}) vs ${b['Channel Name']} (${subsB})`);
            return sortOrder === 'ascending' ? subsA - subsB : subsB - subsA;
        });
    }

    console.log("Sorted data:", sortedData);
    displayCards(sortedData);
}

function parseSubscribers(subString) {
    if (!subString) return 0;
    
    // Remove any commas and convert K/M/B to actual numbers
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

function displayCards(data) {
    const cardsContainer = document.getElementById('cards');
    cardsContainer.innerHTML = '';
    data.forEach((channel, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.innerHTML = `
            <div class="card-title">${channel['Channel Name']}</div>
            <div class="card-titlee">${channel['Subscribers']} subscribers</div>
            <div><a href="https://www.youtube.com/channel/${channel['channelId']}" target="_blank">visit channel</a></div>
            <div>
                <label>
                    <input type="checkbox" onchange="toggleVisibility(${index})"> Viewed?
                </label>
            </div>
        `;
        cardsContainer.appendChild(card);
    });
}

function toggleVisibility(index) {
    const card = document.querySelector(`.card[data-index='${index}']`);
    card.style.display = card.style.display === 'none' ? '' : 'none';
}
