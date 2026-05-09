const { getApiUrl, normalizeOutfits, showToast, openModal, closeModal, withPending } = window.WardrobeCore;

let currentCalendarDate = new Date();
let scheduledOutfits = [];
let lookbookOutfits = [];
let currentSelectedDateStr = formatDateLocal(new Date());
let currentOutfitIndex = 0;

// Helpers to cope with varying backend shapes
function getScheduledDate(s) {
    return s?.date ?? s?.scheduledDate ?? s?.ScheduledDate ?? s?.Date ?? null;
}
function getOutfitId(o) {
    return o?.outfitID ?? o?.outfitId ?? o?.OutfitID ?? o?.id ?? '';
}
function getImgPath(it) {
    return it?.imageFilePath ?? it?.image ?? it?.imageFile ?? '';
}

function formatDateLocal(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isMobileCalendarView() {
    return window.matchMedia('(max-width: 1023px)').matches || window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

function scrollToScheduledOutfits() {
    const sidebar = document.getElementById('calendarSidebar') || document.getElementById('sidebarContent');
    if (!sidebar) return;
    requestAnimationFrame(() => {
        sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

function animateSelectedCalendarDay() {
    const selectedCell = document.querySelector(`.cal-day-box[data-date="${currentSelectedDateStr}"]`);
    if (!selectedCell) return;
    selectedCell.classList.remove('day-select-pulse');
    void selectedCell.offsetWidth;
    selectedCell.classList.add('day-select-pulse');
}

function animateFadeIn(element) {
    if (!element) return;
    element.classList.remove('ui-fade-in');
    void element.offsetWidth;
    element.classList.add('ui-fade-in');
}

function renderCalendarLoading() {
    const grid = document.getElementById('calendarGrid');
    const sidebarContent = document.getElementById('sidebarContent');
    if (grid) {
        grid.innerHTML = Array.from({ length: 35 }, () =>
            '<div class="calendar-skeleton-cell skeleton-shimmer"></div>'
        ).join('');
    }
    if (sidebarContent) {
        sidebarContent.innerHTML = `
            <div class="sidebar-skeleton-line skeleton-shimmer"></div>
            <div class="sidebar-skeleton-line skeleton-shimmer"></div>
            <div class="sidebar-skeleton-card skeleton-shimmer"></div>
        `;
    }
}

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
    renderCalendarLoading();
    try {
        const [calendarRes, lookbookRes] = await Promise.all([
            fetch(await getApiUrl('/calendar')),
            fetch(await getApiUrl('/lookbook'))
        ]);
        let calendarRaw = null;
        let lookbookRaw = null;
        if (calendarRes.ok) {
            calendarRaw = await calendarRes.json();
            scheduledOutfits = normalizeOutfits(calendarRaw);
        } else {
            console.warn('Calendar API returned not-ok', calendarRes.status);
        }
        if (lookbookRes.ok) {
            lookbookRaw = await lookbookRes.json();
            lookbookOutfits = normalizeOutfits(lookbookRaw);
        } else {
            console.warn('Lookbook API returned not-ok', lookbookRes.status);
        }

        // Debugging logs to help identify why calendar shows empty
        console.debug('[Calendar] raw calendar:', calendarRaw);
        console.debug('[Calendar] normalized scheduledOutfits:', scheduledOutfits);
        console.debug('[Calendar] raw lookbook:', lookbookRaw);
        console.debug('[Calendar] normalized lookbookOutfits:', lookbookOutfits);

        updateCalendar();
        renderSidebar(currentSelectedDateStr);
    } catch (err) {
        console.error('Error loading calendar data:', err);
        showToast('Failed to load calendar data.', 'error');
    }
}

function updateSelectedCalendarDate(selectedDate) {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    const previous = grid.querySelector('.cal-day-box[data-selected="true"]');
    if (previous) {
        previous.classList.remove('border-[#8c7862]', 'border-2');
        previous.removeAttribute('data-selected');
    }

    const next = grid.querySelector(`.cal-day-box[data-date="${selectedDate}"]`);
    if (next) {
        next.classList.add('border-[#8c7862]', 'border-2');
        next.setAttribute('data-selected', 'true');
    }
}

function updateCalendar() {
    try {
        console.debug('[Calendar] updateCalendar called. currentCalendarDate=', currentCalendarDate);
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const monthEl = document.getElementById('currentMonthYear');
        if (monthEl) monthEl.innerText = `${monthNames[month]} ${year}`;

        const grid = document.getElementById('calendarGrid');
        if (!grid) { console.error('[Calendar] calendarGrid element not found'); return; }
        grid.innerHTML = '';

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const todayStr = formatDateLocal(new Date());

        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('opacity-0');
            grid.appendChild(emptyDiv);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            const dateString = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;

            dayDiv.classList.add('cal-day-box');
            dayDiv.dataset.date = dateString;
            if (dateString === todayStr) dayDiv.classList.add('active');
            if (dateString === currentSelectedDateStr) {
                dayDiv.classList.add('border-[#8c7862]', 'border-2');
                dayDiv.setAttribute('data-selected', 'true');
            }

            let cellHtml = `<span class="day-number">${i}</span>`;

            const dayOutfits = scheduledOutfits.filter(s => {
                const sd = getScheduledDate(s);
                return sd && sd.startsWith(dateString);
            });
            
            if (dayOutfits.length > 0) {
                let cardsHtml = '';
                dayOutfits.forEach((outfit, idx) => {
                    const topImg = getImgPath(outfit.top);
                    const bottomImg = getImgPath(outfit.bottom);
                    const shoesImg = getImgPath(outfit.shoes);
                    cardsHtml += `
                        <div class="outfit-card-stack" style="--card-index: ${idx}; z-index: ${dayOutfits.length - idx};">
                            <div class="outfit-card-inner">
                                <div class="outfit-card-piece" style="background-image: url('${topImg}');"></div>
                                <div class="outfit-card-piece" style="background-image: url('${bottomImg}');"></div>
                                <div class="outfit-card-piece" style="background-image: url('${shoesImg}');"></div>
                            </div>
                        </div>`;
                });
                cellHtml += `<div class="outfit-cards-container">${cardsHtml}</div>`;
            }

            dayDiv.innerHTML = cellHtml;
            dayDiv.onclick = () => {
                currentSelectedDateStr = dateString;
                updateSelectedCalendarDate(dateString);
                if (isMobileCalendarView()) {
                    animateSelectedCalendarDay();
                }
                renderSidebar(dateString);
                if (isMobileCalendarView()) {
                    scrollToScheduledOutfits();
                }
            };
            grid.appendChild(dayDiv);
        }
    } catch (err) {
        console.error('[Calendar] failed to update calendar:', err);
    }
}

function renderSidebar(dateStr) {
    currentSelectedDateStr = dateStr;
    const dateObj = new Date(dateStr + 'T00:00:00');

    document.getElementById('sidebarDateTitle').innerText = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    document.getElementById('sidebarDateSub').innerText = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const contentArea = document.getElementById('sidebarContent');
    const getScheduledDate = (s) => s?.date ?? s?.scheduledDate ?? s?.ScheduledDate ?? s?.Date ?? null;
    const dayOutfits = scheduledOutfits.filter(s => {
        const sd = getScheduledDate(s);
        return sd && sd.startsWith(dateStr);
    });

    if (dayOutfits.length > 0) {
        renderOutfitCard(contentArea, dayOutfits, 0);
    } else {
        contentArea.innerHTML = `
            <div class="flex flex-col items-center justify-center mt-10">
                <i class="fas fa-ghost text-5xl text-gray-200 mb-4"></i>
                <p class="text-gray-400 text-sm">No looks planned for this day.</p>
            </div>`;
    }
    animateFadeIn(contentArea);
}

function renderOutfitCard(contentArea, dayOutfits, index) {
    currentOutfitIndex = index;
    const outfit = dayOutfits[index];
    let stackHtml = '';
    const getImgPath = (it) => it?.imageFilePath ?? it?.image ?? it?.imageFile ?? '';

    if (outfit.top) {
        const p = getImgPath(outfit.top);
        stackHtml += `<div class="outfit-piece">${p ? `<img src="${p}" alt="Top">` : `<i class='fas fa-tshirt text-gray-300 text-2xl'></i>`}</div>`;
    }
    if (outfit.bottom) {
        const p = getImgPath(outfit.bottom);
        stackHtml += `<div class="outfit-piece">${p ? `<img src="${p}" alt="Bottom">` : `<i class='fas fa-tshirt text-gray-300 text-2xl'></i>`}</div>`;
    }
    if (outfit.shoes) {
        const p = getImgPath(outfit.shoes);
        stackHtml += `<div class="outfit-piece">${p ? `<img src="${p}" alt="Shoes">` : `<i class='fas fa-shoe-prints text-gray-300 text-2xl'></i>`}</div>`;
    }
    
    let navigationHtml = dayOutfits.length > 1 ? `<div class="text-xs text-gray-500 font-semibold mb-4">Outfit ${index + 1} of ${dayOutfits.length}</div>` : '';
    
    const resolvedOutfitId = outfit.outfitID ?? outfit.outfitId ?? outfit.OutfitID ?? outfit.id ?? '';
    contentArea.innerHTML = `
        ${navigationHtml}
        <div class="outfit-display-with-arrows">
            ${dayOutfits.length > 1 ? `<button onclick="changeOutfit(-1)" class="arrow-button arrow-left"><i class="fas fa-chevron-left"></i></button>` : ''}
            <div class="outfit-display">${stackHtml}</div>
            ${dayOutfits.length > 1 ? `<button onclick="changeOutfit(1)" class="arrow-button arrow-right"><i class="fas fa-chevron-right"></i></button>` : ''}
        </div>
        <h3 class="text-xl font-bold text-[var(--text-main)] mb-2 mt-6">${outfit.outfitName ?? outfit.OutfitName ?? 'Untitled Outfit'}</h3>
        <button onclick="removeOutfitFromDay(event, this, '${currentSelectedDateStr}', '${resolvedOutfitId}')" class="w-full text-red-400 hover:text-red-600 text-sm font-bold transition py-2">
            <i class="fas fa-trash-alt"></i> Remove This Look
        </button>`;
}

function changeOutfit(direction) {
    const getScheduledDate = (s) => s?.date ?? s?.scheduledDate ?? s?.ScheduledDate ?? s?.Date ?? null;
    const dayOutfits = scheduledOutfits.filter(s => {
        const sd = getScheduledDate(s);
        return sd && sd.startsWith(currentSelectedDateStr);
    });
    if (!dayOutfits.length) return;
    currentOutfitIndex = (currentOutfitIndex + direction + dayOutfits.length) % dayOutfits.length;
    renderOutfitCard(document.getElementById('sidebarContent'), dayOutfits, currentOutfitIndex);
}

function navigateDay(direction) {
    const d = new Date(currentSelectedDateStr + 'T00:00:00');
    d.setDate(d.getDate() + direction);
    currentSelectedDateStr = formatDateLocal(d);
    
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
    openModal(document.getElementById('scheduleModal'));
}

function closeScheduleModal() {
    closeModal(document.getElementById('scheduleModal'));
}

async function confirmSchedule(buttonElement) {
    await withPending(buttonElement, async () => {
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
            const selectedOutfit = lookbookOutfits.find(o => o.outfitID === outfitId);
            if (selectedOutfit && !scheduledOutfits.some(s => getScheduledDate(s) === date && getOutfitId(s) === outfitId)) {
                scheduledOutfits.push({ ...selectedOutfit, date });
                if (currentCalendarDate.getFullYear() === new Date(date + 'T00:00:00').getFullYear() &&
                    currentCalendarDate.getMonth() === new Date(date + 'T00:00:00').getMonth()) {
                    updateCalendar();
                }
                if (currentSelectedDateStr === date) {
                    renderSidebar(date);
                }
            }
            closeScheduleModal();
            showToast('Outfit scheduled.', 'success');
            loadCalendarData();
        }
    } catch (err) {
        console.error(err);
        showToast('Failed to schedule outfit.', 'error');
    }
    }, 'Saving...');
}

async function removeOutfitFromDay(event, sourceEl, dateStr, outfitId) {
    event.preventDefault();
    event.stopPropagation();
    if (!confirm('Remove this outfit?')) return;
    try {
        const response = await fetch(await getApiUrl(`/calendar/${dateStr}?outfitId=${outfitId}`), { method: 'DELETE' });
        if (response.ok) {
            const contentArea = document.getElementById('sidebarContent');
            const animatedTarget = sourceEl?.closest?.('.outfit-display-with-arrows')?.parentElement || contentArea;
            if (animatedTarget) {
                animatedTarget.classList.add('deleting-exit');
                await new Promise(resolve => setTimeout(resolve, 260));
            }
            await loadCalendarData();
            showToast('Scheduled look removed.', 'success');
        }
    } catch (err) {
        console.error(err);
        showToast('Failed to remove schedule.', 'error');
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
