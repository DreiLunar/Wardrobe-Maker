const LookbookApp = {
    outfits: [],

    async init() {
        await this.loadFromDatabase();
        this.render();
    },

    async loadFromDatabase() {
        try {
            const response = await fetch('http://localhost:5000/api/outfits');
            this.outfits = await response.json();
            console.log("Lookbook loaded from C#:", this.outfits);
        } catch (error) {
            console.error("Could not load Lookbook:", error);
        }
    },

    render() {
        const grid = document.getElementById('lookbookGrid');
        const emptyState = document.getElementById('emptyState');
        const controls = document.getElementById('lookbookControls');
        const countDisplay = document.getElementById('outfitCount');

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

        grid.innerHTML = this.outfits.map((outfit, index) => {
            const topImg = outfit.selectedTop?.imageFilePath || 'https://placehold.co/300x400/e6e0d5/8c7862?text=No+Image';
            const bottomImg = outfit.selectedBottom?.imageFilePath || 'https://placehold.co/300x400/e6e0d5/8c7862?text=No+Image';
            const shoesImg = outfit.selectedShoes?.imageFilePath || 'https://placehold.co/300x400/e6e0d5/8c7862?text=No+Image';

            const itemImages = [topImg, bottomImg, shoesImg];

            return `
            <div class="outfit-card relative group">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-bold text-[#8c7862] bg-[#f2ede4] px-3 py-1 rounded-full uppercase tracking-tighter">
                        Recently Added
                    </span>
                    <button onclick="LookbookApp.deleteOutfit('${outfit.outfitID}')" class="delete-btn text-gray-300 hover:text-red-500 transition">
                        <i class="fas fa-times-circle text-xl"></i>
                    </button>
                </div>
                
                <div class="image-stack">
                    ${itemImages.map(img => `
                        <div class="stack-item">
                            <img src="${img}" alt="Outfit Piece">
                        </div>
                    `).join('')}
                </div>

                <div class="text-center">
                    <h3 class="text-lg font-bold text-gray-800 mb-1 capitalize">${outfit.outfitName}</h3>
                    <div class="flex justify-center gap-2 text-gray-400 text-[10px] font-medium uppercase tracking-widest">
                        <span>3 Items</span>
                        <span>•</span>
                        <span>Ready to Wear</span>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    },

    async deleteOutfit(outfitID) {
        if(confirm("Remove this look from your lookbook?")) {
            try {
                // Send the DELETE request to the C# server
                const response = await fetch(`http://localhost:5000/api/outfits/${outfitID}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    console.log(`Deleted outfit ${outfitID} successfully.`);
                    // Reload the data from the server and redraw the screen
                    await this.loadFromDatabase();
                    this.render();
                } else {
                    alert("Failed to delete the outfit from the server.");
                }
            } catch (error) {
                console.error("Error deleting outfit:", error);
            }
        }
    },

    async clearAll() {
        if(confirm("Are you sure you want to delete all saved outfits? This cannot be undone.")) {
            try {
                // Send the DELETE request to the C# server (notice there is no ID at the end of the URL)
                const response = await fetch('http://localhost:5000/api/outfits', {
                    method: 'DELETE'
                });

                if (response.ok) {
                    console.log("All outfits cleared successfully.");
                    // Reload the empty data from the server and redraw the screen
                    await this.loadFromDatabase();
                    this.render();
                } else {
                    alert("Failed to clear outfits from the server.");
                }
            } catch (error) {
                console.error("Error clearing outfits:", error);
            }
        }
    }
};

window.onload = () => LookbookApp.init();