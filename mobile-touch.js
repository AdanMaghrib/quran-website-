/**
 * ملف JavaScript للتعامل مع الإيماءات اللمسية على الأجهزة المحمولة
 * يحسن تجربة المستخدم على الهواتف والأجهزة اللوحية
 */

document.addEventListener('DOMContentLoaded', function() {
    // تفعيل القائمة المنسدلة على الأجهزة المحمولة
    setupMobileMenu();
    
    // إضافة دعم الإيماءات اللمسية للعناصر التفاعلية
    setupTouchGestures();
    
    // تحسين تجربة التمرير على الأجهزة اللمسية
    setupSmoothScrolling();
    
    // تحسين تجربة النقر على الآيات
    setupVerseInteraction();
    
    // تحسين تجربة البوصلة على الأجهزة المحمولة
    setupQiblaCompassForMobile();
});

/**
 * تفعيل القائمة المنسدلة على الأجهزة المحمولة
 */
function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!menuToggle || !navLinks) return;
    
    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        
        // تغيير شكل زر القائمة
        const spans = menuToggle.querySelectorAll('span');
        if (navLinks.classList.contains('active')) {
            // تحويل الزر إلى علامة X
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            // إعادة الزر إلى شكله الأصلي
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', function(event) {
        if (!event.target.closest('nav') && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            
            // إعادة الزر إلى شكله الأصلي
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // إغلاق القائمة عند النقر على أحد الروابط
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            
            // إعادة الزر إلى شكله الأصلي
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
}

/**
 * إضافة دعم الإيماءات اللمسية للعناصر التفاعلية
 */
function setupTouchGestures() {
    // تحسين تجربة النقر على البطاقات
    const cards = document.querySelectorAll('.card, .prayer-card, .surah-card, .quick-link-card');
    cards.forEach(card => {
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        card.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
    
    // تحسين تجربة النقر على الأزرار
    const buttons = document.querySelectorAll('button:not(.menu-toggle)');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
    
    // إضافة دعم السحب للتمرير في قوائم السور
    const surahsList = document.querySelector('.surahs-list');
    if (surahsList) {
        let startX, startY, startTime;
        let isScrolling = false;
        
        surahsList.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = new Date().getTime();
            isScrolling = false;
        });
        
        surahsList.addEventListener('touchmove', function(e) {
            if (!startX || !startY) return;
            
            const diffX = startX - e.touches[0].clientX;
            const diffY = startY - e.touches[0].clientY;
            
            // تحديد ما إذا كان التمرير أفقيًا أم رأسيًا
            if (!isScrolling) {
                isScrolling = Math.abs(diffY) > Math.abs(diffX);
            }
            
            if (!isScrolling) {
                e.preventDefault(); // منع التمرير الافتراضي إذا كان السحب أفقيًا
                surahsList.scrollLeft += diffX;
                startX = e.touches[0].clientX;
            }
        });
        
        surahsList.addEventListener('touchend', function() {
            startX = null;
            startY = null;
        });
    }
}

/**
 * تحسين تجربة التمرير على الأجهزة اللمسية
 */
function setupSmoothScrolling() {
    // تحسين تجربة التمرير في قائمة الآيات
    const versesContainer = document.querySelector('.verses-container');
    if (versesContainer) {
        versesContainer.style.webkitOverflowScrolling = 'touch';
        
        // إضافة تمرير سلس عند النقر على أرقام الآيات
        const verseNumbers = document.querySelectorAll('.verse-number');
        verseNumbers.forEach(number => {
            number.addEventListener('click', function() {
                const verseId = this.dataset.verseId;
                const verseElement = document.querySelector(`.verse[data-verse-id="${verseId}"]`);
                
                if (verseElement) {
                    verseElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            });
        });
    }
    
    // تحسين تجربة التمرير في الصفحة الرئيسية
    const quickLinks = document.querySelectorAll('.quick-link-card');
    quickLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // إذا كان الرابط يشير إلى عنصر في نفس الصفحة
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

/**
 * تحسين تجربة النقر على الآيات
 */
function setupVerseInteraction() {
    // إضافة تفاعل للنقر على الآيات
    const verses = document.querySelectorAll('.verse');
    verses.forEach(verse => {
        verse.addEventListener('click', function() {
            // إزالة التمييز من جميع الآيات
            verses.forEach(v => v.classList.remove('highlighted-verse'));
            
            // تمييز الآية المحددة
            this.classList.add('highlighted-verse');
            
            // إظهار خيارات الآية إذا كانت موجودة
            const verseOptions = this.querySelector('.verse-options');
            if (verseOptions) {
                verseOptions.style.display = 'flex';
            }
        });
    });
    
    // إخفاء خيارات الآية عند النقر خارجها
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.verse')) {
            const verseOptions = document.querySelectorAll('.verse-options');
            verseOptions.forEach(options => {
                options.style.display = 'none';
            });
        }
    });
}

/**
 * تحسين تجربة البوصلة على الأجهزة المحمولة
 */
function setupQiblaCompassForMobile() {
    const compassContainer = document.querySelector('.qibla-compass-container');
    if (!compassContainer) return;
    
    // تحسين تجربة البوصلة على الأجهزة المحمولة
    compassContainer.addEventListener('touchstart', function(e) {
        e.preventDefault(); // منع السلوك الافتراضي مثل التكبير
    });
    
    // إضافة دعم للتدوير باللمس
    let startAngle = 0;
    let currentAngle = 0;
    let rotating = false;
    
    compassContainer.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            rotating = true;
            
            const touch = e.touches[0];
            const center = {
                x: compassContainer.offsetWidth / 2 + compassContainer.offsetLeft,
                y: compassContainer.offsetHeight / 2 + compassContainer.offsetTop
            };
            
            startAngle = Math.atan2(touch.clientY - center.y, touch.clientX - center.x) * 180 / Math.PI;
            
            // الحصول على الزاوية الحالية من نمط التحويل
            const transform = compassContainer.style.transform;
            if (transform && transform.includes('rotate')) {
                const match = transform.match(/rotate\(([^)]+)deg\)/);
                if (match && match[1]) {
                    currentAngle = parseFloat(match[1]);
                }
            }
        }
    });
    
    compassContainer.addEventListener('touchmove', function(e) {
        if (rotating && e.touches.length === 1) {
            const touch = e.touches[0];
            const center = {
                x: compassContainer.offsetWidth / 2 + compassContainer.offsetLeft,
                y: compassContainer.offsetHeight / 2 + compassContainer.offsetTop
            };
            
            const angle = Math.atan2(touch.clientY - center.y, touch.clientX - center.x) * 180 / Math.PI;
            const newAngle = currentAngle + (angle - startAngle);
            
            compassContainer.style.transform = `rotate(${newAngle}deg)`;
        }
    });
    
    compassContainer.addEventListener('touchend', function() {
        rotating = false;
    });
    
    // تحسين أداء البوصلة على الأجهزة المحمولة
    if (window.DeviceOrientationEvent) {
        // استخدام حدث توجيه الجهاز لتدوير البوصلة
        window.addEventListener('deviceorientation', function(e) {
            if (e.alpha !== null && !rotating) {
                const compassNeedle = document.querySelector('.compass-needle');
                if (compassNeedle) {
                    compassNeedle.style.transform = `rotate(${360 - e.alpha}deg)`;
                }
            }
        });
    }
}
