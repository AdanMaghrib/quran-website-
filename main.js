/**
 * ملف JavaScript الرئيسي للموقع
 * يتعامل مع الوظائف المشتركة والتهيئة العامة
 */

// عند تحميل المستند
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة عناصر واجهة المستخدم
    initUI();
    
    // تحديث التاريخ الهجري والميلادي
    updateDates();
    
    // إضافة مستمعي الأحداث
    addEventListeners();
    
    // تحميل المحتوى اليومي (الذكر والحديث)
    loadDailyContent();
    
    // تحديث السنة في التذييل
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
});

/**
 * تهيئة عناصر واجهة المستخدم
 */
function initUI() {
    // تهيئة القائمة المتجاوبة
    initMobileMenu();
}

/**
 * تهيئة القائمة المتجاوبة للأجهزة المحمولة
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        // إضافة مستمع الحدث للنقر على زر القائمة
        menuToggle.addEventListener('click', function() {
            // تبديل حالة القائمة
            navLinks.classList.toggle('active');
            
            // تغيير شكل زر القائمة
            const spans = menuToggle.querySelectorAll('span');
            if (spans.length >= 3) {
                if (navLinks.classList.contains('active')) {
                    // تحويل الزر إلى علامة X
                    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
                } else {
                    // إعادة الزر إلى الشكل الأصلي
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            }
        });
        
        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', function(event) {
            if (!event.target.closest('nav') && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                
                // إعادة الزر إلى الشكل الأصلي
                const spans = menuToggle.querySelectorAll('span');
                if (spans.length >= 3) {
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            }
        });
        
        // منع انتشار الحدث من زر القائمة
        menuToggle.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
    
    // إغلاق القائمة عند النقر على أي رابط
    const navLinkItems = document.querySelectorAll('.nav-links a');
    navLinkItems.forEach(link => {
        link.addEventListener('click', function() {
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                
                // إعادة زر القائمة إلى الشكل الأصلي
                if (menuToggle) {
                    const spans = menuToggle.querySelectorAll('span');
                    if (spans.length >= 3) {
                        spans[0].style.transform = 'none';
                        spans[1].style.opacity = '1';
                        spans[2].style.transform = 'none';
                    }
                }
            }
        });
    });
}

/**
 * تحديث التاريخ الهجري والميلادي
 */
function updateDates() {
    const hijriDateContainer = document.getElementById('hijri-date');
    const gregorianDateContainer = document.getElementById('gregorian-date');
    
    if (hijriDateContainer && gregorianDateContainer) {
        // الحصول على التاريخ الميلادي الحالي
        const today = new Date();
        const gregorianDate = formatGregorianDate(today);
        
        // عرض التاريخ الميلادي
        gregorianDateContainer.innerHTML = `
            <div class="date-display">${gregorianDate.formatted}</div>
            <div class="date-info">
                <span>${gregorianDate.day}</span>
                <span>${gregorianDate.month}</span>
                <span>${gregorianDate.year}</span>
            </div>
        `;
        
        // الحصول على التاريخ الهجري المقابل
        // استخدام مكتبة Hijri.js أو API للتحويل
        // هنا نستخدم محاكاة بسيطة للعرض
        const hijriDate = getHijriDate(today);
        
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

/**
 * تنسيق التاريخ الميلادي
 * @param {Date} date - كائن التاريخ
 * @returns {Object} - كائن يحتوي على التاريخ المنسق
 */
function formatGregorianDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formatted = date.toLocaleDateString('ar-SA', options);
    
    const day = date.toLocaleDateString('ar-SA', { weekday: 'long' });
    const month = date.toLocaleDateString('ar-SA', { month: 'long' });
    const year = date.toLocaleDateString('ar-SA', { year: 'numeric' });
    
    return {
        formatted,
        day,
        month,
        year
    };
}

/**
 * الحصول على التاريخ الهجري (محاكاة بسيطة)
 * في الإصدار النهائي، يجب استخدام مكتبة أو API للتحويل الدقيق
 * @param {Date} gregorianDate - التاريخ الميلادي
 * @returns {Object} - كائن يحتوي على التاريخ الهجري
 */
function getHijriDate(gregorianDate) {
    // هذه محاكاة بسيطة للعرض فقط
    // في الإصدار النهائي، يجب استخدام مكتبة مثل Hijri.js
    
    // أسماء الأشهر الهجرية
    const hijriMonths = [
        'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
        'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
        'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ];
    
    // أسماء أيام الأسبوع
    const weekDays = [
        'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء',
        'الخميس', 'الجمعة', 'السبت'
    ];
    
    // محاكاة بسيطة للتحويل (غير دقيقة)
    // تقريب بسيط: السنة الهجرية أقصر من الميلادية بحوالي 11 يوم
    const year = gregorianDate.getFullYear() - 579;
    const monthIndex = (gregorianDate.getMonth() + 1) % 12;
    const day = (gregorianDate.getDate() + 10) % 30 || 30;
    const weekDay = weekDays[gregorianDate.getDay()];
    
    return {
        formatted: `${day} ${hijriMonths[monthIndex]} ${year}`,
        day: weekDay,
        month: hijriMonths[monthIndex],
        year: year.toString()
    };
}

/**
 * إضافة مستمعي الأحداث
 */
function addEventListeners() {
    // زر استخدام الموقع الحالي
    const useLocationBtn = document.getElementById('use-location');
    if (useLocationBtn) {
        useLocationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                useLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تحديد الموقع...';
                useLocationBtn.disabled = true;
                
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        // نجاح في الحصول على الموقع
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        
                        // استخدام الإحداثيات لتحديث أوقات الصلاة
                        updatePrayerTimesByCoordinates(latitude, longitude);
                        
                        // إعادة زر الموقع إلى حالته الأصلية
                        useLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> استخدام موقعي الحالي';
                        useLocationBtn.disabled = false;
                    },
                    function(error) {
                        // فشل في الحصول على الموقع
                        console.error('Error getting location:', error);
                        alert('تعذر تحديد موقعك. يرجى التحقق من إعدادات الموقع في متصفحك والمحاولة مرة أخرى.');
                        
                        // إعادة زر الموقع إلى حالته الأصلية
                        useLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> استخدام موقعي الحالي';
                        useLocationBtn.disabled = false;
                    }
                );
            } else {
                alert('متصفحك لا يدعم تحديد الموقع الجغرافي.');
            }
        });
    }
    
    // تغيير المدينة
    const citySelect = document.getElementById('city-select');
    if (citySelect) {
        citySelect.addEventListener('change', function() {
            const selectedCity = this.value;
            updatePrayerTimesByCity(selectedCity);
        });
    }
    
    // أزرار المشاركة
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const parentCard = this.closest('.card');
            const contentElement = parentCard.querySelector('.dhikr-content, .hadith-content');
            
            if (contentElement && navigator.share) {
                navigator.share({
                    title: 'محتوى من AdanMaghrib',
                    text: contentElement.textContent.trim(),
                    url: window.location.href
                })
                .catch(error => console.error('Error sharing:', error));
            } else {
                // نسخ النص إلى الحافظة كبديل
                const text = contentElement ? contentElement.textContent.trim() : '';
                copyToClipboard(text);
                alert('تم نسخ المحتوى إلى الحافظة');
            }
        });
    });
    
    // أزرار الطباعة
    const printButtons = document.querySelectorAll('.print-btn');
    printButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const parentCard = this.closest('.card');
            const contentElement = parentCard.querySelector('.dhikr-content, .hadith-content');
            const title = parentCard.querySelector('h2').textContent;
            
            if (contentElement) {
                const content = contentElement.textContent.trim();
                printContent(title, content);
            }
        });
    });
}

/**
 * نسخ نص إلى الحافظة
 * @param {string} text - النص المراد نسخه
 */
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

/**
 * طباعة محتوى
 * @param {string} title - عنوان المحتوى
 * @param {string} content - المحتوى المراد طباعته
 */
function printContent(title, content) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>${title} - AdanMaghrib</title>
            <style>
                body {
                    font-family: 'Amiri', 'Arial', sans-serif;
                    line-height: 1.6;
                    padding: 20px;
                    text-align: center;
                }
                h1 {
                    color: #1D8348;
                    margin-bottom: 20px;
                }
                .content {
                    font-size: 18px;
                    margin: 20px 0;
                    text-align: right;
                }
                .footer {
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <div class="content">${content}</div>
            <div class="footer">المصدر: موقع AdanMaghrib - ${new Date().toLocaleDateString('ar-SA')}</div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
}

/**
 * تحميل المحتوى اليومي (الذكر والحديث)
 */
function loadDailyContent() {
    // تحميل ذكر اليوم
    loadDailyDhikr();
    
    // تحميل حديث اليوم
    loadDailyHadith();
}

/**
 * تحميل ذكر اليوم
 */
function loadDailyDhikr() {
    const dhikrContainer = document.getElementById('daily-dhikr');
    if (!dhikrContainer) return;
    
    // في الإصدار النهائي، يمكن استخدام API لجلب الأذكار
    // هنا نستخدم مجموعة ثابتة من الأذكار للعرض
    
    const adhkar = [
        "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
        "لا إلَهَ إلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ",
        "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
        "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ"
    ];
    
    // اختيار ذكر عشوائي
    const randomIndex = Math.floor(Math.random() * adhkar.length);
    const dhikr = adhkar[randomIndex];
    
    // عرض الذكر
    dhikrContainer.innerHTML = dhikr;
}

/**
 * تحميل حديث اليوم
 */
function loadDailyHadith() {
    const hadithContainer = document.getElementById('daily-hadith');
    if (!hadithContainer) return;
    
    // في الإصدار النهائي، يمكن استخدام API لجلب الأحاديث
    // هنا نستخدم مجموعة ثابتة من الأحاديث للعرض
    
    const hadiths = [
        "عن أبي هريرة رضي الله عنه، عن النبي صلى الله عليه وسلم قال: «من سلك طريقًا يلتمس فيه علمًا، سهل الله له به طريقًا إلى الجنة»",
        "عن أنس بن مالك رضي الله عنه قال: قال رسول الله صلى الله عليه وسلم: «لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه»",
        "عن أبي هريرة رضي الله عنه، أن رسول الله صلى الله عليه وسلم قال: «الكلمة الطيبة صدقة»",
        "عن عبد الله بن عمر رضي الله عنهما، أن رسول الله صلى الله عليه وسلم قال: «المسلم من سلم المسلمون من لسانه ويده، والمهاجر من هجر ما نهى الله عنه»",
        "عن أبي ذر رضي الله عنه قال: قال لي النبي صلى الله عليه وسلم: «اتق الله حيثما كنت، وأتبع السيئة الحسنة تمحها، وخالق الناس بخلق حسن»"
    ];
    
    // اختيار حديث عشوائي
    const randomIndex = Math.floor(Math.random() * hadiths.length);
    const hadith = hadiths[randomIndex];
    
    // عرض الحديث
    hadithContainer.innerHTML = hadith;
}

/**
 * تحديث أوقات الصلاة حسب المدينة
 * @param {string} city - اسم المدينة
 */
function updatePrayerTimesByCity(city) {
    // في الإصدار النهائي، يتم استدعاء دالة من ملف prayer-times.js
    if (typeof updatePrayerTimes === 'function') {
        updatePrayerTimes(city);
    } else {
        console.error('Function updatePrayerTimes not found');
    }
}

/**
 * تحديث أوقات الصلاة حسب الإحداثيات
 * @param {number} latitude - خط العرض
 * @param {number} longitude - خط الطول
 */
function updatePrayerTimesByCoordinates(latitude, longitude) {
    // في الإصدار النهائي، يتم استدعاء دالة من ملف prayer-times.js
    if (typeof updatePrayerTimesByCoords === 'function') {
        updatePrayerTimesByCoords(latitude, longitude);
    } else {
        console.error('Function updatePrayerTimesByCoords not found');
    }
}
