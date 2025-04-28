/**
 * ملف JavaScript لأدوات إمكانية الوصول والوضع الليلي
 * يوفر وظائف لتحسين تجربة المستخدم وإمكانية الوصول
 */

document.addEventListener('DOMContentLoaded', function() {
    // إضافة أزرار إمكانية الوصول والوضع الليلي إلى الصفحة
    addAccessibilityControls();
    
    // تهيئة الإعدادات من التخزين المحلي
    initSettings();
    
    // إضافة مستمعي الأحداث للأزرار
    setupEventListeners();
});

/**
 * إضافة أزرار إمكانية الوصول والوضع الليلي إلى الصفحة
 */
function addAccessibilityControls() {
    // إضافة زر تبديل الوضع الليلي
    const themeToggle = document.createElement('div');
    themeToggle.className = 'theme-toggle';
    themeToggle.id = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'تبديل الوضع الليلي');
    themeToggle.setAttribute('role', 'button');
    themeToggle.setAttribute('tabindex', '0');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    document.body.appendChild(themeToggle);
    
    // إضافة أدوات إمكانية الوصول
    const accessibilityTools = document.createElement('div');
    accessibilityTools.className = 'accessibility-tools';
    accessibilityTools.innerHTML = `
        <div class="accessibility-btn" id="accessibility-toggle" aria-label="أدوات إمكانية الوصول" role="button" tabindex="0">
            <i class="fas fa-universal-access"></i>
        </div>
        <div class="accessibility-panel" id="accessibility-panel">
            <h3>إعدادات إمكانية الوصول</h3>
            
            <div class="font-size-controls">
                <label>حجم الخط:</label>
                <div class="font-size-buttons">
                    <button class="font-size-btn" id="font-size-small" aria-label="خط صغير">ص</button>
                    <button class="font-size-btn" id="font-size-medium" aria-label="خط متوسط">م</button>
                    <button class="font-size-btn" id="font-size-large" aria-label="خط كبير">ك</button>
                    <button class="font-size-btn" id="font-size-xlarge" aria-label="خط كبير جداً">ك+</button>
                </div>
            </div>
            
            <div class="text-color-controls">
                <label>نمط الألوان:</label>
                <div class="color-options">
                    <div class="color-option default" id="color-default" aria-label="الألوان الافتراضية"></div>
                    <div class="color-option high-contrast" id="color-high-contrast" aria-label="تباين عالي"></div>
                    <div class="color-option warm" id="color-warm" aria-label="ألوان دافئة"></div>
                    <div class="color-option cool" id="color-cool" aria-label="ألوان باردة"></div>
                </div>
            </div>
            
            <div class="dyslexia-controls">
                <label>
                    <input type="checkbox" id="dyslexia-mode"> وضع عسر القراءة
                </label>
            </div>
        </div>
    `;
    document.body.appendChild(accessibilityTools);
}

/**
 * تهيئة الإعدادات من التخزين المحلي
 */
function initSettings() {
    // تحقق من إعدادات الوضع الليلي
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // تحقق من إعدادات حجم الخط
    const fontSize = localStorage.getItem('fontSize');
    if (fontSize) {
        document.body.classList.add(`font-size-${fontSize}`);
    }
    
    // تحقق من إعدادات لون النص
    const textColor = localStorage.getItem('textColor');
    if (textColor) {
        document.body.classList.add(`text-color-${textColor}`);
    }
    
    // تحقق من إعدادات وضع عسر القراءة
    if (localStorage.getItem('dyslexiaMode') === 'true') {
        document.body.classList.add('dyslexia-friendly');
        document.getElementById('dyslexia-mode').checked = true;
    }
}

/**
 * إضافة مستمعي الأحداث للأزرار
 */
function setupEventListeners() {
    // زر تبديل الوضع الليلي
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleDarkMode);
    themeToggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDarkMode();
        }
    });
    
    // زر فتح لوحة إمكانية الوصول
    const accessibilityToggle = document.getElementById('accessibility-toggle');
    accessibilityToggle.addEventListener('click', toggleAccessibilityPanel);
    accessibilityToggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleAccessibilityPanel();
        }
    });
    
    // أزرار حجم الخط
    document.getElementById('font-size-small').addEventListener('click', () => setFontSize('small'));
    document.getElementById('font-size-medium').addEventListener('click', () => setFontSize('medium'));
    document.getElementById('font-size-large').addEventListener('click', () => setFontSize('large'));
    document.getElementById('font-size-xlarge').addEventListener('click', () => setFontSize('xlarge'));
    
    // أزرار لون النص
    document.getElementById('color-default').addEventListener('click', () => setTextColor('default'));
    document.getElementById('color-high-contrast').addEventListener('click', () => setTextColor('high-contrast'));
    document.getElementById('color-warm').addEventListener('click', () => setTextColor('warm'));
    document.getElementById('color-cool').addEventListener('click', () => setTextColor('cool'));
    
    // خانة اختيار وضع عسر القراءة
    document.getElementById('dyslexia-mode').addEventListener('change', toggleDyslexiaMode);
    
    // إغلاق لوحة إمكانية الوصول عند النقر خارجها
    document.addEventListener('click', function(e) {
        const panel = document.getElementById('accessibility-panel');
        const toggle = document.getElementById('accessibility-toggle');
        
        if (panel.classList.contains('active') && 
            !panel.contains(e.target) && 
            e.target !== toggle && 
            !toggle.contains(e.target)) {
            panel.classList.remove('active');
        }
    });
}

/**
 * تبديل الوضع الليلي
 */
function toggleDarkMode() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('darkMode', 'false');
        
        // إعلان تغيير الوضع للقراء الشاشة
        announceToScreenReader('تم تفعيل الوضع النهاري');
    } else {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('darkMode', 'true');
        
        // إعلان تغيير الوضع للقراء الشاشة
        announceToScreenReader('تم تفعيل الوضع الليلي');
    }
}

/**
 * فتح/إغلاق لوحة إمكانية الوصول
 */
function toggleAccessibilityPanel() {
    const panel = document.getElementById('accessibility-panel');
    panel.classList.toggle('active');
    
    if (panel.classList.contains('active')) {
        announceToScreenReader('تم فتح لوحة إعدادات إمكانية الوصول');
    } else {
        announceToScreenReader('تم إغلاق لوحة إعدادات إمكانية الوصول');
    }
}

/**
 * تعيين حجم الخط
 * @param {string} size - حجم الخط (small, medium, large, xlarge)
 */
function setFontSize(size) {
    // إزالة جميع فئات حجم الخط
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large', 'font-size-xlarge');
    
    // إضافة فئة حجم الخط الجديدة
    document.body.classList.add(`font-size-${size}`);
    
    // حفظ الإعداد في التخزين المحلي
    localStorage.setItem('fontSize', size);
    
    // إعلان تغيير حجم الخط للقراء الشاشة
    const sizeNames = {
        'small': 'صغير',
        'medium': 'متوسط',
        'large': 'كبير',
        'xlarge': 'كبير جداً'
    };
    announceToScreenReader(`تم تغيير حجم الخط إلى ${sizeNames[size]}`);
}

/**
 * تعيين لون النص
 * @param {string} color - لون النص (default, high-contrast, warm, cool)
 */
function setTextColor(color) {
    // إزالة جميع فئات لون النص
    document.body.classList.remove('text-color-default', 'text-color-high-contrast', 'text-color-warm', 'text-color-cool');
    
    // إضافة فئة لون النص الجديدة إذا لم تكن الافتراضية
    if (color !== 'default') {
        document.body.classList.add(`text-color-${color}`);
    }
    
    // حفظ الإعداد في التخزين المحلي
    localStorage.setItem('textColor', color);
    
    // إعلان تغيير لون النص للقراء الشاشة
    const colorNames = {
        'default': 'الافتراضية',
        'high-contrast': 'تباين عالي',
        'warm': 'دافئة',
        'cool': 'باردة'
    };
    announceToScreenReader(`تم تغيير ألوان النص إلى ${colorNames[color]}`);
}

/**
 * تبديل وضع عسر القراءة
 */
function toggleDyslexiaMode() {
    const checkbox = document.getElementById('dyslexia-mode');
    
    if (checkbox.checked) {
        document.body.classList.add('dyslexia-friendly');
        localStorage.setItem('dyslexiaMode', 'true');
        announceToScreenReader('تم تفعيل وضع عسر القراءة');
    } else {
        document.body.classList.remove('dyslexia-friendly');
        localStorage.setItem('dyslexiaMode', 'false');
        announceToScreenReader('تم إلغاء تفعيل وضع عسر القراءة');
    }
}

/**
 * إعلان رسالة لقراء الشاشة
 * @param {string} message - الرسالة المراد إعلانها
 */
function announceToScreenReader(message) {
    let announcer = document.getElementById('screen-reader-announcer');
    
    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'screen-reader-announcer';
        announcer.className = 'screen-reader-text';
        announcer.setAttribute('aria-live', 'polite');
        document.body.appendChild(announcer);
    }
    
    // تحديث المحتوى بعد فترة قصيرة لضمان قراءته
    setTimeout(() => {
        announcer.textContent = message;
    }, 100);
}
