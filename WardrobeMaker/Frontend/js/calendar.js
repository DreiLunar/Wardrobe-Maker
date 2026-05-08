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
        } catch {}
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
let currentSelectedDateStr = new Date().toISOString().split('T')[0];
let currentOutfitIndex = 0;

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
        renderSidebar(currentSelectedDateStr);
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
        if (dateString === currentSelectedDateStr) dayDiv.classList.add('border-[#8c7862]', 'border-2');

        let cellHtml = `<span class="day-number">${i}</span>`;

        const dayOutfits = scheduledOutfits.filter(s => s.date && s.date.startsWith(dateString));
        
        if (dayOutfits.length > 0) {
            let cardsHtml = '';
            dayOutfits.forEach((outfit, idx) => {
                cardsHtml += `
                    <div class="outfit-card-stack" style="--card-index: ${idx}; z-index: ${dayOutfits.length - idx};">
                        <div class="outfit-card-inner">
                            <div class="outfit-card-piece" style="background-image: url('${outfit.top?.imageFilePath || ''}');"></div>
                            <div class="outfit-card-piece" style="background-image: url('${outfit.bottom?.imageFilePath || ''}');"></div>
                            <div class="outfit-card-piece" style="background-image: url('${outfit.shoes?.imageFilePath || ''}');"></div>
                        </div>
                    </div>`;
            });
            cellHtml += `<div class="outfit-cards-container">${cardsHtml}</div>`;
        }

        dayDiv.innerHTML = cellHtml;
        dayDiv.onclick = () => {
            currentSelectedDateStr = dateString;
            updateCalendar(); // Refresh grid to show new border
            renderSidebar(dateString);
        };
        grid.appendChild(dayDiv);
    }
}

function renderSidebar(dateStr) {
    currentSelectedDateStr = dateStr;
    const dateObj = new Date(dateStr + 'T00:00:00');

    document.getElementById('sidebarDateTitle').innerText = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    document.getElementById('sidebarDateSub').innerText = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const contentArea = document.getElementById('sidebarContent');
    const dayOutfits = scheduledOutfits.filter(s => s.date && s.date.startsWith(dateStr));

    if (dayOutfits.length > 0) {
        renderOutfitCard(contentArea, dayOutfits, 0);
    } else {
        contentArea.innerHTML = `
            <div class="flex flex-col items-center justify-center mt-10">
                <i class="fas fa-ghost text-5xl text-gray-200 mb-4"></i>
                <p class="text-gray-400 text-sm">No looks planned for this day.</p>
            </div>`;
    }
}

function renderOutfitCard(contentArea, dayOutfits, index) {
    currentOutfitIndex = index;
    const outfit = dayOutfits[index];
    let stackHtml = '';
    
    if (outfit.top) stackHtml += `<div class="outfit-piece"><img src="${outfit.top.imageFilePath}" alt="Top"></div>`;
    if (outfit.bottom) stackHtml += `<div class="outfit-piece"><img src="${outfit.bottom.imageFilePath}" alt="Bottom"></div>`;
    if (outfit.shoes) stackHtml += `<div class="outfit-piece"><img src="${outfit.shoes.imageFilePath}" alt="Shoes"></div>`;
    
    let navigationHtml = dayOutfits.length > 1 ? `<div class="text-xs text-gray-500 font-semibold mb-4">Outfit ${index + 1} of ${dayOutfits.length}</div>` : '';
    
    contentArea.innerHTML = `
        ${navigationHtml}
        <div class="outfit-display-with-arrows">
            ${dayOutfits.length > 1 ? `<button onclick="changeOutfit(-1)" class="arrow-button arrow-left"><i class="fas fa-chevron-left"></i></button>` : ''}
            <div class="outfit-display">${stackHtml}</div>
            ${dayOutfits.length > 1 ? `<button onclick="changeOutfit(1)" class="arrow-button arrow-right"><i class="fas fa-chevron-right"></i></button>` : ''}
        </div>
        <h3 class="text-xl font-bold text-[var(--text-main)] mb-2 mt-6">${outfit.outfitName}</h3>
        <button onclick="removeOutfitFromDay('${currentSelectedDateStr}', '${outfit.outfitID}')" class="w-full text-red-400 hover:text-red-600 text-sm font-bold transition py-2">
            <i class="fas fa-trash-alt"></i> Remove This Look
        </button>`;
}

function changeOutfit(direction) {
    const dayOutfits = scheduledOutfits.filter(s => s.date && s.date.startsWith(currentSelectedDateStr));
    currentOutfitIndex = (currentOutfitIndex + direction + dayOutfits.length) % dayOutfits.length;
    renderOutfitCard(document.getElementById('sidebarContent'), dayOutfits, currentOutfitIndex);
}

function navigateDay(direction) {
    const d = new Date(currentSelectedDateStr + 'T00:00:00');
    d.setDate(d.getDate() + direction);
    currentSelectedDateStr = d.toISOString().split('T')[0];
    
    if (d.getMonth() !== currentCalendarDate.getMonth() || d.getFullYear() !== currentCalendarDate.getFullYear()) {
        currentCalendarDate = new Date(d);
        currentCalendarDate.setDate(1); // Safety for the 31st overflow
        updateCalendar();
    } else {
        updateCalendar(); 
    }
    renderSidebar(currentSelectedDateStr);
}

function openScheduleModal() {
    const select = document.getElementById('outfitSelect');
    select.innerHTML = lookbookOutfits.map(o => `<option value="${o.outfitID}">${o.outfitName}</option>`).join('');
    if (lookbookOutfits.length === 0) select.innerHTML = '<option disabled selected>Create an outfit first!</option>';
    document.getElementById('datePicker').value = currentSelectedDateStr;
    document.getElementById('scheduleModal').style.display = 'flex';
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').style.display = 'none';
}

async function confirmSchedule() {
    const outfitId = document.getElementById('outfitSelect').value;
    const date = document.getElementById('datePicker').value;
    if (!outfitId || !date) return;

    try {
        const response = await fetch(await getApiUrl('/calendar'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, outfitID: outfitId })
        });
        if (response.ok) {
            await loadCalendarData();
            closeScheduleModal();
        }
    } catch (err) {
        console.error(err);
    }
}

async function removeOutfitFromDay(dateStr, outfitId) {
    if (!confirm('Remove this outfit?')) return;
    try {
        const response = await fetch(await getApiUrl(`/calendar/${dateStr}?outfitId=${outfitId}`), { method: 'DELETE' });
        if (response.ok) await loadCalendarData();
    } catch (err) {
        console.error(err);
    }
}

function prevMonth() {
    currentCalendarDate.setDate(1); 
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    updateCalendar();
}

function nextMonth() {
    currentCalendarDate.setDate(1); 
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    updateCalendar();
}

window.addEventListener('DOMContentLoaded', () => {
    loadCalendarData();

    const leftBtn = document.getElementById('prevMonthBtn') || document.querySelector('.fa-chevron-left');
    const rightBtn = document.getElementById('nextMonthBtn') || document.querySelector('.fa-chevron-right');
    
    if (leftBtn) leftBtn.onclick = prevMonth;
    if (rightBtn) rightBtn.onclick = nextMonth;
});