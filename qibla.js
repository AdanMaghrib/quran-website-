/**
 * ملف JavaScript لصفحة تحديد اتجاه القبلة
 * يستخدم حسابات دقيقة لتحديد اتجاه القبلة من أي موقع
 */

document.addEventListener('DOMContentLoaded', function() {
    // تحديث السنة في التذييل
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // إحداثيات مكة المكرمة
    const MECCA_LAT = 21.4225;
    const MECCA_LNG = 39.8262;
    
    // خريطة المدن المغربية مع إحداثياتها
    const cityCoordinates = {
        'Rabat': { latitude: 34.0209, longitude: -6.8416 },
        'Casablanca': { latitude: 33.5731, longitude: -7.5898 },
        'Marrakech': { latitude: 31.6295, longitude: -7.9811 },
        'Tangier': { latitude: 35.7595, longitude: -5.8340 },
        'Fes': { latitude: 34.0181, longitude: -5.0078 },
        'Agadir': { latitude: 30.4278, longitude: -9.5981 },
        'Oujda': { latitude: 34.6836, longitude: -1.9063 },
        'Tetouan': { latitude: 35.5889, longitude: -5.3626 },
        'Meknes': { latitude: 33.8935, longitude: -5.5547 },
        'Essaouira': { latitude: 31.5085, longitude: -9.7595 }
    };
    
    // عناصر واجهة المستخدم
    const qiblaArrow = document.getElementById('qibla-arrow');
    const distanceToMecca = document.getElementById('distance-to-mecca');
    const qiblaAngle = document.getElementById('qibla-angle');
    const qiblaDirection = document.getElementById('qibla-direction');
    const citySelect = document.getElementById('qibla-city-select');
    const useLocationBtn = document.getElementById('use-location-qibla');
    const calibrateBtn = document.getElementById('calibrate-compass');
    const refreshBtn = document.getElementById('refresh-qibla');
    
    // متغيرات عالمية
    let userLat = null;
    let userLng = null;
    let qiblaAngleValue = 0;
    let deviceOrientation = 0;
    let hasOrientationPermission = false;
    let watchId = null;
    
    // إضافة المزيد من المدن إلى القائمة
    populateCitySelect();
    
    // استمع لتغييرات في اختيار المدينة
    citySelect.addEventListener('change', function() {
        const city = this.value;
        const coordinates = cityCoordinates[city];
        if (coordinates) {
            calculateQibla(coordinates.latitude, coordinates.longitude);
        }
    });
    
    // زر استخدام الموقع الحالي
    useLocationBtn.addEventListener('click', function() {
        if (navigator.geolocation) {
            useLocationBtn.textContent = 'جاري تحديد الموقع...';
            
            // إلغاء المراقبة السابقة إن وجدت
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
            
            // استخدام watchPosition بدلاً من getCurrentPosition للحصول على تحديثات مستمرة
            watchId = navigator.geolocation.watchPosition(
                function(position) {
                    userLat = position.coords.latitude;
                    userLng = position.coords.longitude;
                    calculateQibla(userLat, userLng);
                    useLocationBtn.textContent = 'استخدم موقعي';
                    
                    // طلب إذن استخدام مستشعر الاتجاه
                    requestOrientationPermission();
                },
                function(error) {
                    handleGeolocationError(error);
                    useLocationBtn.textContent = 'استخدم موقعي';
                },
                { 
                    enableHighAccuracy: true, 
                    maximumAge: 30000, 
                    timeout: 27000 
                }
            );
        } else {
            showError('متصفحك لا يدعم تحديد الموقع الجغرافي');
        }
    });
    
    // زر معايرة البوصلة
    calibrateBtn.addEventListener('click', function() {
        requestOrientationPermission();
    });
    
    // زر تحديث اتجاه القبلة
    refreshBtn.addEventListener('click', function() {
        if (userLat && userLng) {
            calculateQibla(userLat, userLng);
        } else {
            const city = citySelect.value;
            const coordinates = cityCoordinates[city];
            if (coordinates) {
                calculateQibla(coordinates.latitude, coordinates.longitude);
            }
        }
    });
    
    // طلب إذن استخدام مستشعر الاتجاه
    function requestOrientationPermission() {
        if (window.DeviceOrientationEvent) {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                // iOS 13+ يتطلب إذنًا صريحًا
                DeviceOrientationEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            enableOrientationSensor();
                        } else {
                            showError('تم رفض الإذن لاستخدام مستشعر الاتجاه. لن تتمكن من استخدام البوصلة الحية.');
                        }
                    })
                    .catch(error => {
                        console.error('Error requesting orientation permission:', error);
                        showError('حدث خطأ أثناء طلب الإذن. قد يكون هذا بسبب عدم دعم المتصفح أو عدم وجود مستشعر.');
                        
                        // محاولة استخدام البوصلة بدون إذن (للأجهزة غير iOS)
                        enableOrientationSensor();
                    });
            } else {
                // أجهزة أخرى قد لا تتطلب إذنًا صريحًا
                enableOrientationSensor();
            }
        } else {
            showError('متصفحك لا يدعم مستشعر الاتجاه. سيتم عرض اتجاه القبلة بشكل ثابت.');
        }
    }
    
    // تمكين مستشعر الاتجاه
    function enableOrientationSensor() {
        hasOrientationPermission = true;
        
        // إزالة مستمع الحدث السابق إن وجد
        window.removeEventListener('deviceorientation', handleOrientation);
        
        // إضافة مستمع الحدث الجديد
        window.addEventListener('deviceorientation', handleOrientation, true);
        
        showSuccess('تم تمكين مستشعر الاتجاه. يرجى تحريك جهازك في دائرة كاملة لمعايرة البوصلة.');
    }
    
    // معالجة بيانات مستشعر الاتجاه
    function handleOrientation(event) {
        let heading = null;
        
        if (event.webkitCompassHeading) {
            // Safari على iOS
            heading = event.webkitCompassHeading;
        } else if (event.alpha) {
            // معظم المتصفحات الأخرى
            heading = 360 - event.alpha;
        }
        
        if (heading !== null) {
            deviceOrientation = heading;
            updateQiblaArrow();
        }
    }
    
    // حساب اتجاه القبلة
    function calculateQibla(lat, lng) {
        try {
            // تحويل الإحداثيات إلى راديان
            const lat1 = toRadians(lat);
            const lng1 = toRadians(lng);
            const lat2 = toRadians(MECCA_LAT);
            const lng2 = toRadians(MECCA_LNG);
            
            // حساب زاوية القبلة باستخدام صيغة المسافة الكبرى
            const y = Math.sin(lng2 - lng1);
            const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(lng2 - lng1);
            let qiblaRadians = Math.atan2(y, x);
            
            // تحويل الزاوية إلى درجات
            qiblaAngleValue = toDegrees(qiblaRadians);
            
            // ضمان أن الزاوية بين 0 و 360 درجة
            if (qiblaAngleValue < 0) {
                qiblaAngleValue += 360;
            }
            
            // حساب المسافة إلى مكة
            const distance = calculateDistance(lat, lng, MECCA_LAT, MECCA_LNG);
            
            // تحديث واجهة المستخدم
            qiblaAngle.textContent = Math.round(qiblaAngleValue);
            distanceToMecca.textContent = Math.round(distance);
            qiblaDirection.textContent = getDirectionName(qiblaAngleValue);
            
            // تحديث اتجاه السهم
            updateQiblaArrow();
            
            return true;
        } catch (error) {
            console.error('Error calculating qibla:', error);
            showError('حدث خطأ أثناء حساب اتجاه القبلة. يرجى المحاولة مرة أخرى.');
            return false;
        }
    }
    
    // تحديث اتجاه سهم القبلة
    function updateQiblaArrow() {
        let arrowRotation = qiblaAngleValue;
        
        // إذا كان لدينا إذن لاستخدام مستشعر الاتجاه، نعدل الزاوية بناءً على اتجاه الجهاز
        if (hasOrientationPermission && deviceOrientation !== null) {
            arrowRotation = qiblaAngleValue - deviceOrientation;
            
            // ضمان أن الزاوية بين 0 و 360 درجة
            while (arrowRotation < 0) arrowRotation += 360;
            while (arrowRotation >= 360) arrowRotation -= 360;
        }
        
        // تطبيق الدوران على السهم مع تأثير انتقالي سلس
        qiblaArrow.style.transform = `translate(-50%, -100%) rotate(${arrowRotation}deg)`;
    }
    
    // حساب المسافة بين نقطتين على سطح الأرض (صيغة هافرساين)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // نصف قطر الأرض بالكيلومتر
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        return distance;
    }
    
    // تحويل الدرجات إلى راديان
    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // تحويل الراديان إلى درجات
    function toDegrees(radians) {
        return radians * (180 / Math.PI);
    }
    
    // الحصول على اسم الاتجاه بناءً على الزاوية
    function getDirectionName(angle) {
        const directions = [
            'شمال', 'شمال شرق', 'شرق', 'جنوب شرق',
            'جنوب', 'جنوب غرب', 'غرب', 'شمال غرب'
        ];
        const index = Math.round(angle / 45) % 8;
        return directions[index];
    }
    
    // ملء قائمة المدن
    function populateCitySelect() {
        // مسح القائمة الحالية
        citySelect.innerHTML = '';
        
        // إضافة المدن إلى القائمة
        for (const [value, city] of Object.entries(cityCoordinates)) {
            const option = document.createElement('option');
            option.value = value;
            
            // تحويل اسم المدينة من الإنجليزية إلى العربية
            switch(value) {
                case 'Rabat': option.textContent = 'الرباط'; break;
                case 'Casablanca': option.textContent = 'الدار البيضاء'; break;
                case 'Marrakech': option.textContent = 'مراكش'; break;
                case 'Tangier': option.textContent = 'طنجة'; break;
                case 'Fes': option.textContent = 'فاس'; break;
                case 'Agadir': option.textContent = 'أكادير'; break;
                case 'Oujda': option.textContent = 'وجدة'; break;
                case 'Tetouan': option.textContent = 'تطوان'; break;
                case 'Meknes': option.textContent = 'مكناس'; break;
                case 'Essaouira': option.textContent = 'الصويرة'; break;
                default: option.textContent = value;
            }
            
            citySelect.appendChild(option);
        }
    }
    
    // معالجة أخطاء تحديد الموقع
    function handleGeolocationError(error) {
        let errorMessage = '';
        
        switch(error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'تم رفض الوصول إلى الموقع الجغرافي. يرجى السماح للموقع بالوصول إلى موقعك في إعدادات المتصفح.';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'معلومات الموقع غير متاحة. يرجى التأكد من تفعيل خدمة الموقع على جهازك.';
                break;
            case error.TIMEOUT:
                errorMessage = 'انتهت مهلة طلب الموقع. يرجى المحاولة مرة أخرى.';
                break;
            case error.UNKNOWN_ERROR:
                errorMessage = 'حدث خطأ غير معروف أثناء تحديد الموقع.';
                break;
        }
        
        showError(errorMessage);
    }
    
    // عرض رسالة خطأ
    function showError(message) {
        alert(message);
    }
    
    // عرض رسالة نجاح
    function showSuccess(message) {
        // يمكن استبدال هذا بطريقة أفضل لعرض رسائل النجاح
        alert(message);
    }
    
    // تنظيف عند مغادرة الصفحة
    window.addEventListener('beforeunload', function() {
        // إلغاء مراقبة الموقع إن وجدت
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
        }
        
        // إزالة مستمع حدث الاتجاه
        window.removeEventListener('deviceorientation', handleOrientation);
    });
    
    // تهيئة البوصلة باستخدام المدينة الافتراضية (الرباط)
    calculateQibla(cityCoordinates['Rabat'].latitude, cityCoordinates['Rabat'].longitude);
});
