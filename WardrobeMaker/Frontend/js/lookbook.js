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

const LookbookApp = {
    outfits: [],

    async init() {
        await this.loadOutfits();
    },

    async loadOutfits() {
        try {
            const response = await fetch(await getApiUrl('/lookbook'));
            if (!response.ok) throw new Error('Failed to load lookbook');
            this.outfits = await response.json();
            this.render();
        } catch (err) {
            console.error('Error loading lookbook:', err);
        }
    },

    render() {
        const grid = document.getElementById('lookbookGrid');
        const emptyState = document.getElementById('emptyState');
        const controls = document.getElementById('lookbookControls');
        const countDisplay = document.getElementById('outfitCount');

        if (countDisplay) countDisplay.innerText = this.outfits.length;

        if (this.outfits.length === 0) {
            grid.innerHTML = '';
            grid.appendChild(emptyState);
            emptyState.style.display = 'block';
            if (controls) controls.classList.add('hidden');
            return;
        }

        emptyState.style.display = 'none';
        if (controls) controls.classList.remove('hidden');

        grid.innerHTML = this.outfits.map((outfit) => {
            const items = [outfit.top, outfit.bottom, outfit.shoes];
            const imagesHtml = items.map(item => {
                return item.imageFilePath
                    ? `<div class="stack-item"><img src="${item.imageFilePath}" alt="${item.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\'fas fa-tshirt text-gray-300\'></i>';"></div>`
                    : `<div class="stack-item"><i class="fas fa-tshirt text-gray-300"></i></div>`;
            }).join('');

            const scheduledHtml = outfit.scheduledDate
                ? `<span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter"><i class="fas fa-calendar-alt mr-1"></i> ${outfit.scheduledDate}</span>`
                : '';

            return `
            <div class="outfit-card relative group bg-white p-6 rounded-[2rem] shadow-sm border border-[#e6e0d5] hover:shadow-md transition">
                <div class="flex justify-between items-start mb-4">
                    ${scheduledHtml}
                    <button onclick="LookbookApp.deleteOutfit('${outfit.outfitID}')" class="delete-btn text-gray-300 hover:text-red-500 transition">
                        <i class="fas fa-times-circle text-xl"></i>
                    </button>
                </div>

                <div class="image-stack mb-4">
                    ${imagesHtml}
                </div>

                <div class="text-center">
                    <h3 class="text-lg font-bold text-gray-800 mb-1 capitalize">${outfit.outfitName}</h3>
                    <div class="flex justify-center gap-2 text-gray-400 text-[10px] font-medium uppercase tracking-widest">
                        <span>3 Items</span>
                        <span>•</span>
                        <span>${outfit.isReady ? 'Ready to Wear' : 'Items in Laundry'}</span>
                    </div>
            </div>`;
        }).join('');
    },

    async deleteOutfit(outfitId) {
        if (!confirm('Remove this look from your lookbook?')) return;
        try {
            const response = await fetch(await getApiUrl(`/lookbook/${outfitId}`), { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete outfit');
            await this.loadOutfits();
        } catch (err) {
            console.error('Error deleting outfit:', err);
        }
    },

    async clearAll() {
        if (!confirm('Are you sure you want to delete all saved outfits? This cannot be undone.')) return;
        for (const outfit of [...this.outfits]) {
            try {
                await fetch(await getApiUrl(`/lookbook/${outfit.outfitID}`), { method: 'DELETE' });
            } catch (err) {
                console.error('Error deleting outfit:', err);
            }
        }
        await this.loadOutfits();
    }
};

window.addEventListener('DOMContentLoaded', () => LookbookApp.init());
