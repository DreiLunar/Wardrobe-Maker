/* calendar.js */
let scheduledOutfits = JSON.parse(localStorage.getItem('scheduledOutfits')) || {};
let myOutfits = JSON.parse(localStorage.getItem('myOutfits')) || [];

function updateCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('currentMonthYear').innerText = `${monthNames[month]} ${year}`;

    // Update Date Chips
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const options = { month: 'short', day: 'numeric' };
    document.getElementById('todayChip').innerText = `Today • ${now.toLocaleDateString('en-US', options)}`;
    document.getElementById('tomorrowChip').innerText = `Tomorrow • ${tomorrow.toLocaleDateString('en-US', options)}`;

    // Render Days
    const grid = document.getElementById('calendarGrid');
    const headers = grid.querySelectorAll('span');
    grid.innerHTML = '';
    headers.forEach(h => grid.appendChild(h));

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement('div'));

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        dayDiv.classList.add('cal-day');
        if (i === today) dayDiv.classList.add('active');
        if (scheduledOutfits[dateString]) dayDiv.classList.add('has-event');
        
        dayDiv.innerText = i;
        dayDiv.onclick = () => console.log("Selected:", dateString); // Placeholder for future detail view
        grid.appendChild(dayDiv);
    }

    renderFlashcards();
}

function renderFlashcards() {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    updateSlot('today', todayStr);
    updateSlot('tomorrow', tomorrowStr);
}

function updateSlot(slotId, dateStr) {
    const stack = document.getElementById(`${slotId}Stack`);
    const title = document.getElementById(`${slotId}Title`);
    const desc = document.getElementById(`${slotId}Desc`);
    const outfit = scheduledOutfits[dateStr];

    if (outfit) {
        stack.innerHTML = outfit.items.map(img => `<div class="stack-circle"><img src="${img}"></div>`).join('');
        title.innerText = outfit.name;
        if(desc) desc.innerText = "Looking sharp!";
    } else {
        stack.innerHTML = `<div class="stack-circle"><i class="fas fa-plus opacity-20"></i></div>`;
        title.innerText = "No Outfit Scheduled";
    }
}

function openScheduleModal() {
    const select = document.getElementById('outfitSelect');
    select.innerHTML = myOutfits.map(o => `<option value="${o.id}">${o.name}</option>`).join('');
    if(myOutfits.length === 0) select.innerHTML = '<option disabled>Create an outfit first!</option>';
    document.getElementById('scheduleModal').style.display = 'flex';
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').style.display = 'none';
}

function confirmSchedule() {
    const outfitId = document.getElementById('outfitSelect').value;
    const date = document.getElementById('datePicker').value;

    if(!outfitId || !date) return alert("Please select both an outfit and a date.");

    const outfit = myOutfits.find(o => o.id == outfitId);
    scheduledOutfits[date] = outfit;
    localStorage.setItem('scheduledOutfits', JSON.stringify(scheduledOutfits));
    
    updateCalendar();
    closeScheduleModal();
}

window.onload = updateCalendar;