let originalData = [];

function loadFile(event) {
    const file = event.target.files[0];
    Papa.parse(file, {
        header: true,
        complete: function(results) {
            originalData = results.data;
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
    let sortedData = [...originalData];

    if (sortOrder !== 'none') {
        sortedData.sort((a, b) => {
            const subsA = parseInt(a['Subscribers'].replace(/,/g, ''));
            const subsB = parseInt(b['Subscribers'].replace(/,/g, ''));
            return sortOrder === 'ascending' ? subsA - subsB : subsB - subsA;
        });
    }

    displayCards(sortedData);
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
