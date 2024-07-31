function loadFile(event) {
    const file = event.target.files[0];
    Papa.parse(file, {
        header: true,
        complete: function(results) {
            displayCards(results.data);
        }
    });
}

function displayCards(data) {
    const cardsContainer = document.getElementById('cards');
    cardsContainer.innerHTML = '';
    data.forEach((channel, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index; // Store index for filtering
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
