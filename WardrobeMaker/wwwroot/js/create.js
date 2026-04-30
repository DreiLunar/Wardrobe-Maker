const API_URL = '/api/wardrobe';

let inventoryItems = [];
let selectedSlots = { top: null, bottom: null, dress: null, footwear: null };
let currentMode = 'standard'; // 'standard' or 'dress'

function showInlineError(elementId, message) {
    let el = document.getElementById(elementId);
    if (!el) {
        el = document.createElement('div');
        el.id = elementId;
        el.className = 'text-red-500 text-sm hidden mb-2';
        const saveBtn = document.querySelector('button[onclick="saveOutfit()"]');
        if (saveBtn) saveBtn.parentNode.insertBefore(el, saveBtn);
    }
    el.textContent = message;
    el.classList.remove('hidden');
}

function hideInlineError(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.classList.add('hidden');
}

function setOutfitMode(mode) {
    currentMode = mode;
    
    // Update button styles
    document.getElementById('btn-standard').classList.toggle('active', mode === 'standard');
    document.getElementById('btn-dress').classList.toggle('active', mode === 'dress');
    
    // Show/hide appropriate slots
    const topContainer = document.getElementById('slot-top-container');
    const bottomContainer = document.getElementById('slot-bottom-container');
    const dressContainer = document.getElementById('slot-dress-container');
    
    if (mode === 'standard') {
        topContainer.classList.remove('hidden');
        bottomContainer.classList.remove('hidden');
        dressContainer.classList.add('hidden');
    } else {
        topContainer.classList.add('hidden');
        bottomContainer.classList.add('hidden');
        dressContainer.classList.remove('hidden');
    }
    
    // Show/hide appropriate inventory sections
    const invTopContainer = document.getElementById('inv-top-container');
    const invBottomContainer = document.getElementById('inv-bottom-container');
    const invDressContainer = document.getElementById('inv-dress-container');
    
    if (mode === 'standard') {
        invTopContainer.classList.remove('hidden');
        invBottomContainer.classList.remove('hidden');
        invDressContainer.classList.add('hidden');
    } else {
        invTopContainer.classList.add('hidden');
        invBottomContainer.classList.add('hidden');
        invDressContainer.classList.remove('hidden');
    }
    
    // Clear selections when switching modes
    clearAllSlots();
}

function clearAllSlots() {
    selectedSlots = { top: null, bottom: null, dress: null, footwear: null };
    ['top', 'bottom', 'dress', 'footwear'].forEach(cat => {
        const slot = document.getElementById(`slot-${cat}`);
        if (slot) {
            slot.innerHTML = `
                <div class="slot-empty">
                    <i class="fas fa-plus"></i>
                    <span>Click to select</span>
                </div>
            `;
            slot.classList.remove('active');
        }
    });
    hideInlineError('saveError');
}

async function loadInventory() {
    try {
        const response = await fetch(`${API_URL}/inventory`);
        if (!response.ok) throw new Error('Failed to load inventory');
        inventoryItems = await response.json();
        renderInventory();
    } catch (err) {
        console.error('Error loading inventory:', err);
    }
}

function renderInventory() {
    const categories = ['Top', 'Bottom', 'Dress', 'Footwear'];
    categories.forEach(cat => {
        const container = document.getElementById(`inv-${cat.toLowerCase()}`);
        const filtered = inventoryItems.filter(i => i.type === cat && i.isClean);

        if (!container) return;
        container.innerHTML = filtered.length
            ? ''
            : '<p class="text-gray-300 italic text-[10px] col-span-2 text-center py-4">No items found</p>';

        filtered.forEach(item => {
            const imgHtml = item.imageFilePath
                ? `<img src="${item.imageFilePath}" class="w-full h-24 object-cover rounded-lg mb-1 shadow-sm" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
                : '';
            const placeholderHtml = `<div class="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-1" style="${item.imageFilePath ? 'display:none;' : ''}"><i class="fas fa-tshirt text-gray-300 text-xl"></i></div>`;

            container.innerHTML += `
                <div class="inventory-item bg-gray-50 p-2 cursor-pointer hover:bg-gray-100 transition rounded-xl" onclick="selectItem('${cat.toLowerCase()}', '${item.itemID}')">
                    ${imgHtml}${placeholderHtml}
                    <p class="text-[10px] font-bold text-gray-600 text-center truncate px-1 uppercase">${item.name}</p>
                </div>`;
        });
    });
}

function selectItem(category, itemId) {
    const item = inventoryItems.find(i => i.itemID === itemId);
    if (!item) return;
    selectedSlots[category] = item;

    const slot = document.getElementById(`slot-${category}`);
    const imgHtml = item.imageFilePath
        ? `<img src="${item.imageFilePath}" class="animate-pop" onerror="this.style.display='none';">`
        : '';
    const placeholderHtml = `<div class="placeholder-slot w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center" style="${item.imageFilePath ? 'display:none;' : ''}"><i class="fas fa-tshirt text-gray-300 text-4xl"></i></div>`;

    slot.innerHTML = `
        <div class="remove-btn" onclick="event.stopPropagation(); removeFromSlot('${category}')">
            <i class="fas fa-times"></i>
        </div>
        <div class="slot-content">
            ${imgHtml}${placeholderHtml}
            <span class="slot-item-name">${item.name}</span>
        </div>
    `;
    slot.classList.add('active');
}

function removeFromSlot(category) {
    selectedSlots[category] = null;
    const slot = document.getElementById(`slot-${category}`);
    slot.innerHTML = `
        <div class="slot-empty">
            <i class="fas fa-plus"></i>
            <span>Click to select</span>
        </div>
    `;
    slot.classList.remove('active');
}

async function randomizeOutfit() {
    hideInlineError('saveError');
    try {
        const response = await fetch(`${API_URL}/generate`);
        if (!response.ok) {
            const err = await response.json();
            showInlineError('saveError', err.message || 'Not enough clean items to generate an outfit.'); return;
        }
        const outfit = await response.json();
        
        // Clear current selections
        clearAllSlots();
        
        // Check if this is a dress outfit
        if (outfit.isDressOutfit) {
            // Switch to dress mode
            setOutfitMode('dress');
            
            if (outfit.dress) {
                const dress = inventoryItems.find(i => i.itemID === outfit.dress.itemID);
                if (dress) selectItem('dress', dress.itemID);
            }
            if (outfit.shoes) {
                const shoes = inventoryItems.find(i => i.itemID === outfit.shoes.itemID);
                if (shoes) selectItem('footwear', shoes.itemID);
            }
        } else {
            // Standard outfit
            setOutfitMode('standard');
            
            if (outfit.top) {
                const top = inventoryItems.find(i => i.itemID === outfit.top.itemID);
                if (top) selectItem('top', top.itemID);
            }
            if (outfit.bottom) {
                const bottom = inventoryItems.find(i => i.itemID === outfit.bottom.itemID);
                if (bottom) selectItem('bottom', bottom.itemID);
            }
            if (outfit.shoes) {
                const shoes = inventoryItems.find(i => i.itemID === outfit.shoes.itemID);
                if (shoes) selectItem('footwear', shoes.itemID);
            }
        }
    } catch (err) {
        showInlineError('saveError', 'Failed to generate outfit. Please try again.');
    }
}

async function saveOutfit() {
    const name = document.getElementById('outfitName').value.trim();
    hideInlineError('saveError');

    if (currentMode === 'standard') {
        if (!selectedSlots.top || !selectedSlots.bottom || !selectedSlots.footwear) {
            showInlineError('saveError', 'Please select a Top, Bottom, and Footwear before saving.'); return;
        }
    } else {
        if (!selectedSlots.dress || !selectedSlots.footwear) {
            showInlineError('saveError', 'Please select a Dress and Footwear before saving.'); return;
        }
    }
    
    if (!name) { showInlineError('saveError', 'Please name your outfit.'); return; }

    const outfitId = `OFT-${Date.now()}`;
    
    let requestBody;
    if (currentMode === 'standard') {
        requestBody = {
            outfitID: outfitId,
            outfitName: name,
            topID: selectedSlots.top.itemID,
            bottomID: selectedSlots.bottom.itemID,
            shoesID: selectedSlots.footwear.itemID
        };
    } else {
        requestBody = {
            outfitID: outfitId,
            outfitName: name,
            dressID: selectedSlots.dress.itemID,
            shoesID: selectedSlots.footwear.itemID
        };
    }

    try {
        const response = await fetch(`${API_URL}/lookbook/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            const err = await response.json();
            showInlineError('saveError', err.message || 'Failed to save outfit.'); return;
        }

        const flashImgContainer = document.getElementById('flashcardImages');
        flashImgContainer.innerHTML = '';
        
        // Show appropriate images based on mode
        if (currentMode === 'standard') {
            [selectedSlots.top, selectedSlots.bottom, selectedSlots.footwear].forEach(item => {
                const img = item.imageFilePath
                    ? `<img src="${item.imageFilePath}" class="w-24 h-24 object-cover rounded-full border-4 border-white shadow-xl">`
                    : `<div class="w-24 h-24 bg-gray-100 rounded-full border-4 border-white shadow-xl flex items-center justify-center"><i class="fas fa-tshirt text-gray-300 text-2xl"></i></div>`;
                flashImgContainer.innerHTML += img;
            });
        } else {
            // Dress mode - show dress and shoes
            [selectedSlots.dress, selectedSlots.footwear].forEach(item => {
                const img = item.imageFilePath
                    ? `<img src="${item.imageFilePath}" class="w-24 h-24 object-cover rounded-full border-4 border-white shadow-xl">`
                    : `<div class="w-24 h-24 bg-gray-100 rounded-full border-4 border-white shadow-xl flex items-center justify-center"><i class="fas fa-tshirt text-gray-300 text-2xl"></i></div>`;
                flashImgContainer.innerHTML += img;
            });
        }
        
        document.getElementById('flashcardTitle').innerText = name;
        document.getElementById('flashcardOverlay').style.display = 'flex';
    } catch (err) {
        showInlineError('saveError', 'Failed to save outfit. Please try again.');
    }
}

function closeFlashcard() {
    document.getElementById('flashcardOverlay').style.display = 'none';
    document.getElementById('outfitName').value = '';
    clearAllSlots();
    hideInlineError('saveError');
}

window.addEventListener('DOMContentLoaded', loadInventory);
