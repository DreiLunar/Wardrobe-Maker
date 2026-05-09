const { getApiUrl, normalizeOutfits, showToast, withPending } = window.WardrobeCore;

const LookbookApp = {
    outfits: [],
    emptyStateTemplate: '',

    getOutfitId(outfit) {
        return outfit?.outfitID ?? outfit?.outfitId ?? outfit?.OutfitID ?? outfit?.id;
    },

    async init() {
        const emptyStateEl = document.getElementById('emptyState');
        this.emptyStateTemplate = emptyStateEl?.outerHTML ?? '';
        await this.loadOutfits();
    },

    renderLoading() {
        const grid = document.getElementById('lookbookGrid');
        const controls = document.getElementById('lookbookControls');
        if (!grid) return;

        if (controls) controls.classList.add('hidden');
        grid.innerHTML = Array.from({ length: 6 }, () => `
            <div class="bg-white p-6 rounded-[2rem] border border-[#e6e0d5]">
                <div class="h-5 w-20 rounded-full skeleton-shimmer mb-4"></div>
                <div class="h-40 rounded-2xl skeleton-shimmer mb-4"></div>
                <div class="h-4 w-3/4 rounded-full skeleton-shimmer mx-auto mb-2"></div>
                <div class="h-3 w-1/2 rounded-full skeleton-shimmer mx-auto"></div>
            </div>
        `).join('');
    },

    animateFadeIn(element) {
        if (!element) return;
        element.classList.remove('ui-fade-in');
        void element.offsetWidth;
        element.classList.add('ui-fade-in');
    },

    async loadOutfits() {
        this.renderLoading();
        try {
            const response = await fetch(await getApiUrl('/lookbook'), { cache: 'no-store' });
            if (!response.ok) throw new Error('Failed to load lookbook');
            this.outfits = normalizeOutfits(await response.json());
            this.render();
        } catch (err) {
            console.error('Error loading lookbook:', err);
            const grid = document.getElementById('lookbookGrid');
            const controls = document.getElementById('lookbookControls');
            if (controls) controls.classList.add('hidden');
            if (grid) {
                grid.innerHTML = '<div class="col-span-full text-center text-sm text-gray-400 py-12">Unable to load looks right now.</div>';
            }
        }
    },

    render() {
        const grid = document.getElementById('lookbookGrid');
        const controls = document.getElementById('lookbookControls');
        const countDisplay = document.getElementById('outfitCount');
        if (!grid) return;

        if (countDisplay) countDisplay.innerText = this.outfits.length;

        if (this.outfits.length === 0) {
            if (!this.emptyStateTemplate) {
                this.emptyStateTemplate = '<div id="emptyState" class="col-span-full empty-container py-32 text-center mt-4"><h2 class="text-3xl font-bold text-gray-800 mb-3">Your Lookbook is Empty</h2></div>';
            }
            grid.innerHTML = this.emptyStateTemplate;
            const emptyState = document.getElementById('emptyState');
            if (emptyState) {
                emptyState.style.display = 'block';
                this.animateFadeIn(emptyState);
            }
            if (controls) controls.classList.add('hidden');
            return;
        }

        if (controls) controls.classList.remove('hidden');

        grid.innerHTML = this.outfits.map((outfit) => {
            const outfitId = this.getOutfitId(outfit);
            const itemSlots = outfit?.dress
                ? [
                    { item: outfit.dress, label: 'Dress', cssClass: 'dress-item' },
                    { item: outfit.shoes, label: 'Shoes' }
                ]
                : [
                    { item: outfit?.top, label: 'Top' },
                    { item: outfit?.bottom, label: 'Bottom' },
                    { item: outfit?.shoes, label: 'Shoes' }
                ];
            const imagesHtml = itemSlots.map(({ item, label, cssClass }) => {
                const imagePath = item?.imageFilePath;
                const itemName = item?.name ?? label;
                const itemClass = cssClass ? `lookbook-item ${cssClass}` : 'lookbook-item';
                return imagePath
                    ? `<div class="${itemClass}"><img src="${imagePath}" alt="${itemName}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\'fas fa-tshirt text-gray-300 text-2xl\'></i>';"><span class="item-label">${label}</span></div>`
                    : `<div class="${itemClass}"><i class="fas fa-tshirt text-gray-300 text-2xl"></i><span class="item-label">${label}</span></div>`;
            }).join('');

            const scheduledHtml = outfit.scheduledDate
                ? `<span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter"><i class="fas fa-calendar-alt mr-1"></i> ${outfit.scheduledDate}</span>`
                : '';

            return `
            <div class="outfit-card relative group bg-white p-6 rounded-[2rem] shadow-sm border border-[#e6e0d5] hover:shadow-md transition" data-outfit-id="${outfitId ?? ''}">
                <div class="flex justify-between items-start mb-4">
                    ${scheduledHtml}
                    <button onclick="LookbookApp.deleteOutfit(event, this, '${outfitId}')" class="delete-btn text-gray-300 hover:text-red-500 transition">
                        <i class="fas fa-times-circle text-xl"></i>
                    </button>
                </div>

                <div class="image-grid mb-4">
                    ${imagesHtml}
                </div>

                <div class="text-center">
                    <h3 class="text-lg font-bold text-gray-800 mb-1 capitalize">${outfit.outfitName ?? outfit.OutfitName ?? 'Untitled Outfit'}</h3>
                    <div class="flex justify-center gap-2 text-gray-400 text-[10px] font-medium uppercase tracking-widest">
                        <span>${itemSlots.length} Items</span>
                        <span>•</span>
                        <span>${outfit.isReady ? 'Ready to Wear' : 'Items in Laundry'}</span>
                    </div>
                </div> 
            </div>`;
        }).join('');
        this.animateFadeIn(grid);
    },

    async deleteOutfit(event, sourceOrOutfitId, maybeOutfitId) {
        event.preventDefault();
        event.stopPropagation();
        const sourceEl = typeof sourceOrOutfitId === 'string' ? null : sourceOrOutfitId;
        const outfitId = typeof sourceOrOutfitId === 'string' ? sourceOrOutfitId : maybeOutfitId;
        console.log('Attempting to delete outfit ID:', outfitId);
        if (!confirm('Remove this look from your lookbook?')) return;
        await withPending(sourceEl, async () => {
        try {
            const response = await fetch(await getApiUrl(`/lookbook/${outfitId}`), { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete outfit');
            const cardElement = sourceEl?.closest?.('.outfit-card');
            if (cardElement) {
                cardElement.classList.add('removing');
                await new Promise(resolve => setTimeout(resolve, 260));
            }
            const originalCount = this.outfits.length;
            this.outfits = this.outfits.filter(o => String(this.getOutfitId(o)) !== String(outfitId));
            if (this.outfits.length === originalCount) {
                await this.loadOutfits();
                return;
            }
            this.render();
            showToast('Look removed.', 'success');
        } catch (err) {
            console.error('Error deleting outfit:', err);
            showToast('Failed to remove look.', 'error');
        }
        }, 'Removing...');
    },

    async clearAll(buttonElement) {
        if (!confirm('Are you sure you want to delete all saved outfits? This cannot be undone.')) return;
        await withPending(buttonElement, async () => {
            const outfitsToDelete = [...this.outfits];
            const deleteResults = await Promise.allSettled(
                outfitsToDelete.map(async (outfit) => {
                    const outfitId = this.getOutfitId(outfit);
                    if (!outfitId) return { ok: false, outfitId: null };
                    const response = await fetch(await getApiUrl(`/lookbook/${outfitId}`), { method: 'DELETE' });
                    return { ok: response.ok, outfitId: String(outfitId) };
                })
            );

            const deletedIds = new Set(
                deleteResults
                    .filter(r => r.status === 'fulfilled' && r.value.ok && r.value.outfitId)
                    .map(r => r.value.outfitId)
            );

            if (deletedIds.size > 0) {
                document.querySelectorAll('.outfit-card').forEach((card) => {
                    const cardId = card.getAttribute('data-outfit-id');
                    if (cardId && deletedIds.has(cardId)) {
                        card.classList.add('removing');
                    }
                });
                await new Promise(resolve => setTimeout(resolve, 260));
                this.outfits = this.outfits.filter(o => !deletedIds.has(String(this.getOutfitId(o))));
                this.render();
                showToast('Looks cleared.', 'success');
            }

            if (deletedIds.size !== outfitsToDelete.length) {
                await this.loadOutfits();
            }
        }, 'Clearing...');
    }
};

window.LookbookApp = LookbookApp;

window.addEventListener('DOMContentLoaded', () => LookbookApp.init());
