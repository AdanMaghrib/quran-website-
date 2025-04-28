/**
 * تحسين عرض التاريخ الهجري والميلادي
 * يستخدم مكتبة Moment.js ومكتبة Moment Hijri للتعامل مع التقويم الهجري
 */

// عند تحميل المستند
document.addEventListener('DOMContentLoaded', function() {
    // تحديث التاريخ الهجري والميلادي بشكل فوري
    updateDatesImproved();
});

/**
 * تحديث التاريخ الهجري والميلادي بطريقة محسنة
 */
function updateDatesImproved() {
    const hijriDateContainer = document.getElementById('hijri-date');
    const gregorianDateContainer = document.getElementById('gregorian-date');
    
    if (hijriDateContainer && gregorianDateContainer) {
        // تعيين اللغة العربية لمكتبة Moment.js
        moment.locale('ar');
        
        // الحصول على التاريخ الميلادي الحالي
        const today = moment();
        
        // تنسيق التاريخ الميلادي
        const gregorianDate = {
            formatted: today.format('D MMMM YYYY'),
            day: today.format('dddd'),
            month: today.format('MMMM'),
            year: today.format('YYYY')
        };
        
        // عرض التاريخ الميلادي
        gregorianDateContainer.innerHTML = `
            <div class="date-display">${gregorianDate.formatted}</div>
            <div class="date-info">
                <span>${gregorianDate.day}</span>
                <span>${gregorianDate.month}</span>
                <span>${gregorianDate.year}</span>
            </div>
        `;
        
        // الحصول على التاريخ الهجري المقابل باستخدام مكتبة Moment Hijri
        const hijriToday = today.clone().locale('ar-SA');
        
        // تنسيق التاريخ الهجري
        const hijriDate = {
            formatted: hijriToday.format('iD iMMMM iYYYY'),
            day: hijriToday.format('dddd'),
            month: hijriToday.format('iMMMM'),
            year: hijriToday.format('iYYYY')
        };
        
        // عرض التاريخ الهجري
        hijriDateContainer.innerHTML = `
            <div class="date-display">${hijriDate.formatted}</div>
            <div class="date-info">
                <span>${hijriDate.day}</span>
                <span>${hijriDate.month}</span>
                <span>${hijriDate.year}</span>
            </div>
        `;
    }
}
