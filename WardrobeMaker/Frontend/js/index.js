const getApiUrl = async (path) => {
    if (window.WardrobeCore && typeof window.WardrobeCore.getApiUrl === 'function') {
        return await window.WardrobeCore.getApiUrl(path);
    }
    // Fallback to default local path
    return `/api/wardrobe${path}`;
};

async function loadStats() {
    try {
        const response = await fetch(await getApiUrl('/stats'));
        if (!response.ok) throw new Error('API Offline');
        const stats = await response.json();

        // Update numbers immediately (No counting animation)
        document.getElementById('total-items').innerText = stats.totalItems || 0;
        document.getElementById('clean-items').innerText = stats.cleanItems || 0;
        document.getElementById('in-laundry').innerText = stats.inLaundry || 0;
        document.getElementById('saved-outfits').innerText = stats.savedOutfits || 0;
        document.getElementById('scheduled').innerText = stats.scheduled || 0;
        
    } catch (err) {
        console.warn('Backend connection lost. Check if API is running.');
    }
}

document.addEventListener('visibilitychange', () => { if (!document.hidden) loadStats(); });
window.addEventListener('focus', loadStats);
window.addEventListener('DOMContentLoaded', loadStats);