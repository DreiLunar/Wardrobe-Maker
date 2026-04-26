let myItems = [];
let selectedIds = { top: null, bottom: null, footwear: null };

window.onload = async () => {
    await loadItemsFromServer();
    renderInventory();
};

async function loadItemsFromServer() {
    try {
        const response = await fetch('http://localhost:5000/api/inventory');
        myItems = await response.json();
        console.log("Success: Items loaded from C#", myItems);
    } catch (error) {
        console.error("Connection Error: Is your C# server running?", error);
    }
}

function renderInventory() {
    const categories = ['Top', 'Bottom', 'Footwear'];
    categories.forEach(cat => {
        const container = document.getElementById(`inv-${cat.toLowerCase()}`);
        if (!container) return;

        const filtered = myItems.filter(i => i.$type === cat);
        container.innerHTML = filtered.length ? '' : '<p class="text-gray-300 italic text-[10px] text-center py-4">Empty</p>';

        filtered.forEach(item => {
            const imgSrc = item.imageFilePath || 'https://placehold.co/300x400/e6e0d5/8c7862?text=No+Image';
            // Note: Using item.itemID to match C# property
            container.innerHTML += `
                <div class="inventory-item bg-gray-50 p-2 cursor-pointer hover:bg-white transition" 
                     onclick="addToCanvas('${cat.toLowerCase()}', '${imgSrc}', '${item.itemID}')">
                    <img src="${imgSrc}" class="w-full h-24 object-cover rounded-lg mb-1 shadow-sm">
                    <p class="text-[10px] font-bold text-gray-600 text-center truncate uppercase">${item.name}</p>
                </div>`;
        });
    });
}

function addToCanvas(category, imgSrc, itemId) {
    console.log(`Adding ${category} with ID: ${itemId}`);
    const slot = document.getElementById(`slot-${category}`);

    slot.innerHTML = `
        <img src="${imgSrc}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 1rem;">
        <div class="remove-btn" onclick="event.stopPropagation(); removeImage('${category}')">×</div>
    `;

    slot.classList.add('active');
    selectedIds[category] = itemId;
}

function removeImage(category) {
    const slot = document.getElementById(`slot-${category}`);
    slot.innerHTML = `<i class="fas fa-plus text-gray-200 text-2xl"></i>`;
    slot.classList.remove('active');
    selectedIds[category] = null;
}

async function saveOutfit() {
    const name = document.getElementById('outfitName').value;
    if (!name) return alert("Please name your outfit!");

    if (!selectedIds.top || !selectedIds.bottom || !selectedIds.footwear) {
        return alert("Please select all 3 items (Top, Bottom, Shoes)!");
    }

    const payload = {
        outfitName: name,
        topId: selectedIds.top,
        bottomId: selectedIds.bottom,
        shoesId: selectedIds.footwear
    };

    console.log("Sending to C#:", payload);

    try {
        const response = await fetch('http://localhost:5000/api/outfits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            document.getElementById('flashcardTitle').innerText = name;
            document.getElementById('flashcardOverlay').style.display = 'flex';
        } else {
            const errorText = await response.text();
            console.error("Server rejected save:", errorText);
            alert("Server Error: " + errorText);
        }
    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

function closeFlashcard() {
    document.getElementById('flashcardOverlay').style.display = 'none';
    location.reload();
}

function randomizeOutfit() {
    const tops = myItems.filter(i => i.$type === 'Top');
    const bottoms = myItems.filter(i => i.$type === 'Bottom');
    const shoes = myItems.filter(i => i.$type === 'Footwear');

    if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
        alert("Not enough items! You need at least one Top, Bottom, and Footwear in your inventory.");
        return;
    }

    const randomTop = tops[Math.floor(Math.random() * tops.length)];
    const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
    const randomShoes = shoes[Math.floor(Math.random() * shoes.length)];

    const getImg = (item) => item.imageFilePath || 'https://placehold.co/300x400/e6e0d5/8c7862?text=No+Image';

    addToCanvas('top', getImg(randomTop), randomTop.itemID);
    addToCanvas('bottom', getImg(randomBottom), randomBottom.itemID);
    addToCanvas('footwear', getImg(randomShoes), randomShoes.itemID);

    console.log("Quick Roll complete!");
}