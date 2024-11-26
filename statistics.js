export function updateStatistics(channels) {
    const totalChannels = channels.length;
    const viewedChannels = channels.filter(channel => channel.viewed).length;
    const remainingChannels = totalChannels - viewedChannels;

    document.getElementById('totalChannels').textContent = totalChannels;
    document.getElementById('viewedChannels').textContent = viewedChannels;
    document.getElementById('remainingChannels').textContent = remainingChannels;
}

export function initializeStatistics() {
    const statsContainer = document.getElementById('statisticsContainer');
    if (statsContainer) {
        statsContainer.style.display = 'flex';
    }
}