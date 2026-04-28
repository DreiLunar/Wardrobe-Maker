const API_URL = '/api/wardrobe';

async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        if (!response.ok) throw new Error('Failed to load stats');
        const stats = await response.json();
        
        const setStat = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.innerText = value;
        };

        setStat('total-items', stats.totalItems);
        setStat('clean-items', stats.cleanItems);
        setStat('in-laundry', stats.inLaundry);
        setStat('saved-outfits', stats.savedOutfits);
        setStat('scheduled', stats.scheduled);
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

// Refresh stats when page becomes visible (user may have added/deleted items from other pages)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadStats();
    }
});

// Also refresh on focus
window.addEventListener('focus', loadStats);

window.addEventListener('DOMContentLoaded', loadStats);

