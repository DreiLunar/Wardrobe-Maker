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

console.log('[Wardrobe Maker] App initialized');
