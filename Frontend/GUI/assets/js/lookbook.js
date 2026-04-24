/* lookbook.js */
const LookbookApp = {
    outfits: JSON.parse(localStorage.getItem('myOutfits')) || [],

    init() {
        this.render();
    },

    render() {
        const grid = document.getElementById('lookbookGrid');
        const emptyState = document.getElementById('emptyState');
        const controls = document.getElementById('lookbookControls');
        const countDisplay = document.getElementById('outfitCount');

        // Update Stats
        countDisplay.innerText = this.outfits.length;

        if (this.outfits.length === 0) {
            grid.innerHTML = '';
            grid.appendChild(emptyState);
            emptyState.style.display = 'block';
            controls.classList.add('hidden');
            return;
        }

        emptyState.style.display = 'none';
        controls.classList.remove('hidden');
        
        grid.innerHTML = this.outfits.map((outfit, index) => `
            <div class="outfit-card relative group">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-bold text-[#8c7862] bg-[#f2ede4] px-3 py-1 rounded-full uppercase tracking-tighter">
                        ${outfit.date || 'Recently Added'}
                    </span>
                    <button onclick="LookbookApp.deleteOutfit(${index})" class="delete-btn text-gray-300 hover:text-red-500 transition">
                        <i class="fas fa-times-circle text-xl"></i>
                    </button>
                </div>
                
                <div class="image-stack">
                    ${outfit.items.map(img => `
                        <div class="stack-item">
                            <img src="${img}" alt="Outfit Piece">
                        </div>
                    `).join('')}
                </div>

                <div class="text-center">
                    <h3 class="text-lg font-bold text-gray-800 mb-1 capitalize">${outfit.name}</h3>
                    <div class="flex justify-center gap-2 text-gray-400 text-[10px] font-medium uppercase tracking-widest">
                        <span>${outfit.items.length} Items</span>
                        <span>•</span>
                        <span>Ready to Wear</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    deleteOutfit(index) {
        if(confirm("Remove this look from your lookbook?")) {
            this.outfits.splice(index, 1);
            localStorage.setItem('myOutfits', JSON.stringify(this.outfits));
            this.render();
        }
    },

    clearAll() {
        if(confirm("Are you sure you want to delete all saved outfits? This cannot be undone.")) {
            this.outfits = [];
            localStorage.removeItem('myOutfits');
            this.render();
        }
    }
};

window.onload = () => LookbookApp.init();