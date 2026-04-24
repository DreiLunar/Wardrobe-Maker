/* create.js */
let myItems = [];

window.onload = () => {
    myItems = JSON.parse(localStorage.getItem('myWardrobe')) || [];
    renderInventory();
};

function renderInventory() {
    const categories = ['Top', 'Bottom', 'Footwear'];
    categories.forEach(cat => {
        const container = document.getElementById(`inv-${cat.toLowerCase()}`);
        const filtered = myItems.filter(i => {
            const itemCat = i.category.trim();
            return itemCat === cat || (cat === 'Footwear' && itemCat === 'Shoes');
        });

        container.innerHTML = filtered.length ? '' : '<p class="text-gray-300 italic text-[10px] col-span-2 text-center py-4">No items found</p>';
        filtered.forEach(item => {
            container.innerHTML += `
                <div class="inventory-item bg-gray-50 p-2" onclick="addToCanvas('${cat.toLowerCase()}', '${item.image}')">
                    <img src="${item.image}" class="w-full h-24 object-cover rounded-lg mb-1 shadow-sm">
                    <p class="text-[10px] font-bold text-gray-600 text-center truncate px-1 uppercase">${item.name}</p>
                </div>`;
        });
    });
}

function addToCanvas(category, imgSrc) {
    const slot = document.getElementById(`slot-${category}`);
    slot.innerHTML = `
        <div class="remove-btn" onclick="event.stopPropagation(); removeImage('${category}')">
            <i class="fas fa-times"></i>
        </div>
        <img src="${imgSrc}" class="animate-pop">
    `;
    slot.classList.add('active');
}

function removeImage(category) {
    const slot = document.getElementById(`slot-${category}`);
    slot.innerHTML = `<i class="fas fa-plus text-gray-300"></i>`;
    slot.classList.remove('active');
}

function saveOutfit() {
    const name = document.getElementById('outfitName').value.trim();
    const top = document.querySelector('#slot-top img')?.src;
    const bottom = document.querySelector('#slot-bottom img')?.src;
    const shoes = document.querySelector('#slot-footwear img')?.src;

    if (!top && !bottom) return alert("Select at least a top and a bottom!");
    if (!name) return alert("Please name your outfit!");

    const newOutfit = {
        id: Date.now(),
        name: name,
        items: [top, bottom, shoes].filter(src => src !== undefined),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };

    const currentOutfits = JSON.parse(localStorage.getItem('myOutfits')) || [];
    currentOutfits.push(newOutfit);
    localStorage.setItem('myOutfits', JSON.stringify(currentOutfits));

    // UI Feedback
    const flashImgContainer = document.getElementById('flashcardImages');
    flashImgContainer.innerHTML = '';
    newOutfit.items.forEach(src => {
        flashImgContainer.innerHTML += `<img src="${src}" class="w-24 h-24 object-cover rounded-full border-4 border-white shadow-xl">`;
    });
    
    document.getElementById('flashcardTitle').innerText = name;
    document.getElementById('flashcardOverlay').style.display = 'flex';
}

function closeFlashcard() {
    document.getElementById('flashcardOverlay').style.display = 'none';
    document.getElementById('outfitName').value = '';
    ['top', 'bottom', 'footwear'].forEach(c => removeImage(c));
}

function randomizeOutfit() {
    const categories = ['Top', 'Bottom', 'Footwear'];
    categories.forEach(cat => {
        const filtered = myItems.filter(i => {
            const itemCat = i.category.trim();
            return itemCat === cat || (cat === 'Footwear' && itemCat === 'Shoes');
        });
        if (filtered.length) {
            const randomItem = filtered[Math.floor(Math.random() * filtered.length)];
            addToCanvas(cat.toLowerCase(), randomItem.image);
        }
    });
}