/**
 * main.js - Handles global logic and Dashboard Stats
 */
function updateHomeStats() {
    // Pull data from shared LocalStorage
    // Note: Ensure these keys match the ones used in wardrobe.js and create.js
    const wardrobe = JSON.parse(localStorage.getItem('myWardrobe')) || [];
    const outfits = JSON.parse(localStorage.getItem('myOutfits')) || [];
    const scheduled = JSON.parse(localStorage.getItem('scheduledOutfits')) || {}; 
    
    // Update UI elements safely
    const setStat = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    };

    // Mapping the data to the restored HTML IDs
    setStat('stat-total', wardrobe.length);
    setStat('stat-clean', wardrobe.length); 
    setStat('stat-laundry', 0); // Placeholder until you add a 'status' property to items
    setStat('stat-saved', outfits.length); // Changed from 'stat-outfits' to match HTML
    setStat('stat-scheduled', Object.keys(scheduled).length);
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', updateHomeStats);