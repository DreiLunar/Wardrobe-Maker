const LOCAL_API_HOSTS = [
    'http://localhost:5000',
    'http://localhost:7182',
    'https://localhost:7182'
];
let resolvedApiHost = '';

async function resolveApiHost() {
    if (resolvedApiHost) return resolvedApiHost;

    for (const host of LOCAL_API_HOSTS) {
        try {
            const response = await fetch(`${host}/api/wardrobe/stats`, { method: 'GET', mode: 'cors' });
            if (response.ok) {
                resolvedApiHost = host;
                return resolvedApiHost;
            }
        } catch {
            // Try next host
        }
    }

    resolvedApiHost = LOCAL_API_HOSTS[0];
    return resolvedApiHost;
}

async function getApiUrl(path) {
    if (window.location.protocol === 'file:') {
        const host = await resolveApiHost();
        return `${host}/api/wardrobe${path}`;
    }
    return `/api/wardrobe${path}`;
}

async function loadStats() {
    try {
        const response = await fetch(await getApiUrl('/stats'));
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

