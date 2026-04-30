const API_URL = '/api/wardrobe';

let currentCalendarDate = new Date();
let scheduledOutfits = [];
let lookbookOutfits = [];

function showInlineError(elementId, message) {
    let el = document.getElementById(elementId);
    if (!el) {
        el = document.createElement('div');
        el.id = elementId;
        el.className = 'text-red-500 text-sm hidden mb-2';
        const modal = document.getElementById('scheduleModal')?.querySelector('.bg-white');
        if (modal) modal.insertBefore(el, modal.querySelector('.space-y-4'));
    }
    el.textContent = message;
    el.classList.remove('hidden');
}

function hideInlineError(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.classList.add('hidden');
}

async function loadCalendarData() {
    try {
        const [calendarRes, lookbookRes] = await Promise.all([
            fetch(`${API_URL}/calendar`),
            fetch(`${API_URL}/lookbook`)
        ]);
        if (calendarRes.ok) scheduledOutfits = await calendarRes.json();
        if (lookbookRes.ok) lookbookOutfits = await lookbookRes.json();
        updateCalendar();
        updateTodayTomorrowCards();
    } catch (err) {
        console.error('Error loading calendar data:', err);
    }
}

function updateCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    document.getElementById('currentMonthYear').innerText = `${monthNames[month]} ${year}`;

    const now = new Date();
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
    const options = { month: 'short', day: 'numeric' };
    document.getElementById('todayChip').innerText = `Today \u2022 ${now.toLocaleDateString('en-US', options)}`;
    document.getElementById('tomorrowChip').innerText = `Tomorrow \u2022 ${tomorrow.toLocaleDateString('en-US', options)}`;

    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = `
        <span class="text-[10px] font-bold text-gray-300 uppercase mb-2">S</span>
        <span class="text-[10px] font-bold text-gray-300 uppercase mb-2">M</span>
        <span class="text-[10px] font-bold text-gray-300 uppercase mb-2">T</span>
        <span class="text-[10px] font-bold text-gray-300 uppercase mb-2">W</span>
        <span class="text-[10px] font-bold text-gray-300 uppercase mb-2">T</span>
        <span class="text-[10px] font-bold text-gray-300 uppercase mb-2">F</span>
        <span class="text-[10px] font-bold text-gray-300 uppercase mb-2">S</span>
    `;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement('div'));

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        const dateString = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        dayDiv.classList.add('cal-day');
        if (dateString === todayStr) dayDiv.classList.add('active');
        const scheduled = scheduledOutfits.find(s => s.date === dateString);
        if (scheduled) dayDiv.classList.add('has-event');
        dayDiv.innerText = i;
        dayDiv.onclick = () => {
            if (scheduled) showScheduledOutfit(scheduled, dateString);
            else openScheduleModal(dateString);
        };
        grid.appendChild(dayDiv);
    }
}

function updateTodayTomorrowCards() {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    updateSlot('today', todayStr);
    updateSlot('tomorrow', tomorrowStr);
}

function updateSlot(slotId, dateStr) {
    const stack = document.getElementById(`${slotId}Stack`);
    const title = document.getElementById(`${slotId}Title`);
    const desc = document.getElementById(`${slotId}Desc`);
    const scheduled = scheduledOutfits.find(s => s.date === dateStr);

    const existingRemove = desc?.parentElement.querySelector('.remove-schedule-btn');
    if (existingRemove) existingRemove.remove();

    if (scheduled) {
        const items = [scheduled.top, scheduled.bottom, scheduled.shoes];
        stack.innerHTML = items.map(item => {
            return item.imageFilePath
                ? `<div class="stack-circle"><img src="${item.imageFilePath}"></div>`
                : `<div class="stack-circle"><i class="fas fa-tshirt text-gray-300"></i></div>`;
        }).join('');
        title.innerText = scheduled.outfitName;
        if (desc) desc.innerText = 'Looking sharp!';

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-schedule-btn text-xs text-red-400 hover:text-red-600 font-bold mt-2';
        removeBtn.innerHTML = '<i class="fas fa-times"></i> Remove';
        removeBtn.onclick = () => removeSchedule(dateStr);
        desc.parentElement.appendChild(removeBtn);
    } else {
        stack.innerHTML = `<div class="stack-circle"><i class="fas fa-plus opacity-20"></i></div>`;
        title.innerText = slotId === 'today' ? 'No Outfit Scheduled' : 'Planning Ahead?';
        if (desc) desc.innerText = slotId === 'today' ? 'Plan your look for today.' : 'Stay ahead of your week.';
    }
}

function showScheduledOutfit(scheduled, dateString) {
    // Update the today slot to show the clicked date's outfit
    const stack = document.getElementById('todayStack');
    const title = document.getElementById('todayTitle');
    const desc = document.getElementById('todayDesc');
    const chip = document.getElementById('todayChip');

    const existingRemove = desc?.parentElement.querySelector('.remove-schedule-btn');
    if (existingRemove) existingRemove.remove();

    const items = [scheduled.top, scheduled.bottom, scheduled.shoes];
    stack.innerHTML = items.map(item => {
        return item.imageFilePath
            ? `<div class="stack-circle"><img src="${item.imageFilePath}"></div>`
            : `<div class="stack-circle"><i class="fas fa-tshirt text-gray-300"></i></div>`;
    }).join('');
    
    title.innerText = scheduled.outfitName;
    if (desc) desc.innerText = 'Looking sharp!';
    
    // Update chip to show the selected date
    const dateObj = new Date(dateString + 'T00:00:00');
    const options = { month: 'short', day: 'numeric' };
    chip.innerText = `${dateObj.toLocaleDateString('en-US', options)} \u2022 Scheduled`;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-schedule-btn text-xs text-red-400 hover:text-red-600 font-bold mt-2';
    removeBtn.innerHTML = '<i class="fas fa-times"></i> Remove';
    removeBtn.onclick = () => removeSchedule(dateString);
    desc.parentElement.appendChild(removeBtn);

    document.getElementById('slot-today').scrollIntoView({ behavior: 'smooth' });
}

function openScheduleModal(preselectedDate) {
    const select = document.getElementById('outfitSelect');
    select.innerHTML = lookbookOutfits.map(o => `<option value="${o.outfitID}">${o.outfitName}</option>`).join('');
    if (lookbookOutfits.length === 0) select.innerHTML = '<option disabled selected>Create an outfit first!</option>';
    document.getElementById('datePicker').value = preselectedDate || new Date().toISOString().split('T')[0];
    hideInlineError('scheduleError');
    document.getElementById('scheduleModal').style.display = 'flex';
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').style.display = 'none';
    hideInlineError('scheduleError');
}

async function confirmSchedule() {
    const outfitId = document.getElementById('outfitSelect').value;
    const date = document.getElementById('datePicker').value;
    if (!outfitId || !date) { showInlineError('scheduleError', 'Please select both an outfit and a date.'); return; }

    try {
        const response = await fetch(`${API_URL}/calendar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, outfitID: outfitId })
        });
        if (!response.ok) {
            const err = await response.json();
            showInlineError('scheduleError', err.message || 'Failed to schedule outfit.'); return;
        }
        await loadCalendarData();
        closeScheduleModal();
    } catch (err) {
        showInlineError('scheduleError', 'Failed to schedule outfit. Please try again.');
    }
}

async function removeSchedule(dateStr) {
    if (!confirm('Remove this scheduled outfit?')) return;
    try {
        const response = await fetch(`${API_URL}/calendar/${dateStr}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to remove schedule');
        await loadCalendarData();
    } catch (err) {
        console.error('Error removing schedule:', err);
    }
}

function prevMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    updateCalendar();
}

function nextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    updateCalendar();
}

window.addEventListener('DOMContentLoaded', () => {
    loadCalendarData();
    const leftArrow = document.querySelector('.fa-chevron-left');
    const rightArrow = document.querySelector('.fa-chevron-right');
    if (leftArrow) leftArrow.onclick = prevMonth;
    if (rightArrow) rightArrow.onclick = nextMonth;
});
