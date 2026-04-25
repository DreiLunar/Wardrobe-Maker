const WardrobeApp = {
    selectedCategory: 'Top',
    items: [],

    async init() {
        await this.loadFromDatabase();
        this.render();

        const filterEl = document.getElementById('catFilter');
        if (filterEl) {
            filterEl.addEventListener('change', (e) => this.render(e.target.value));
        }
    },

    async loadFromDatabase() {
        try {
            console.log("Asking C# server for clothes...");
            const response = await fetch('http://localhost:5000/api/inventory');
            this.items = await response.json();
            console.log("Received data from C#:", this.items);
        } catch (error) {
            console.error("Could not connect to C# server:", error);
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
        alert("We will connect the 'Save' button to the C# backend next!");
        this.closeModal();
    },

    render(filter = 'All') {
        const grid = document.getElementById('wardrobeGrid');

        // Filter items based on the C# $type discriminator
        const filtered = filter === 'All' ? this.items : this.items.filter(i => i.$type === filter);

        const countEl = document.getElementById('itemCount');
        if (countEl) countEl.innerText = filtered.length;

        if (filtered.length === 0) {
            grid.classList.add('empty-container');
            grid.className = "min-h-[400px] bg-white rounded-[3rem] border-2 border-dashed border-[#e6e0d5] flex flex-col items-center justify-center p-12 text-center";
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
            grid.classList.remove('empty-container');
            // FIX: Re-applying the grid layout classes
            grid.className = "wardrobe-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full";

            grid.innerHTML = filtered.map(item => {
                const imgSrc = item.imageFilePath ? item.imageFilePath : 'https://placehold.co/300x400/e6e0d5/8c7862?text=No+Image';

                return `
                <div class="bg-white p-4 rounded-[2rem] shadow-sm border border-[#e6e0d5] hover:shadow-md transition flex flex-col h-full">
                    <img src="${imgSrc}" class="w-full h-64 object-cover rounded-[1.5rem] mb-4">
                    <div class="px-2 pb-2 mt-auto">
                        <h4 class="font-bold text-gray-800 text-lg">${item.name}</h4>
                        <p class="text-[10px] text-[#8c7862] font-bold uppercase tracking-widest">${item.$type}</p>
                    </div>
                </div>
                `;
            }).join('');
        }
    }
};

window.onload = () => WardrobeApp.init();