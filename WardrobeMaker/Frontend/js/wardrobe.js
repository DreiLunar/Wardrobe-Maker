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
            const statsResponse = await fetch(`${host}/api/wardrobe/stats`, { method: 'GET', mode: 'cors' });
            if (statsResponse.ok) {
                resolvedApiHost = host;
                return resolvedApiHost;
            }
        } catch {
            // try next host
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

function getPlaceholderDiv() {
    return `<div class="w-full h-48 bg-gray-100 rounded-[1.5rem] flex items-center justify-center mb-4"><i class="fas fa-tshirt text-gray-300 text-4xl"></i></div>`;
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
    uploadedImagePath: '',

    async init() {
        await this.loadItems();
        const filterEl = document.getElementById('catFilter');
        if (filterEl) {
            filterEl.addEventListener('change', (e) => this.render(e.target.value));
        }
    },

    async loadItems() {
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
        if (modal) modal.style.display = 'flex';
        this.resetModal();
    },

    closeModal() {
        const modal = document.getElementById('addItemModal');
        if (modal) modal.style.display = 'none';
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
        this.uploadedImagePath = '';
        this.selectedCategory = null;
        this.selectedDressLength = 'Knee';

        document.querySelectorAll('.cat-choice').forEach(btn => {
            btn.classList.remove('bg-[#8c7862]', 'text-white', 'border-[#8c7862]');
            btn.classList.add('text-gray-500', 'border-[#e6e0d5]');
        });
        // No category is highlighted by default
        
        // Reset dress length buttons
        document.querySelectorAll('.dress-length-choice').forEach(btn => {
            btn.classList.remove('bg-[#8c7862]', 'text-white', 'border-[#8c7862]');
            btn.classList.add('text-gray-500', 'border-[#e6e0d5]');
        });
        const firstLengthBtn = document.querySelector('.dress-length-choice');
        if (firstLengthBtn) {
            firstLengthBtn.classList.add('bg-[#8c7862]', 'text-white', 'border-[#8c7862]');
            firstLengthBtn.classList.remove('text-gray-500', 'border-[#e6e0d5]');
        }
        
        // Hide dress length container by default
        const dressLengthContainer = document.getElementById('dressLengthContainer');
        if (dressLengthContainer) {
            dressLengthContainer.classList.add('hidden');
        }
        
        hideInlineError('modalError');
    },

    selectCat(el, cat) {
        document.querySelectorAll('.cat-choice').forEach(btn => {
            btn.classList.remove('bg-[#8c7862]', 'text-white', 'border-[#8c7862]');
            btn.classList.add('text-gray-500', 'border-[#e6e0d5]');
        });
        el.classList.add('bg-[#8c7862]', 'text-white', 'border-[#8c7862]');
        el.classList.remove('text-gray-500', 'border-[#e6e0d5]');
        this.selectedCategory = cat;
        
        // Show/hide dress length field
        const dressLengthContainer = document.getElementById('dressLengthContainer');
        if (dressLengthContainer) {
            if (cat === 'Dress') {
                dressLengthContainer.classList.remove('hidden');
            } else {
                dressLengthContainer.classList.add('hidden');
            }
        }
    },
    
    selectDressLength(el, length) {
        document.querySelectorAll('.dress-length-choice').forEach(btn => {
            btn.classList.remove('bg-[#8c7862]', 'text-white', 'border-[#8c7862]');
            btn.classList.add('text-gray-500', 'border-[#e6e0d5]');
        });
        el.classList.add('bg-[#8c7862]', 'text-white', 'border-[#8c7862]');
        el.classList.remove('text-gray-500', 'border-[#e6e0d5]');
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

        if (!name) { showInlineError('modalError', 'Please enter an item name.'); return; }
        if (!color) { showInlineError('modalError', 'Please enter a primary color.'); return; }
        if (!this.selectedCategory) { showInlineError('modalError', 'Please select a clothing category.'); return; }

        hideInlineError('modalError');

        let imagePath = '';
        if (fileInput.files && fileInput.files[0]) {
            const photoFile = fileInput.files[0];
            const uploadForm = new FormData();
            uploadForm.append('file', photoFile);
            try {
                const uploadUrl = await getApiUrl('/upload');
                const uploadRes = await fetch(uploadUrl, { method: 'POST', body: uploadForm, mode: 'cors' });

                if (!uploadRes.ok) {
                    let errorMsg = 'Upload failed.';
                    try {
                        const err = await uploadRes.json();
                        errorMsg = err.message || errorMsg;
                    } catch {
                        errorMsg = `Server error (${uploadRes.status}): ${uploadRes.statusText}`;
                    }
                    showInlineError('modalError', errorMsg);
                    return;
                }
                const uploadData = await uploadRes.json();
                imagePath = uploadData.filePath;
            } catch (err) {
                console.error('Upload error:', err);
                const message = window.location.protocol === 'file:'
                    ? 'Failed to upload photo. Make sure the backend server is running locally and refresh the page.'
                    : 'Failed to upload photo. Please try again.';
                showInlineError('modalError', message);
                return;
            }
        }

        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];
        const itemId = `${this.selectedCategory.substring(0, 3).toUpperCase()}-${Date.now()}`;
        
        let extra;
        if (this.selectedCategory === 'Dress') {
            extra = this.selectedDressLength;
        } else if (this.selectedCategory === 'Top') {
            extra = 'Regular';
        } else if (this.selectedCategory === 'Bottom') {
            extra = 'Regular';
        } else {
            extra = 'Casual';
        }

        try {
            const response = await fetch(await getApiUrl('/add'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemID: itemId, name: name, primaryColor: color, tags: tags, type: this.selectedCategory, extra: extra, imageFilePath: imagePath })
            });
            if (!response.ok) {
                const err = await response.json();
                showInlineError('modalError', err.message || 'Failed to save item.'); return;
            }
            this.closeModal();
            await this.loadItems();
        } catch (err) {
            showInlineError('modalError', 'Failed to save item. Please try again.');
        }
    },

    async toggleLaundry(itemId) {
        try {
            const response = await fetch(await getApiUrl(`/toggle/${itemId}`), { method: 'POST' });
            if (!response.ok) throw new Error('Failed to toggle status');
            const item = this.items.find(i => i.itemID === itemId);
            if (item) { item.isClean = !item.isClean; this.render(document.getElementById('catFilter')?.value || 'All'); }
        } catch (err) { console.error('Error toggling laundry:', err); }
    },

    async deleteItem(itemId) {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            const response = await fetch(await getApiUrl(`/inventory/${itemId}`), { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete item');
            this.items = this.items.filter(i => i.itemID !== itemId);
            this.render(document.getElementById('catFilter')?.value || 'All');
        } catch (err) { console.error('Error deleting item:', err); }
    },

    render(filter = 'All') {
        const categories = [
            { type: 'Top', gridId: 'topsGrid', countId: 'topsCount', icon: 'fa-shirt' },
            { type: 'Bottom', gridId: 'bottomsGrid', countId: 'bottomsCount', icon: 'fa-venus-mars' },
            { type: 'Dress', gridId: 'dressesGrid', countId: 'dressesCount', icon: 'fa-vest-patches' },
            { type: 'Footwear', gridId: 'footwearGrid', countId: 'footwearCount', icon: 'fa-shoe-prints' }
        ];

        const totalCountEl = document.getElementById('itemCount');
        let totalCount = 0;

        const gridContainer = document.getElementById('wardrobeColumns');
        if (gridContainer) {
            if (filter !== 'All') {
                gridContainer.classList.remove('md:grid-cols-3');
                gridContainer.classList.add('md:grid-cols-1');
            } else {
                gridContainer.classList.remove('md:grid-cols-1');
                gridContainer.classList.add('md:grid-cols-3');
            }
        }

        categories.forEach(cat => {
            const grid = document.getElementById(cat.gridId);
            const countEl = document.getElementById(cat.countId);
            const columnEl = grid?.closest('.wardrobe-column');
            let items = this.items.filter(i => i.type === cat.type);
            
            if (filter !== 'All' && cat.type !== filter) {
                if (columnEl) columnEl.style.display = 'none';
                if (countEl) countEl.innerText = '0';
                return;
            }
            
            if (columnEl) columnEl.style.display = '';
            
            if (filter !== 'All') {
                items = items.filter(i => i.type === filter);
            }
            
            totalCount += items.length;
            if (countEl) countEl.innerText = items.length;

            if (items.length === 0) {
                grid.innerHTML = `
                    <div class="empty-column-state">
                        <i class="fas ${cat.icon} text-[#e6e0d5] text-4xl mb-3"></i>
                        <p class="text-gray-400 text-sm">No ${cat.type.toLowerCase()}s yet</p>
                    </div>`;
            } else {
                grid.innerHTML = items.map(item => this.renderItemCard(item)).join('');
            }
        });

        if (totalCountEl) totalCountEl.innerText = totalCount;
    },

    renderItemCard(item) {
        const imgHtml = item.imageFilePath
            ? `<img src="${item.imageFilePath}" alt="${item.name}" class="w-full h-48 object-contain bg-[#f5f5f0] rounded-[1.5rem] mb-4" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
            : '';
        const placeholderHtml = `<div class="w-full h-48 bg-gray-100 rounded-[1.5rem] flex items-center justify-center mb-4" style="${item.imageFilePath ? 'display:none;' : ''}"><i class="fas fa-tshirt text-gray-300 text-4xl"></i></div>`;
        const tagsHtml = item.tags?.map(tag => `<span class="text-[10px] bg-[#f2ede4] text-[#8c7862] px-2 py-1 rounded-full font-bold uppercase tracking-tighter">${tag}</span>`).join('') || '';
        const statusBadge = item.isClean
            ? `<span class="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase tracking-tighter">Clean</span>`
            : `<span class="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold uppercase tracking-tighter">In Laundry</span>`;

        return `
        <div class="bg-white p-4 rounded-[2rem] shadow-sm border border-[#e6e0d5] hover:shadow-md transition group">
            ${imgHtml}${placeholderHtml}
            <div class="px-2 pb-2">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-bold text-gray-800">${item.name}</h4>
                    <button onclick="WardrobeApp.deleteItem('${item.itemID}')" class="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><i class="fas fa-trash-alt"></i></button>
                </div>
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                    <span class="text-[10px] text-[#8c7862] font-bold uppercase tracking-widest">${item.type}</span>
                    <span class="text-gray-300">•</span>
                    <span class="text-[10px] text-gray-500 font-medium">${item.primaryColor}</span>
                </div>
                <div class="flex flex-wrap gap-1 mb-3">${tagsHtml}</div>
                <div class="flex justify-between items-center">
                    ${statusBadge}
                    <button onclick="WardrobeApp.toggleLaundry('${item.itemID}')" class="text-xs font-bold text-[#8c7862] hover:text-[#4a4238] transition flex items-center gap-1"><i class="fas fa-sync-alt"></i> Toggle</button>
                </div>
            </div>
        </div>`;
    }
};

window.addEventListener('DOMContentLoaded', () => WardrobeApp.init());
