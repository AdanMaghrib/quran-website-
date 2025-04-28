/**
 * ملف JavaScript لتشغيل الصوت المحلي في قسم القرآن الكريم
 * حل متوافق مع جميع المتصفحات بما في ذلك Safari على iOS
 */

document.addEventListener('DOMContentLoaded', function() {
    // تعريف قائمة بالسور المتوفرة محلياً
    const localSurahs = {
        1: "fatiha.mp3",
        2: "baqarah.mp3",
        3: "imran.mp3"
    };
    
    // تحقق من وجود زر الاستماع
    const playButton = document.getElementById('play-surah');
    const stopButton = document.getElementById('stop-surah');
    
    if (!playButton) return;
    
    // إنشاء عنصر الصوت
    const audioElement = document.createElement('audio');
    audioElement.id = 'quran-audio-player';
    audioElement.style.display = 'none';
    audioElement.controls = true; // إضافة عناصر التحكم للتوافق مع iOS
    document.body.appendChild(audioElement);
    
    // إضافة مستمع حدث لزر الاستماع
    playButton.addEventListener('click', function() {
        // الحصول على رقم السورة من العنوان
        const surahTitleElement = document.querySelector('#surah-title');
        let surahNumber = 1; // الفاتحة كافتراضي
        
        if (surahTitleElement && surahTitleElement.dataset.surahNumber) {
            surahNumber = parseInt(surahTitleElement.dataset.surahNumber);
        }
        
        // التحقق مما إذا كانت السورة متوفرة محلياً
        let audioSrc = '';
        if (localSurahs[surahNumber]) {
            audioSrc = `audio/${localSurahs[surahNumber]}`;
        } else {
            // إذا لم تكن السورة متوفرة محلياً، استخدم الفاتحة كافتراضي
            audioSrc = 'audio/fatiha.mp3';
        }
        
        console.log('Playing local audio file:', audioSrc);
        
        // تحديث مصدر الصوت
        audioElement.src = audioSrc;
        
        // إضافة معالج أحداث للتحميل
        audioElement.oncanplaythrough = function() {
            console.log('Audio loaded and can play');
            startPlayback();
        };
        
        // إضافة معالج أحداث للخطأ
        audioElement.onerror = function(e) {
            console.error('Error loading audio:', e);
            alert('تعذر تحميل ملف الصوت. يرجى المحاولة مرة أخرى.');
        };
        
        // بدء تحميل الصوت
        audioElement.load();
        
        // وظيفة لبدء التشغيل
        function startPlayback() {
            // تشغيل الصوت مع معالجة الأخطاء
            const playPromise = audioElement.play();
            
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    // تشغيل ناجح
                    console.log('Audio playback started successfully');
                    // تحديث واجهة المستخدم
                    playButton.style.display = 'none';
                    stopButton.style.display = 'inline-flex';
                }).catch(error => {
                    // فشل في التشغيل
                    console.error('Error playing audio:', error);
                    
                    // معالجة خاصة لمتصفح Safari على iOS
                    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                        // إظهار عنصر الصوت مؤقتاً للسماح بالتفاعل المباشر
                        audioElement.style.display = 'block';
                        audioElement.style.position = 'fixed';
                        audioElement.style.top = '50%';
                        audioElement.style.left = '50%';
                        audioElement.style.transform = 'translate(-50%, -50%)';
                        audioElement.style.zIndex = '9999';
                        
                        alert('يرجى النقر مباشرة على عنصر التحكم بالصوت للاستماع. اضغط على زر التشغيل في مشغل الصوت الذي سيظهر.');
                        
                        // إضافة زر لإخفاء عنصر الصوت
                        const closeButton = document.createElement('button');
                        closeButton.textContent = 'إغلاق';
                        closeButton.style.position = 'fixed';
                        closeButton.style.top = 'calc(50% + 50px)';
                        closeButton.style.left = '50%';
                        closeButton.style.transform = 'translateX(-50%)';
                        closeButton.style.zIndex = '10000';
                        closeButton.style.padding = '10px 20px';
                        closeButton.style.backgroundColor = '#4CAF50';
                        closeButton.style.color = 'white';
                        closeButton.style.border = 'none';
                        closeButton.style.borderRadius = '5px';
                        closeButton.style.cursor = 'pointer';
                        
                        closeButton.onclick = function() {
                            audioElement.style.display = 'none';
                            document.body.removeChild(closeButton);
                        };
                        
                        document.body.appendChild(closeButton);
                    } else {
                        // رسالة خطأ عامة لباقي المتصفحات
                        alert('تعذر تشغيل الصوت. يرجى التحقق من إعدادات المتصفح الخاص بك والمحاولة مرة أخرى.');
                    }
                });
            }
        }
    });
    
    // إضافة مستمع حدث لزر الإيقاف
    if (stopButton) {
        stopButton.addEventListener('click', function() {
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
                audioElement.style.display = 'none';
                playButton.style.display = 'inline-flex';
                stopButton.style.display = 'none';
            }
        });
    }
    
    // تحديث واجهة المستخدم عند انتهاء الصوت
    audioElement.addEventListener('ended', function() {
        playButton.style.display = 'inline-flex';
        stopButton.style.display = 'none';
        audioElement.style.display = 'none';
    });
});
