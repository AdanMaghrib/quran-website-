/**
 * ملف JavaScript للتقويم الهجري التفاعلي
 * يستخدم مكتبة Moment.js ومكتبة Moment Hijri للتعامل مع التقويم الهجري
 */

// المتغيرات العامة
let currentHijriDate; // التاريخ الهجري الحالي
let currentHijriMonth; // الشهر الهجري الحالي
let currentHijriYear; // السنة الهجرية الحالية
let selectedDate; // التاريخ المحدد

// المناسبات الإسلامية
const islamicEvents = [
    { title: "رأس السنة الهجرية", month: 1, day: 1, description: "بداية العام الهجري الجديد." },
    { title: "عاشوراء", month: 1, day: 10, description: "يوم صيام اختياري، ذكرى نجاة موسى عليه السلام وقومه من فرعون." },
    { title: "المولد النبوي الشريف", month: 3, day: 12, description: "ذكرى مولد النبي محمد صلى الله عليه وسلم." },
    { title: "ليلة الإسراء والمعراج", month: 7, day: 27, description: "ذكرى رحلة النبي محمد صلى الله عليه وسلم من المسجد الحرام إلى المسجد الأقصى ثم إلى السماوات العلى." },
    { title: "بداية شهر رمضان", month: 9, day: 1, description: "شهر الصيام والعبادة، نزل فيه القرآن الكريم." },
    { title: "ليلة القدر (المتوقعة)", month: 9, day: 27, description: "ليلة القدر خير من ألف شهر." },
    { title: "عيد الفطر", month: 10, day: 1, description: "عيد المسلمين بعد إتمام شهر رمضان المبارك." },
    { title: "وقفة عرفة", month: 12, day: 9, description: "يوم الوقوف بعرفة، ركن من أركان الحج." },
    { title: "عيد الأضحى", month: 12, day: 10, description: "عيد التضحية والفداء، ذكرى تضحية سيدنا إبراهيم عليه السلام." }
];

// عند تحميل المستند
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة التقويم الهجري
    initHijriCalendar();
    
    // إضافة مستمعي الأحداث
    addEventListeners();
    
    // تحديث السنة في التذييل
    document.getElementById('current-year').textContent = new Date().getFullYear();
});

/**
 * تهيئة التقويم الهجري
 */
function initHijriCalendar() {
    // تعيين اللغة العربية لمكتبة Moment.js
    moment.locale('ar');
    
    // الحصول على التاريخ الهجري الحالي
    currentHijriDate = moment().locale('ar-SA').format('iYYYY/iM/iD');
    const hijriMoment = moment().locale('ar-SA');
    currentHijriMonth = parseInt(hijriMoment.format('iM'));
    currentHijriYear = parseInt(hijriMoment.format('iYYYY'));
    
    // تحديث عنوان الشهر الحالي
    updateCurrentMonthTitle();
    
    // عرض التقويم الشهري
    renderMonthCalendar(currentHijriMonth, currentHijriYear);
    
    // تهيئة محول التواريخ
    initDateConverter();
}

/**
 * تحديث عنوان الشهر الحالي
 */
function updateCurrentMonthTitle() {
    const monthNames = [
        "محرم", "صفر", "ربيع الأول", "ربيع الثاني",
        "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
        "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
    ];
    
    const monthTitle = document.getElementById('current-month');
    if (monthTitle) {
        monthTitle.textContent = `${monthNames[currentHijriMonth - 1]} ${currentHijriYear}`;
    }
}

/**
 * عرض التقويم الشهري
 * @param {number} month - الشهر الهجري (1-12)
 * @param {number} year - السنة الهجرية
 */
function renderMonthCalendar(month, year) {
    const calendarDays = document.getElementById('calendar-days');
    if (!calendarDays) return;
    
    // تفريغ محتوى التقويم
    calendarDays.innerHTML = '';
    
    // الحصول على اليوم الأول من الشهر
    const firstDay = moment(`${year}/${month}/1`, 'iYYYY/iM/iD');
    const startDayOfWeek = firstDay.day(); // 0 = الأحد، 6 = السبت
    
    // الحصول على عدد أيام الشهر
    const daysInMonth = firstDay.daysInMonth();
    
    // الحصول على التاريخ الحالي
    const today = moment();
    const todayHijri = today.format('iYYYY/iM/iD');
    
    // إضافة الأيام السابقة من الشهر السابق
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const daysInPrevMonth = moment(`${prevYear}/${prevMonth}/1`, 'iYYYY/iM/iD').daysInMonth();
    
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const date = moment(`${prevYear}/${prevMonth}/${day}`, 'iYYYY/iM/iD');
        const gregorianDate = date.format('YYYY/M/D');
        
        const dayElement = createDayElement(day, date, true);
        calendarDays.appendChild(dayElement);
    }
    
    // إضافة أيام الشهر الحالي
    for (let day = 1; day <= daysInMonth; day++) {
        const date = moment(`${year}/${month}/${day}`, 'iYYYY/iM/iD');
        const hijriDate = `${year}/${month}/${day}`;
        const gregorianDate = date.format('YYYY/M/D');
        
        const isToday = hijriDate === todayHijri;
        
        const dayElement = createDayElement(day, date, false, isToday);
        calendarDays.appendChild(dayElement);
    }
    
    // إضافة الأيام التالية من الشهر التالي
    const totalDaysAdded = startDayOfWeek + daysInMonth;
    const remainingDays = 42 - totalDaysAdded; // 6 صفوف × 7 أيام = 42
    
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    
    for (let day = 1; day <= remainingDays; day++) {
        const date = moment(`${nextYear}/${nextMonth}/${day}`, 'iYYYY/iM/iD');
        const gregorianDate = date.format('YYYY/M/D');
        
        const dayElement = createDayElement(day, date, true);
        calendarDays.appendChild(dayElement);
    }
}

/**
 * إنشاء عنصر يوم في التقويم
 * @param {number} day - رقم اليوم
 * @param {object} date - كائن التاريخ (Moment.js)
 * @param {boolean} isOtherMonth - هل اليوم من شهر آخر
 * @param {boolean} isToday - هل اليوم هو اليوم الحالي
 * @returns {HTMLElement} - عنصر اليوم
 */
function createDayElement(day, date, isOtherMonth, isToday = false) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (isToday) {
        dayElement.classList.add('today');
    }
    
    // الحصول على التاريخ الهجري
    const hijriDay = day;
    const hijriMonth = parseInt(date.format('iM'));
    const hijriYear = parseInt(date.format('iYYYY'));
    
    // الحصول على التاريخ الميلادي
    const gregorianDay = date.format('D');
    const gregorianMonth = date.format('M');
    const gregorianYear = date.format('YYYY');
    
    // التحقق من وجود مناسبات في هذا اليوم
    const events = getEventsForDay(hijriDay, hijriMonth);
    if (events.length > 0) {
        dayElement.classList.add('has-event');
    }
    
    // إضافة محتوى اليوم
    dayElement.innerHTML = `
        <div class="day-number">
            <span class="hijri-day">${hijriDay}</span>
            <span class="gregorian-day">${gregorianDay}/${gregorianMonth}</span>
        </div>
    `;
    
    // إضافة المناسبات إذا وجدت
    if (events.length > 0) {
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'day-events';
        
        events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.innerHTML = `<span class="event-indicator"></span> ${event.title}`;
            eventsContainer.appendChild(eventElement);
        });
        
        dayElement.appendChild(eventsContainer);
    }
    
    // إضافة مستمع حدث النقر
    dayElement.addEventListener('click', function() {
        selectDate(date);
    });
    
    return dayElement;
}

/**
 * الحصول على المناسبات لليوم المحدد
 * @param {number} day - اليوم
 * @param {number} month - الشهر
 * @returns {Array} - قائمة المناسبات
 */
function getEventsForDay(day, month) {
    return islamicEvents.filter(event => event.day === day && event.month === month);
}

/**
 * تحديد تاريخ
 * @param {object} date - كائن التاريخ (Moment.js)
 */
function selectDate(date) {
    selectedDate = date;
    
    // عرض معلومات التاريخ المحدد
    const hijriDate = date.format('iYYYY/iM/iD');
    const gregorianDate = date.format('YYYY/MM/DD');
    
    // الحصول على المناسبات لهذا اليوم
    const hijriDay = parseInt(date.format('iD'));
    const hijriMonth = parseInt(date.format('iM'));
    const events = getEventsForDay(hijriDay, hijriMonth);
    
    // عرض معلومات التاريخ في نتيجة التحويل
    const conversionDisplay = document.getElementById('conversion-display');
    if (conversionDisplay) {
        let displayText = `
            <p><strong>التاريخ الهجري:</strong> ${date.format('iD iMMMM iYYYY')}</p>
            <p><strong>التاريخ الميلادي:</strong> ${date.format('D MMMM YYYY')}</p>
            <p><strong>اليوم:</strong> ${date.format('dddd')}</p>
        `;
        
        if (events.length > 0) {
            displayText += '<p><strong>المناسبات:</strong></p>';
            events.forEach(event => {
                displayText += `<p>- ${event.title}: ${event.description}</p>`;
            });
        }
        
        conversionDisplay.innerHTML = displayText;
    }
}

/**
 * عرض التقويم السنوي
 * @param {number} year - السنة الهجرية
 */
function renderYearCalendar(year) {
    const yearCalendar = document.getElementById('year-calendar');
    if (!yearCalendar) return;
    
    // تفريغ محتوى التقويم
    yearCalendar.innerHTML = '';
    
    const monthNames = [
        "محرم", "صفر", "ربيع الأول", "ربيع الثاني",
        "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
        "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
    ];
    
    const weekDays = ["أح", "إث", "ثل", "أر", "خم", "جم", "سب"];
    
    // الحصول على التاريخ الحالي
    const today = moment();
    const todayHijriDay = parseInt(today.format('iD'));
    const todayHijriMonth = parseInt(today.format('iM'));
    const todayHijriYear = parseInt(today.format('iYYYY'));
    
    // إنشاء بطاقة لكل شهر
    for (let month = 1; month <= 12; month++) {
        const monthCard = document.createElement('div');
        monthCard.className = 'month-card';
        
        // عنوان الشهر
        const monthTitle = document.createElement('h3');
        monthTitle.textContent = `${monthNames[month - 1]} ${year}`;
        monthCard.appendChild(monthTitle);
        
        // شبكة أيام الأسبوع
        const monthGrid = document.createElement('div');
        monthGrid.className = 'month-grid';
        
        // إضافة أسماء أيام الأسبوع
        weekDays.forEach(day => {
            const weekdayElement = document.createElement('div');
            weekdayElement.className = 'month-weekday';
            weekdayElement.textContent = day;
            monthGrid.appendChild(weekdayElement);
        });
        
        // الحصول على اليوم الأول من الشهر
        const firstDay = moment(`${year}/${month}/1`, 'iYYYY/iM/iD');
        const startDayOfWeek = firstDay.day(); // 0 = الأحد، 6 = السبت
        
        // الحصول على عدد أيام الشهر
        const daysInMonth = firstDay.daysInMonth();
        
        // إضافة الأيام الفارغة قبل بداية الشهر
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'month-day empty';
            monthGrid.appendChild(emptyDay);
        }
        
        // إضافة أيام الشهر
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'month-day';
            dayElement.textContent = day;
            
            // التحقق من اليوم الحالي
            if (day === todayHijriDay && month === todayHijriMonth && year === todayHijriYear) {
                dayElement.classList.add('today');
            }
            
            // التحقق من وجود مناسبات
            const events = getEventsForDay(day, month);
            if (events.length > 0) {
                dayElement.classList.add('has-event');
            }
            
            // إضافة مستمع حدث النقر
            dayElement.addEventListener('click', function() {
                const date = moment(`${year}/${month}/${day}`, 'iYYYY/iM/iD');
                selectDate(date);
                
                // تبديل العرض إلى الشهري وعرض الشهر المحدد
                document.getElementById('month-view').click();
                currentHijriMonth = month;
                currentHijriYear = year;
                updateCurrentMonthTitle();
                renderMonthCalendar(month, year);
            });
            
            monthGrid.appendChild(dayElement);
        }
        
        monthCard.appendChild(monthGrid);
        
        // إضافة مستمع حدث النقر على بطاقة الشهر
        monthCard.addEventListener('click', function(e) {
            if (e.target === monthCard || e.target === monthTitle) {
                // تبديل العرض إلى الشهري وعرض الشهر المحدد
                document.getElementById('month-view').click();
                currentHijriMonth = month;
                currentHijriYear = year;
                updateCurrentMonthTitle();
                renderMonthCalendar(month, year);
            }
        });
        
        yearCalendar.appendChild(monthCard);
    }
}

/**
 * تهيئة محول التواريخ
 */
function initDateConverter() {
    // تهيئة حقل التاريخ الميلادي
    const gregorianDateInput = document.getElementById('gregorian-date-input');
    if (gregorianDateInput) {
        // تعيين التاريخ الحالي
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        gregorianDateInput.value = `${year}-${month}-${day}`;
    }
    
    // تهيئة حقول التاريخ الهجري
    const hijriDaySelect = document.getElementById('hijri-day');
    const hijriMonthSelect = document.getElementById('hijri-month');
    const hijriYearSelect = document.getElementById('hijri-year');
    
    if (hijriDaySelect && hijriMonthSelect && hijriYearSelect) {
        // إضافة خيارات الأيام (1-30)
        for (let day = 1; day <= 30; day++) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day;
            hijriDaySelect.appendChild(option);
        }
        
        // إضافة خيارات الأشهر
        const monthNames = [
            "محرم", "صفر", "ربيع الأول", "ربيع الثاني",
            "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
            "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
        ];
        
        for (let month = 1; month <= 12; month++) {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = monthNames[month - 1];
            hijriMonthSelect.appendChild(option);
        }
        
        // إضافة خيارات السنوات (1400-1500)
        for (let year = 1400; year <= 1500; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            hijriYearSelect.appendChild(option);
        }
        
        // تعيين التاريخ الهجري الحالي
        const today = moment();
        hijriDaySelect.value = today.format('iD');
        hijriMonthSelect.value = today.format('iM');
        hijriYearSelect.value = today.format('iYYYY');
    }
}

/**
 * إضافة مستمعي الأحداث
 */
function addEventListeners() {
    // أزرار التنقل بين الأشهر
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
            navigateMonth(-1);
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
            navigateMonth(1);
        });
    }
    
    // زر اليوم
    const todayBtn = document.getElementById('today-btn');
    if (todayBtn) {
        todayBtn.addEventListener('click', function() {
            // العودة إلى الشهر الحالي
            const today = moment();
            currentHijriMonth = parseInt(today.format('iM'));
            currentHijriYear = parseInt(today.format('iYYYY'));
            
            updateCurrentMonthTitle();
            renderMonthCalendar(currentHijriMonth, currentHijriYear);
            
            // تحديد اليوم الحالي
            selectDate(today);
        });
    }
    
    // أزرار تبديل العرض
    const monthViewBtn = document.getElementById('month-view');
    const yearViewBtn = document.getElementById('year-view');
    
    if (monthViewBtn && yearViewBtn) {
        monthViewBtn.addEventListener('click', function() {
            // تبديل العرض إلى الشهري
            document.getElementById('month-calendar').style.display = 'block';
            document.getElementById('year-calendar').style.display = 'none';
            
            // تحديث الأزرار النشطة
            monthViewBtn.classList.add('active');
            yearViewBtn.classList.remove('active');
        });
        
        yearViewBtn.addEventListener('click', function() {
            // تبديل العرض إلى السنوي
            document.getElementById('month-calendar').style.display = 'none';
            document.getElementById('year-calendar').style.display = 'grid';
            
            // تحديث الأزرار النشطة
            monthViewBtn.classList.remove('active');
            yearViewBtn.classList.add('active');
            
            // عرض التقويم السنوي
            renderYearCalendar(currentHijriYear);
        });
    }
    
    // أزرار التحويل
    const convertToHijriBtn = document.getElementById('convert-to-hijri');
    const convertToGregorianBtn = document.getElementById('convert-to-gregorian');
    
    if (convertToHijriBtn) {
        convertToHijriBtn.addEventListener('click', function() {
            convertGregorianToHijri();
        });
    }
    
    if (convertToGregorianBtn) {
        convertToGregorianBtn.addEventListener('click', function() {
            convertHijriToGregorian();
        });
    }
}

/**
 * التنقل بين الأشهر
 * @param {number} direction - اتجاه التنقل (1 للأمام، -1 للخلف)
 */
function navigateMonth(direction) {
    // تحديث الشهر والسنة
    currentHijriMonth += direction;
    
    // التعامل مع تغيير السنة
    if (currentHijriMonth > 12) {
        currentHijriMonth = 1;
        currentHijriYear++;
    } else if (currentHijriMonth < 1) {
        currentHijriMonth = 12;
        currentHijriYear--;
    }
    
    // تحديث عنوان الشهر
    updateCurrentMonthTitle();
    
    // إعادة عرض التقويم
    renderMonthCalendar(currentHijriMonth, currentHijriYear);
}

/**
 * تحويل التاريخ الميلادي إلى هجري
 */
function convertGregorianToHijri() {
    const gregorianDateInput = document.getElementById('gregorian-date-input');
    const hijriDaySelect = document.getElementById('hijri-day');
    const hijriMonthSelect = document.getElementById('hijri-month');
    const hijriYearSelect = document.getElementById('hijri-year');
    const conversionDisplay = document.getElementById('conversion-display');
    
    if (gregorianDateInput && hijriDaySelect && hijriMonthSelect && hijriYearSelect && conversionDisplay) {
        const gregorianDate = gregorianDateInput.value;
        if (!gregorianDate) {
            alert('الرجاء إدخال تاريخ ميلادي صحيح');
            return;
        }
        
        // تحويل التاريخ الميلادي إلى هجري
        const date = moment(gregorianDate);
        const hijriDate = date.format('iYYYY/iM/iD');
        
        // تحديث حقول التاريخ الهجري
        hijriDaySelect.value = date.format('iD');
        hijriMonthSelect.value = date.format('iM');
        hijriYearSelect.value = date.format('iYYYY');
        
        // عرض نتيجة التحويل
        conversionDisplay.innerHTML = `
            <p><strong>التاريخ الميلادي:</strong> ${date.format('D MMMM YYYY')}</p>
            <p><strong>التاريخ الهجري:</strong> ${date.format('iD iMMMM iYYYY')}</p>
            <p><strong>اليوم:</strong> ${date.format('dddd')}</p>
        `;
    }
}

/**
 * تحويل التاريخ الهجري إلى ميلادي
 */
function convertHijriToGregorian() {
    const gregorianDateInput = document.getElementById('gregorian-date-input');
    const hijriDaySelect = document.getElementById('hijri-day');
    const hijriMonthSelect = document.getElementById('hijri-month');
    const hijriYearSelect = document.getElementById('hijri-year');
    const conversionDisplay = document.getElementById('conversion-display');
    
    if (gregorianDateInput && hijriDaySelect && hijriMonthSelect && hijriYearSelect && conversionDisplay) {
        const hijriDay = hijriDaySelect.value;
        const hijriMonth = hijriMonthSelect.value;
        const hijriYear = hijriYearSelect.value;
        
        if (!hijriDay || !hijriMonth || !hijriYear) {
            alert('الرجاء إدخال تاريخ هجري صحيح');
            return;
        }
        
        // تحويل التاريخ الهجري إلى ميلادي
        const date = moment(`${hijriYear}/${hijriMonth}/${hijriDay}`, 'iYYYY/iM/iD');
        const gregorianDate = date.format('YYYY-MM-DD');
        
        // تحديث حقل التاريخ الميلادي
        gregorianDateInput.value = gregorianDate;
        
        // عرض نتيجة التحويل
        conversionDisplay.innerHTML = `
            <p><strong>التاريخ الهجري:</strong> ${date.format('iD iMMMM iYYYY')}</p>
            <p><strong>التاريخ الميلادي:</strong> ${date.format('D MMMM YYYY')}</p>
            <p><strong>اليوم:</strong> ${date.format('dddd')}</p>
        `;
    }
}
