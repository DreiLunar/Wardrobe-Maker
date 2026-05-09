const LOCAL_API_HOSTS = [
    'http://localhost:5000',
    'http://localhost:7182',
    'https://localhost:7182'
];
let resolvedApiHost = '';

function getPlaceholderHTML() {
    return `<div class="w-full h-48 bg-gray-100 rounded-[1.5rem] flex items-center justify-center mb-4"><i class="fas fa-tshirt text-gray-300 text-4xl"></i></div>`;
}

function getImageHTML(imagePath, altText = '') {
    if (!imagePath) return getPlaceholderHTML();
    return `<img src="${imagePath}" alt="${altText}" class="w-full h-48 object-cover rounded-[1.5rem] mb-4" onerror="this.parentElement.innerHTML='${getPlaceholderHTML().replace(/'/g, "\\'")}'">`;
}

function showInlineError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.classList.remove('hidden');
    }
}

function hideInlineError(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.classList.add('hidden');
    }
}

function formatDateDisplay(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

async function resolveApiHost() {
    if (resolvedApiHost) return resolvedApiHost;

    for (const host of LOCAL_API_HOSTS) {
        try {
            const response = await fetch(`${host}/api/wardrobe/stats`, { method: 'GET', mode: 'cors' });
            if (response.ok) {
                resolvedApiHost = host;
                return resolvedApiHost;
            }
        } catch {}
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

function normalizeOutfit(outfit) {
    if (!outfit || typeof outfit !== 'object') return outfit;
    return {
        outfitID: outfit.outfitID ?? outfit.outfitId ?? outfit.OutfitID ?? outfit.id ?? '',
        outfitName: outfit.outfitName ?? outfit.OutfitName ?? 'Untitled Outfit',
        top: outfit.top ?? outfit.Top ?? null,
        bottom: outfit.bottom ?? outfit.Bottom ?? null,
        dress: outfit.dress ?? outfit.Dress ?? null,
        shoes: outfit.shoes ?? outfit.Shoes ?? null,
        scheduledDate: outfit.scheduledDate ?? outfit.ScheduledDate ?? null,
        isReady: outfit.isReady ?? outfit.IsReady ?? false,
        date: outfit.date ?? outfit.Date ?? null
    };
}

function normalizeOutfits(outfits) {
    if (!Array.isArray(outfits)) return [];
    return outfits.map(normalizeOutfit);
}

function ensureToastHost() {
    let host = document.getElementById('toastHost');
    if (host) return host;
    host = document.createElement('div');
    host.id = 'toastHost';
    host.className = 'toast-host';
    document.body.appendChild(host);
    return host;
}

function showToast(message, type = 'info') {
    if (!message) return;
    const host = ensureToastHost();
    const toast = document.createElement('div');
    toast.className = `app-toast app-toast-${type}`;
    toast.textContent = message;
    host.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 220);
    }, 2200);
}

function openModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove('hidden');
    modalElement.style.display = 'flex';
    requestAnimationFrame(() => modalElement.classList.add('modal-open'));
}

function closeModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove('modal-open');
    modalElement.classList.add('modal-closing');
    setTimeout(() => {
        modalElement.classList.remove('modal-closing');
        modalElement.style.display = 'none';
        modalElement.classList.add('hidden');
    }, 200);
}

async function withPending(button, work, pendingText = 'Working...') {
    if (!button || button.dataset.pending === 'true') return;
    const originalText = button.innerHTML;
    button.dataset.pending = 'true';
    button.disabled = true;
    button.classList.add('opacity-70', 'cursor-not-allowed');
    if (pendingText) button.innerHTML = pendingText;
    try {
        await work();
    } finally {
        button.dataset.pending = 'false';
        button.disabled = false;
        button.classList.remove('opacity-70', 'cursor-not-allowed');
        button.innerHTML = originalText;
    }
}

window.WardrobeCore = {
    getApiUrl,
    normalizeOutfit,
    normalizeOutfits,
    showToast,
    openModal,
    closeModal,
    withPending
};

(() => {
    const body = document.body;
    if (!body) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        body.classList.add('page-visible');
        return;
    }

    requestAnimationFrame(() => body.classList.add('page-visible'));

    const transitionTo = (href) => {
        body.classList.add('page-leaving');
        setTimeout(() => {
            window.location.href = href;
        }, 170);
    };

    window.navigateWithTransition = (href) => {
        if (!href) return;
        transitionTo(href);
    };

    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');
        if (!link) return;
        if (link.target && link.target !== '_self') return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

        const targetUrl = new URL(link.href, window.location.href);
        const currentUrl = new URL(window.location.href);
        const isInternal = targetUrl.origin === currentUrl.origin;
        const isHashOnly = targetUrl.pathname === currentUrl.pathname &&
            targetUrl.search === currentUrl.search &&
            targetUrl.hash;

        if (!isInternal || isHashOnly) return;

        event.preventDefault();
        transitionTo(targetUrl.href);
    });

    window.addEventListener('pageshow', () => {
        body.classList.remove('page-leaving');
        body.classList.add('page-visible');
    });
})();

console.log('[Wardrobe Maker] App initialized');
