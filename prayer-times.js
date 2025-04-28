/**
 * ملف JavaScript لحساب أوقات الصلاة
 * يستخدم API من Aladhan.com لجلب أوقات الصلاة بدقة
 */

// المتغيرات العامة
let currentCity = 'Casablanca'; // المدينة الافتراضية
let coordinates = { // إحداثيات المدينة الافتراضية (الدار البيضاء)
    latitude: 33.5731,
    longitude: -7.5898
};

// إحداثيات المدن المغربية الرئيسية
const moroccanCities = {
    'Casablanca': { latitude: 33.5731, longitude: -7.5898, name: 'الدار البيضاء' },
    'Rabat': { latitude: 34.0209, longitude: -6.8416, name: 'الرباط' },
    'Marrakech': { latitude: 31.6295, longitude: -7.9811, name: 'مراكش' },
    'Fes': { latitude: 34.0181, longitude: -5.0078, name: 'فاس' },
    'Tangier': { latitude: 35.7595, longitude: -5.8340, name: 'طنجة' },
    'Agadir': { latitude: 30.4278, longitude: -9.5981, name: 'أكادير' },
    'Oujda': { latitude: 34.6805, longitude: -1.9005, name: 'وجدة' },
    'Tetouan': { latitude: 35.5889, longitude: -5.3626, name: 'تطوان' }
};

// عند تحميل المستند
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة قائمة المدن
    initCitySelector();
    
    // تحديث أوقات الصلاة للمدينة الافتراضية
    updatePrayerTimes(currentCity);
    
    // إضافة مستمع الحدث لزر استخدام الموقع الحالي
    const useLocationButton = document.getElementById('use-location');
    if (useLocationButton) {
        useLocationButton.addEventListener('click', function() {
            getUserLocation();
        });
    }
});

/**
 * تهيئة قائمة اختيار المدن
 */
function initCitySelector() {
    const citySelect = document.getElementById('city-select');
    if (!citySelect) return;
    
    // تفريغ القائمة
    citySelect.innerHTML = '';
    
    // إضافة المدن المغربية
    for (const city in moroccanCities) {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = moroccanCities[city].name;
        citySelect.appendChild(option);
    }
    
    // تعيين المدينة الافتراضية
    citySelect.value = currentCity;
    
    // إضافة مستمع الحدث لتغيير المدينة
    citySelect.addEventListener('change', function() {
        updatePrayerTimes(this.value);
    });
}

/**
 * تحديث أوقات الصلاة حسب المدينة
 * @param {string} city - اسم المدينة
 */
function updatePrayerTimes(city) {
    // التحقق من وجود المدينة في القائمة
    if (!moroccanCities[city]) {
        console.error(`City ${city} not found in the list`);
        return;
    }
    
    // تحديث المدينة الحالية
    currentCity = city;
    
    // تحديث الإحداثيات
    coordinates = moroccanCities[city];
    
    // عرض اسم المدينة في واجهة المستخدم
    const cityNameElement = document.getElementById('city-name');
    if (cityNameElement) {
        cityNameElement.textContent = moroccanCities[city].name;
    }
    
    // عرض رسالة التحميل
    showLoadingMessage();
    
    // جلب أوقات الصلاة من API
    fetchPrayerTimes(coordinates.latitude, coordinates.longitude);
}

/**
 * تحديث أوقات الصلاة حسب الإحداثيات
 * @param {number} latitude - خط العرض
 * @param {number} longitude - خط الطول
 */
function updatePrayerTimesByCoords(latitude, longitude) {
    // تحديث الإحداثيات
    coordinates = {
        latitude: latitude,
        longitude: longitude,
        name: 'موقعك الحالي'
    };
    
    // تحديث المدينة الحالية
    currentCity = 'current-location';
    
    // عرض اسم المدينة في واجهة المستخدم
    const cityNameElement = document.getElementById('city-name');
    if (cityNameElement) {
        cityNameElement.textContent = 'موقعك الحالي';
    }
    
    // عرض رسالة التحميل
    showLoadingMessage();
    
    // جلب أوقات الصلاة من API
    fetchPrayerTimes(latitude, longitude);
}

/**
 * جلب أوقات الصلاة من API
 * @param {number} latitude - خط العرض
 * @param {number} longitude - خط الطول
 */
function fetchPrayerTimes(latitude, longitude) {
    // الحصول على التاريخ الحالي
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    
    // بناء رابط API
    const apiUrl = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=4`;
    
    // جلب البيانات
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // معالجة البيانات
            displayPrayerTimes(data);
        })
        .catch(error => {
            console.error('Error fetching prayer times:', error);
            showErrorMessage('تعذر جلب أوقات الصلاة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
        });
}

/**
 * عرض أوقات الصلاة في واجهة المستخدم
 * @param {Object} data - بيانات أوقات الصلاة
 */
function displayPrayerTimes(data) {
    // التحقق من وجود البيانات
    if (!data || !data.data || !data.data.timings) {
        showErrorMessage('تعذر جلب أوقات الصلاة. يرجى المحاولة مرة أخرى.');
        return;
    }
    
    // الحصول على أوقات الصلاة
    const timings = data.data.timings;
    
    // أسماء الصلوات بالعربية
    const prayerNames = {
        Fajr: 'الفجر',
        Dhuhr: 'الظهر',
        Asr: 'العصر',
        Maghrib: 'المغرب',
        Isha: 'العشاء'
    };
    
    // الحصول على حاوية أوقات الصلاة
    const prayerTimesContainer = document.getElementById('prayer-times-container');
    if (!prayerTimesContainer) return;
    
    // تفريغ الحاوية
    prayerTimesContainer.innerHTML = '';
    
    // تحديد الصلاة القادمة
    const nextPrayer = getNextPrayer(timings);
    
    // إنشاء بطاقات أوقات الصلاة
    for (const prayer in prayerNames) {
        const prayerCard = document.createElement('div');
        prayerCard.className = 'prayer-card';
        
        // إضافة فئة للصلاة القادمة
        if (prayer === nextPrayer) {
            prayerCard.classList.add('next-prayer');
        }
        
        // تنسيق الوقت (إزالة الثواني)
        const time = timings[prayer].split(':').slice(0, 2).join(':');
        
        prayerCard.innerHTML = `
            <h3>${prayerNames[prayer]}</h3>
            <p>${time}</p>
        `;
        
        prayerTimesContainer.appendChild(prayerCard);
    }
}

/**
 * الحصول على الصلاة القادمة
 * @param {Object} timings - أوقات الصلاة
 * @returns {string} - اسم الصلاة القادمة
 */
function getNextPrayer(timings) {
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // تحويل أوقات الصلاة إلى دقائق
    const prayerMinutes = {};
    for (const prayer of prayers) {
        const time = timings[prayer].split(':');
        prayerMinutes[prayer] = parseInt(time[0]) * 60 + parseInt(time[1]);
    }
    
    // البحث عن الصلاة القادمة
    for (const prayer of prayers) {
        if (prayerMinutes[prayer] > currentTime) {
            return prayer;
        }
    }
    
    // إذا كانت جميع الصلوات قد مرت، فالصلاة القادمة هي فجر اليوم التالي
    return 'Fajr';
}

/**
 * الحصول على موقع المستخدم
 */
function getUserLocation() {
    // التحقق من دعم خدمة تحديد الموقع
    if (!navigator.geolocation) {
        showErrorMessage('متصفحك لا يدعم خدمة تحديد الموقع.');
        return;
    }
    
    // عرض رسالة التحميل
    showLoadingMessage('جاري تحديد موقعك...');
    
    // الحصول على الموقع
    navigator.geolocation.getCurrentPosition(
        // نجاح
        function(position) {
            updatePrayerTimesByCoords(position.coords.latitude, position.coords.longitude);
        },
        // فشل
        function(error) {
            console.error('Error getting location:', error);
            let errorMessage = 'تعذر تحديد موقعك.';
            
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'تم رفض الوصول إلى موقعك. يرجى السماح للموقع بالوصول إلى موقعك في إعدادات المتصفح.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'معلومات الموقع غير متاحة.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'انتهت مهلة طلب تحديد موقعك.';
                    break;
            }
            
            showErrorMessage(errorMessage);
        },
        // خيارات
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

/**
 * عرض رسالة التحميل
 * @param {string} message - نص الرسالة
 */
function showLoadingMessage(message = 'جاري تحميل أوقات الصلاة...') {
    // الحصول على حاوية أوقات الصلاة
    const prayerTimesContainer = document.getElementById('prayer-times-container');
    if (!prayerTimesContainer) return;
    
    // تفريغ الحاوية
    prayerTimesContainer.innerHTML = '';
    
    // إنشاء عنصر التحميل
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading';
    loadingElement.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <p>${message}</p>
    `;
    
    prayerTimesContainer.appendChild(loadingElement);
}

/**
 * عرض رسالة خطأ
 * @param {string} message - نص الرسالة
 */
function showErrorMessage(message) {
    // الحصول على حاوية أوقات الصلاة
    const prayerTimesContainer = document.getElementById('prayer-times-container');
    if (!prayerTimesContainer) return;
    
    // تفريغ الحاوية
    prayerTimesContainer.innerHTML = '';
    
    // إنشاء عنصر الخطأ
    const errorElement = document.createElement('div');
    errorElement.className = 'error';
    errorElement.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
        <button id="retry-button" class="retry-btn">إعادة المحاولة</button>
    `;
    
    prayerTimesContainer.appendChild(errorElement);
    
    // إضافة مستمع الحدث لزر إعادة المحاولة
    const retryButton = document.getElementById('retry-button');
    if (retryButton) {
        retryButton.addEventListener('click', function() {
            updatePrayerTimes(currentCity);
        });
    }
}

// تصدير الدوال للاستخدام في ملفات أخرى
window.updatePrayerTimes = updatePrayerTimes;
window.updatePrayerTimesByCoords = updatePrayerTimesByCoords;
window.getUserLocation = getUserLocation;
