import { parseSubscribers, formatSubscribers } from '../utils/subscribers.js';

export function createCard(channel, index) {
    const formattedSubs = formatSubscribers(parseSubscribers(channel['Subscribers']));
    const card = document.createElement('div');
    card.className = `card ${channel.viewed ? 'viewed' : ''}`;
    card.dataset.index = index;
    
    card.innerHTML = `
        <div class="card-title">${channel['Channel Name']}</div>
        <div class="card-subtitle">${formattedSubs} subscribers</div>
        <a href="https://www.youtube.com/channel/${channel.channelId}" target="_blank" rel="noopener noreferrer">
            Visit Channel
        </a>
        <label class="checkbox-wrapper">
            <input type="checkbox" onchange="toggleVisibility(${index})" ${channel.viewed ? 'checked' : ''}>
            <span class="checkmark"></span>
            Viewed
        </label>
    `;
    
    return card;
}