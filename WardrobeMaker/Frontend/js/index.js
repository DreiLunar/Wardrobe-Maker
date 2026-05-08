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
            const response = await fetch(`${host}/api/wardrobe/stats`, { 
                method: 'GET', 
                mode: 'cors',
                signal: AbortSignal.timeout(1200) 
            });
            if (response.ok) {
                resolvedApiHost = host;
                return resolvedApiHost;
            }
        } catch { continue; }
    }
    resolvedApiHost = LOCAL_API_HOSTS[0];
    return resolvedApiHost;
}

async function getApiUrl(path) {
    const host = window.location.protocol === 'file:' ? await resolveApiHost() : '';
    return `${host}/api/wardrobe${path}`;
}

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