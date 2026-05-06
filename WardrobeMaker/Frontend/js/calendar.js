const LOCAL_API_HOSTS = [
    'http://localhost:5000',
    'http://localhost:7182',
    'https://localhost:7182'
];
let resolvedApiHost = '';

async function resolveApiHost() {
    if (resolvedApiHost) return resolvedApiHost;

    for (const host of LOCAL_API_HOSTS) {
        try {
            const response = await fetch(`${host}/api/wardrobe/stats`, { method: 'GET', mode: 'cors' });
            if (response.ok) {
                resolvedApiHost = host;
                return resolvedApiHost;
            }
        } catch {
            // Try next host
        }
    }

    resolvedApiHost = LOCAL_API_HOSTS[0];
    return resolvedApiHost;
}

async function getApiUrl(path) {
    if (window.location.protocol === 'file:') {
        const host = await resolveApiHost();
        return `${host}/api/wardrobe${path}`;
    }
    return `/api/wardrobe${path}`;
}

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
            fetch(await getApiUrl('/calendar')),
            fetch(await getApiUrl('/lookbook'))
        ]);
        if (calendarRes.ok) scheduledOutfits = await calendarRes.json();
        if (lookbookRes.ok) lookbookOutfits = await lookbookRes.json();

        updateCalendar();

        renderSidebar(new Date().toISOString().split('T')[0]);
    } catch (err) {
        console.error('Error loading calendar data:', err);
    }
}

function updateCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    document.getElementById('currentMonthYear').innerText = `${monthNames[month]} ${year}`;

    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('opacity-0');
        grid.appendChild(emptyDiv);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        const dateString = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;

        dayDiv.classList.add('cal-day-box');
        if (dateString === todayStr) dayDiv.classList.add('active');

        let cellHtml = `<span class="day-number">${i}</span>`;

        const dayOutfits = scheduledOutfits.filter(s => s.date === dateString);
        if (dayOutfits.length > 0) {
            let cardsHtml = '';
            dayOutfits.forEach((outfit, idx) => {
                const topImg = outfit.top?.imageFilePath || '';
                const bottomImg = outfit.bottom?.imageFilePath || '';
                const shoesImg = outfit.shoes?.imageFilePath || '';
                
                cardsHtml += `
                    <div class="outfit-card-stack" style="--card-index: ${idx}; z-index: ${dayOutfits.length - idx};">
                        <div class="outfit-card-inner">
                            <div class="outfit-card-piece" style="background-image: url('${topImg}'); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>
                            <div class="outfit-card-piece" style="background-image: url('${bottomImg}'); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>
                            <div class="outfit-card-piece" style="background-image: url('${shoesImg}'); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>
                        </div>
                    </div>
                `;
            });

            cellHtml += `<div class="outfit-cards-container">${cardsHtml}</div>`;
        }

        dayDiv.innerHTML = cellHtml;

        dayDiv.onclick = () => {
            document.querySelectorAll('.cal-day-box').forEach(el => el.classList.remove('active', 'border-[var(--earth-brown)]'));
            dayDiv.classList.add('active', 'border-[var(--earth-brown)]');

            renderSidebar(dateString);
        };

        grid.appendChild(dayDiv);
    }
}

let currentSelectedDateStr = new Date().toISOString().split('T')[0];
let currentOutfitIndex = 0;

function renderSidebar(dateStr) {
    currentSelectedDateStr = dateStr;
    currentOutfitIndex = 0;
    const dateObj = new Date(dateStr + 'T00:00:00');

    document.getElementById('sidebarDateTitle').innerText = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    document.getElementById('sidebarDateSub').innerText = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const contentArea = document.getElementById('sidebarContent');
    const dayOutfits = scheduledOutfits.filter(s => s.date === dateStr);

    if (dayOutfits.length > 0) {
        renderOutfitCard(contentArea, dayOutfits, 0);
    } else {
        contentArea.innerHTML = `
            <div class="w-32 h-32 rounded-full bg-[var(--beige-light)] flex items-center justify-center mb-6 mt-4">
                <i class="fas fa-ghost text-4xl text-gray-300"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-400 mb-2">Nothing Planned</h3>
            <p class="text-sm text-gray-400 max-w-[200px]">Your canvas is blank for this day. Time to get creative!</p>
        `;
    }
}

function renderOutfitCard(contentArea, dayOutfits, index) {
    currentOutfitIndex = index;
    const outfit = dayOutfits[index];
    
    const items = [outfit.top, outfit.bottom, outfit.shoes].filter(Boolean);
    let stackHtml = '';
    
    if (outfit.top) {
        stackHtml += `
            <div class="outfit-piece">
                <img src="${outfit.top.imageFilePath || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23f5f5f0%22 width=%22100%22 height=%22100%22/%3E%3Ctext text-anchor=%22middle%22 dy=%22.3em%22 y=%2250%22 x=%2250%22 font-size=%2212%22 fill=%22%23999%22%3ETop%3C/text%3E%3C/svg%3E'}" alt="Top">
            </div>
        `;
    }
    
    if (outfit.bottom) {
        stackHtml += `
            <div class="outfit-piece">
                <img src="${outfit.bottom.imageFilePath || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23f5f5f0%22 width=%22100%22 height=%22100%22/%3E%3Ctext text-anchor=%22middle%22 dy=%22.3em%22 y=%2250%22 x=%2250%22 font-size=%2212%22 fill=%22%23999%22%3EBottom%3C/text%3E%3C/svg%3E'}" alt="Bottom">
            </div>
        `;
    }
    
    if (outfit.shoes) {
        stackHtml += `
            <div class="outfit-piece">
                <img src="${outfit.shoes.imageFilePath || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23f5f5f0%22 width=%22100%22 height=%22100%22/%3E%3Ctext text-anchor=%22middle%22 dy=%22.3em%22 y=%2250%22 x=%2250%22 font-size=%2212%22 fill=%22%23999%22%3EShoes%3C/text%3E%3C/svg%3E'}" alt="Shoes">
            </div>
        `;
    }
    
    let navigationHtml = '';
    if (dayOutfits.length > 1) {
        navigationHtml = `
            <div class="text-xs text-gray-500 font-semibold mb-4">
                Outfit ${index + 1} of ${dayOutfits.length}
            </div>
        `;
    }
    
    contentArea.innerHTML = `
        ${navigationHtml}
        <div class="outfit-display-with-arrows">
            ${dayOutfits.length > 1 ? `<button onclick="changeOutfit(-1)" class="arrow-button arrow-left"><i class="fas fa-chevron-left"></i></button>` : ''}
            <div class="outfit-display">
                ${stackHtml}
            </div>
            ${dayOutfits.length > 1 ? `<button onclick="changeOutfit(1)" class="arrow-button arrow-right"><i class="fas fa-chevron-right"></i></button>` : ''}
        </div>
        <h3 class="text-xl font-bold text-[var(--text-main)] mb-2 mt-6">${outfit.outfitName}</h3>
        <p class="text-[var(--earth-brown)] text-xs font-bold uppercase tracking-widest mb-4"><i class="fas fa-check-circle"></i> Ready to Wear</p>
        <button onclick="removeOutfitFromDay('${currentSelectedDateStr}', '${outfit.outfitID}')" class="w-full text-red-400 hover:text-red-600 text-sm font-bold transition py-2">
            <i class="fas fa-trash-alt"></i> Remove This Look
        </button>
    `;
}

function changeOutfit(direction) {
    const dayOutfits = scheduledOutfits.filter(s => s.date === currentSelectedDateStr);
    let newIndex = currentOutfitIndex + direction;
    
    if (newIndex < 0) newIndex = dayOutfits.length - 1;
    if (newIndex >= dayOutfits.length) newIndex = 0;
    
    const contentArea = document.getElementById('sidebarContent');
    renderOutfitCard(contentArea, dayOutfits, newIndex);
}

function navigateDay(direction) {
    const d = new Date(currentSelectedDateStr);
    d.setDate(d.getDate() + direction);
    const newDateStr = d.toISOString().split('T')[0];

    if (d.getMonth() !== currentCalendarDate.getMonth()) {
        currentCalendarDate = new Date(d);
        updateCalendar();
    }

    renderSidebar(newDateStr);
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
        const response = await fetch(await getApiUrl('/calendar'), {
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
    if (!confirm('Remove all scheduled outfits for this day?')) return;
    try {
        const response = await fetch(await getApiUrl(`/calendar/${dateStr}`), { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to remove schedule');
        await loadCalendarData();
    } catch (err) {
        console.error('Error removing schedule:', err);
    }
}

async function removeOutfitFromDay(dateStr, outfitId) {
    if (!confirm('Remove this outfit from this day?')) return;
    try {
        const response = await fetch(await getApiUrl(`/calendar/${dateStr}?outfitId=${outfitId}`), { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to remove outfit');
        await loadCalendarData();
        renderSidebar(dateStr);
    } catch (err) {
        console.error('Error removing outfit:', err);
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
