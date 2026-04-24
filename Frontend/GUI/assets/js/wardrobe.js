/* wardrobe.js */
const WardrobeApp = {
    selectedCategory: 'Top',
    items: JSON.parse(localStorage.getItem('myWardrobe')) || [],

    init() {
        this.render();
        // Listener for the filter dropdown
        const filterEl = document.getElementById('catFilter');
        if (filterEl) {
            filterEl.addEventListener('change', (e) => this.render(e.target.value));
        }
    },

    openModal() { 
        const modal = document.getElementById('addItemModal');
        if (modal) modal.style.display = 'flex'; 
    },

    closeModal() { 
        const modal = document.getElementById('addItemModal');
        if (modal) modal.style.display = 'none'; 
    },

    selectCat(el, cat) {
        document.querySelectorAll('.cat-choice').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
        this.selectedCategory = cat;
    },

    previewImage(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('imagePreview').src = e.target.result;
                document.getElementById('previewContainer').style.display = 'block';
                document.getElementById('uploadPrompt').style.display = 'none';
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    saveItem() {
        const nameInput = document.getElementById('itemName');
        const imgPreview = document.getElementById('imagePreview');
        
        if (!nameInput.value || imgPreview.src.includes('#')) {
            return alert("Please add a name and image");
        }

        const newItem = {
            id: Date.now(),
            name: nameInput.value,
            category: this.selectedCategory,
            image: imgPreview.src,
            status: 'clean' // Added for Dashboard compatibility
        };

        this.items.push(newItem);
        localStorage.setItem('myWardrobe', JSON.stringify(this.items));
        
        // Reset form and UI
        nameInput.value = '';
        imgPreview.src = '#';
        this.closeModal();
        this.render();
    },

    render(filter = 'All') {
        const grid = document.getElementById('wardrobeGrid');
        const filtered = filter === 'All' ? this.items : this.items.filter(i => i.category === filter);
        
        // Update the count display from the screenshot
        const countEl = document.getElementById('itemCount');
        if (countEl) countEl.innerText = filtered.length;

        // Logic for Empty State vs. Items Grid
        if (filtered.length === 0) {
            grid.classList.add('empty-container'); // Triggers the dashed border in CSS
            grid.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20">
                    <div class="text-[#e6e0d5] text-8xl mb-6">
                        <i class="fas fa-tshirt"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">Your wardrobe is empty</h2>
                    <p class="text-gray-400 mb-0">Start adding items to build your collection!</p>
                </div>
            `;
        } else {
            grid.classList.remove('empty-container'); // Remove dashed border
            grid.innerHTML = filtered.map(item => `
                <div class="bg-white p-4 rounded-[2rem] shadow-sm border border-[#e6e0d5] hover:shadow-md transition">
                    <img src="${item.image}" class="w-full h-56 object-cover rounded-[1.5rem] mb-4">
                    <div class="px-2 pb-2">
                        <h4 class="font-bold text-gray-800">${item.name}</h4>
                        <p class="text-[10px] text-[#8c7862] font-bold uppercase tracking-widest">${item.category}</p>
                    </div>
                </div>
            `).join('');
        }
    }
};

window.onload = () => WardrobeApp.init();