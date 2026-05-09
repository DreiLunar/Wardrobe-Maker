if (typeof window.getApiUrl === 'undefined') {
    window.getApiUrl = async function(path) {
        if (window.WardrobeCore && typeof window.WardrobeCore.getApiUrl === 'function') {
            return await window.WardrobeCore.getApiUrl(path);
        }
        return `/api/wardrobe${path}`;
    };
}

function showInlineError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) { el.textContent = message; el.classList.remove('hidden'); }
}

function hideInlineError(elementId) {
    const el = document.getElementById(elementId);
    if (el) { el.classList.add('hidden'); }
}

const WardrobeApp = {
    selectedCategory: null,
    selectedDressLength: 'Knee',
    items: [],

    async init() {
        await this.loadItems();
        const filterEl = document.getElementById('catFilter');
        if (filterEl) {
            filterEl.addEventListener('change', (e) => this.render(e.target.value));
        }
    },

    renderLoading() {
        const gridIds = ['topsGrid', 'bottomsGrid', 'dressesGrid', 'footwearGrid'];
        gridIds.forEach((id) => {
            const grid = document.getElementById(id);
            if (!grid) return;
            grid.innerHTML = Array.from({ length: 2 }, () => `
                <div class="bg-white p-4 rounded-[2rem] border border-[#e6e0d5]">
                    <div class="w-full h-48 rounded-[1.5rem] skeleton-shimmer mb-4"></div>
                    <div class="h-4 w-2/3 rounded-full skeleton-shimmer mb-2"></div>
                    <div class="h-3 w-1/2 rounded-full skeleton-shimmer"></div>
                </div>
            `).join('');
        });
    },

    animateFadeIn(element) {
        if (!element) return;
        element.classList.remove('ui-fade-in');
        void element.offsetWidth;
        element.classList.add('ui-fade-in');
    },

    openAnimatedModal(modal) {
        if (!modal) return;
        modal.classList.remove('modal-closing');
        modal.classList.remove('hidden');
        modal.classList.add('modal-open');
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        const panel = modal.querySelector('.modal-panel');
        if (panel) {
            panel.classList.remove('hidden');
            panel.classList.remove('opacity-0', 'scale-95');
            panel.style.display = 'block';
            panel.style.visibility = 'visible';
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0) scale(1)';
        }
        requestAnimationFrame(() => modal.classList.add('modal-open'));
    },

    closeAnimatedModal(modal) {
        if (!modal) return;
        modal.classList.remove('modal-open');
        modal.classList.add('modal-closing');
        const panel = modal.querySelector('.modal-panel');
        if (panel) {
            panel.style.opacity = '';
            panel.style.transform = '';
            panel.style.visibility = '';
        }
        setTimeout(() => {
            modal.classList.remove('modal-closing');
            modal.style.display = 'none';
            modal.classList.add('hidden');
            modal.style.opacity = '';
            modal.style.pointerEvents = '';
            if (panel) {
                panel.style.display = '';
            }
        }, 200);
    },

    async loadItems() {
        this.renderLoading();
        try {
            const response = await fetch(await getApiUrl('/inventory'));
            if (!response.ok) throw new Error('Failed to load inventory');
            this.items = await response.json();
            this.render();
        } catch (err) {
            console.error('Error loading inventory:', err);
        }
    },

    openModal() {
        const modal = document.getElementById('addItemModal');
        this.openAnimatedModal(modal);
        this.resetModal();
    },

    closeModal() {
        const modal = document.getElementById('addItemModal');
        this.closeAnimatedModal(modal);
        this.resetModal();
    },

    resetModal() {
        document.getElementById('itemName').value = '';
        document.getElementById('itemColor').value = '';
        document.getElementById('itemTags').value = '';
        document.getElementById('itemPhoto').value = '';
        document.getElementById('uploadPrompt').style.display = 'block';
        document.getElementById('previewContainer').classList.add('hidden');
        document.getElementById('imagePreview').src = '#';
        this.selectedCategory = null;
        this.selectedDressLength = 'Knee';

        document.querySelectorAll('.cat-choice').forEach(btn => {
            btn.classList.remove('bg-[#8c7862]', 'text-white', 'border-[#8c7862]');
            btn.classList.add('text-gray-500', 'border-[#e6e0d5]');
        });
        
        const dressLengthContainer = document.getElementById('dressLengthContainer');
        if (dressLengthContainer) dressLengthContainer.classList.add('hidden');
        hideInlineError('modalError');
    },

    selectCat(el, cat) {
        document.querySelectorAll('.cat-choice').forEach(btn => {
            btn.classList.remove('bg-[#8c7862]', 'text-white', 'border-[#8c7862]');
            btn.classList.add('text-gray-500', 'border-[#e6e0d5]');
        });
        el.classList.add('bg-[#8c7862]', 'text-white', 'border-[#8c7862]');
        this.selectedCategory = cat;
        
        const dlc = document.getElementById('dressLengthContainer');
        if (dlc) cat === 'Dress' ? dlc.classList.remove('hidden') : dlc.classList.add('hidden');
    },

    selectDressLength(el, length) {
        document.querySelectorAll('.dress-length-choice').forEach(btn => {
            btn.classList.remove('bg-[#8c7862]', 'text-white', 'border-[#8c7862]');
        });
        el.classList.add('bg-[#8c7862]', 'text-white');
        this.selectedDressLength = length;
    },

    previewImage(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('imagePreview').src = e.target.result;
                document.getElementById('previewContainer').classList.remove('hidden');
                document.getElementById('uploadPrompt').style.display = 'none';
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    async saveItem() {
        const name = document.getElementById('itemName').value.trim();
        const color = document.getElementById('itemColor').value.trim();
        const tagsStr = document.getElementById('itemTags').value.trim();
        const fileInput = document.getElementById('itemPhoto');

        if (!name || !color || !this.selectedCategory) {
            showInlineError('modalError', 'Please fill in all required fields.');
            return;
        }

        let imagePath = '';
        if (fileInput.files && fileInput.files[0]) {
            const uploadForm = new FormData();
            uploadForm.append('file', fileInput.files[0]);
            try {
                const res = await fetch(await getApiUrl('/upload'), { method: 'POST', body: uploadForm });
                if (!res.ok) throw new Error();
                const data = await res.json();
                imagePath = data.filePath;
            } catch {
                showInlineError('modalError', 'Photo upload failed.');
                return;
            }
        }

        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : [];
        const itemId = `${this.selectedCategory.substring(0, 3).toUpperCase()}-${Date.now()}`;
        const extra = this.selectedCategory === 'Dress' ? this.selectedDressLength : 'Regular';

        try {
            const response = await fetch(await getApiUrl('/add'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemID: itemId, name, primaryColor: color, tags, type: this.selectedCategory, extra, imageFilePath: imagePath })
            });
            if (!response.ok) throw new Error();
            this.closeModal();
            await this.loadItems();
        } catch {
            showInlineError('modalError', 'Failed to save item.');
        }
    },

    async toggleLaundry(itemId) {
        try {
            const response = await fetch(await getApiUrl(`/toggle/${itemId}`), { method: 'POST' });
            if (response.ok) {
                const item = this.items.find(i => i.itemID === itemId);
                if (item) {
                    item.isClean = !item.isClean;
                    this.render(document.getElementById('catFilter')?.value || 'All');
                }
            }
        } catch (err) { console.error(err); }
    },

    async deleteItem(eventOrItemId, maybeItemId) {
        const eventObj = typeof eventOrItemId === 'string' ? null : eventOrItemId;
        const sourceEl = eventObj?.currentTarget ?? null;
        const itemId = typeof eventOrItemId === 'string' ? eventOrItemId : maybeItemId;
        if (eventObj) {
            eventObj.preventDefault();
            eventObj.stopPropagation();
        }
        if (!confirm('Delete this item?')) return;
        try {
            const response = await fetch(await getApiUrl(`/inventory/${itemId}`), { method: 'DELETE' });
            if (response.ok) {
                const cardElement = sourceEl?.closest?.('.wardrobe-item-card');
                if (cardElement) {
                    cardElement.classList.add('deleting-exit');
                    await new Promise(resolve => setTimeout(resolve, 260));
                }
                this.items = this.items.filter(i => i.itemID !== itemId);
                this.render(document.getElementById('catFilter')?.value || 'All');
            }
        } catch (err) { console.error(err); }
    },

    render(filter = 'All') {
        const categories = [
            { type: 'Top', gridId: 'topsGrid', countId: 'topsCount', icon: 'fa-shirt' },
            { type: 'Bottom', gridId: 'bottomsGrid', countId: 'bottomsCount', icon: 'fa-venus-mars' },
            { type: 'Dress', gridId: 'dressesGrid', countId: 'dressesCount', icon: 'fa-vest-patches' },
            { type: 'Footwear', gridId: 'footwearGrid', countId: 'footwearCount', icon: 'fa-shoe-prints' }
        ];

        const gridContainer = document.getElementById('wardrobeColumns');
        
        if (gridContainer) {
            if (filter !== 'All') {
                gridContainer.classList.remove('md:grid-cols-2', 'lg:grid-cols-4');
                gridContainer.classList.add('grid-cols-1');
            } else {
                gridContainer.classList.remove('grid-cols-1');
                gridContainer.classList.add('md:grid-cols-2', 'lg:grid-cols-4');
            }
        }

        let totalCount = 0;
        categories.forEach(cat => {
            const grid = document.getElementById(cat.gridId);
            const countEl = document.getElementById(cat.countId);
            const columnEl = grid?.closest('.wardrobe-column');
            let items = this.items.filter(i => i.type === cat.type);
            
            if (filter !== 'All' && cat.type !== filter) {
                if (columnEl) columnEl.style.display = 'none';
                return;
            }
            
            if (columnEl) columnEl.style.display = '';

            if (filter !== 'All') {
                grid.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
            } else {
                grid.className = "flex flex-col gap-4";
            }
            
            totalCount += items.length;
            if (countEl) countEl.innerText = items.length;

            if (items.length === 0) {
                grid.innerHTML = `<div class="empty-column-state"><i class="fas ${cat.icon} text-[#e6e0d5] text-4xl mb-3"></i><p class="text-gray-400 text-sm">No items yet</p></div>`;
            } else {
                grid.innerHTML = items.map(item => this.renderItemCard(item)).join('');
            }
            this.animateFadeIn(grid);
        });

        const totalCountEl = document.getElementById('itemCount');
        if (totalCountEl) totalCountEl.innerText = totalCount;
    },

    renderItemCard(item) {
        const img = item.imageFilePath 
            ? `<img src="${item.imageFilePath}" class="w-full h-48 object-contain bg-[#f5f5f0] rounded-[1.5rem] mb-4">`
            : `<div class="w-full h-48 bg-gray-100 rounded-[1.5rem] flex items-center justify-center mb-4"><i class="fas fa-tshirt text-gray-300 text-4xl"></i></div>`;
        
        const tags = item.tags?.map(t => `<span class="text-[10px] bg-[#f2ede4] text-[#8c7862] px-2 py-1 rounded-full font-bold uppercase">${t}</span>`).join('') || '';
        const badge = item.isClean 
            ? `<span class="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase">Clean</span>`
            : `<span class="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold uppercase">In Laundry</span>`;

        return `
            <div class="wardrobe-item-card bg-white p-4 rounded-[2rem] shadow-sm border border-[#e6e0d5] hover:shadow-md transition group">
                ${img}
                <div class="px-2 pb-2">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-bold text-gray-800">${item.name}</h4>
                        <button onclick="WardrobeApp.deleteItem(event, '${item.itemID}')" class="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><i class="fas fa-trash-alt"></i></button>
                    </div>
                    <div class="flex flex-wrap gap-1 mb-3">${tags}</div>
                    <div class="flex justify-between items-center">${badge}<button onclick="WardrobeApp.toggleLaundry('${item.itemID}')" class="text-xs font-bold text-[#8c7862] hover:text-[#4a4238] flex items-center gap-1"><i class="fas fa-sync-alt"></i> Toggle</button></div>
                </div>
            </div>`;
    }
};

window.addEventListener('DOMContentLoaded', () => WardrobeApp.init());
