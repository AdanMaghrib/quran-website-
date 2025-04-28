/**
 * ملف JavaScript محسن لتشغيل الصوت في قسم القرآن الكريم
 * يعمل بشكل متوافق مع جميع المتصفحات بما في ذلك Safari على iOS
 */

document.addEventListener('DOMContentLoaded', function() {
    // تحقق من وجود زر الاستماع
    const playButton = document.getElementById('play-surah');
    const stopButton = document.getElementById('stop-surah');
    if (!playButton) return;
    
    // إنشاء عنصر الصوت
    const audioElement = document.createElement('audio');
    audioElement.id = 'quran-audio-player';
    audioElement.style.display = 'none';
    document.body.appendChild(audioElement);
    
    // إضافة مستمع حدث لزر الاستماع
    playButton.addEventListener('click', function() {
        const reciterSelect = document.getElementById('reciter-select');
        if (!reciterSelect) return;
        
        const reciter = reciterSelect.value;
        const surahNumber = document.querySelector('#surah-title')?.dataset?.surahNumber || 1;
        
        // تحديد القارئ المناسب للرابط (استخدام القيمة مباشرة من القائمة المنسدلة)
        const reciterCode = reciter;
        
        // بناء رابط الصوت مع التأكد من استخدام HTTPS
        const audioUrl = `https://cdn.islamic.network/quran/audio/128/${reciterCode}/${surahNumber}.mp3`;
        console.log('Playing audio from URL:', audioUrl);
        
        // تحديث مصدر الصوت
        audioElement.src = audioUrl;
        
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
                    // إظهار رسالة للمستخدم
                    alert('لتشغيل الصوت، يرجى النقر مرة أخرى على زر الاستماع. هذا مطلوب في بعض المتصفحات لأسباب أمنية.');
                    
                    // إضافة مستمع حدث للنقر على المستند لتمكين الصوت
                    const enableAudio = function() {
                        audioElement.play()
                            .then(() => {
                                console.log('Audio enabled after user interaction');
                                playButton.style.display = 'none';
                                stopButton.style.display = 'inline-flex';
                                document.removeEventListener('click', enableAudio);
                            })
                            .catch(err => {
                                console.error('Still cannot play audio:', err);
                                alert('تعذر تشغيل الصوت. يرجى التحقق من إعدادات المتصفح الخاص بك.');
                            });
                    };
                    
                    document.addEventListener('click', enableAudio);
                } else {
                    // رسالة خطأ عامة لباقي المتصفحات
                    alert('تعذر تشغيل الصوت. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
                }
            });
        }
    });
    
    // إضافة مستمع حدث لزر الإيقاف
    if (stopButton) {
        stopButton.addEventListener('click', function() {
            const audioElement = document.getElementById('quran-audio-player');
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
                playButton.style.display = 'inline-flex';
                stopButton.style.display = 'none';
            }
        });
    }
    
    // تحديث واجهة المستخدم عند انتهاء الصوت
    audioElement.addEventListener('ended', function() {
        playButton.style.display = 'inline-flex';
        stopButton.style.display = 'none';
    });
});
