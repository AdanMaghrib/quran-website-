/**
 * مشغل صوتي محسن للقرآن الكريم
 * يدعم تشغيل جميع سور القرآن الكريم بصوت القارئ عبد الرحمن السديس
 */

// المتغيرات العامة
let audioPlayer; // عنصر الصوت
let currentSurah = 1; // السورة الحالية
let isPlaying = false; // حالة التشغيل
let repeatMode = 'none'; // وضع التكرار (none, surah, verse)
let playbackRate = 1.0; // سرعة التشغيل
let wordByWordEnabled = false; // تفعيل الترجمة كلمة بكلمة

// عند تحميل المستند
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة مشغل الصوت
    initAudioPlayer();
    
    // إضافة مستمعي الأحداث للأزرار
    setupEventListeners();
});

/**
 * تهيئة مشغل الصوت
 */
function initAudioPlayer() {
    // إنشاء عنصر الصوت
    audioPlayer = new Audio();
    
    // إضافة مستمعي الأحداث
    audioPlayer.addEventListener('ended', handleAudioEnded);
    audioPlayer.addEventListener('error', handleAudioError);
    audioPlayer.addEventListener('timeupdate', handleTimeUpdate);
    
    // تعيين سرعة التشغيل الافتراضية
    audioPlayer.playbackRate = playbackRate;
}

/**
 * إضافة مستمعي الأحداث للأزرار
 */
function setupEventListeners() {
    // زر تشغيل السورة
    const playButton = document.getElementById('play-surah');
    if (playButton) {
        playButton.addEventListener('click', function() {
            const surahNumber = document.getElementById('surah-title').getAttribute('data-surah-number');
            playSurah(surahNumber);
        });
    }
    
    // زر إيقاف السورة
    const stopButton = document.getElementById('stop-surah');
    if (stopButton) {
        stopButton.addEventListener('click', stopAudio);
    }
    
    // قائمة اختيار سرعة التشغيل
    const speedSelect = document.querySelector('.speed-select');
    if (speedSelect) {
        speedSelect.addEventListener('change', function() {
            setPlaybackRate(parseFloat(this.value));
        });
    }
    
    // قائمة اختيار وضع التكرار
    const repeatSelect = document.querySelector('.repeat-select');
    if (repeatSelect) {
        repeatSelect.addEventListener('change', function() {
            setRepeatMode(this.value);
        });
    }
    
    // زر تفعيل الترجمة كلمة بكلمة
    const wordByWordButton = document.getElementById('word-by-word-toggle');
    if (wordByWordButton) {
        wordByWordButton.addEventListener('click', function() {
            toggleWordByWord();
        });
    }
}

/**
 * تشغيل سورة محددة
 * @param {number} surahNumber - رقم السورة
 */
function playSurah(surahNumber) {
    // التحقق من صحة رقم السورة
    surahNumber = parseInt(surahNumber);
    if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        console.error('رقم سورة غير صالح:', surahNumber);
        return;
    }
    
    // تحديث السورة الحالية
    currentSurah = surahNumber;
    
    // إنشاء رابط الصوت (استخدام API للقارئ عبد الرحمن السديس)
    const audioUrl = `https://server8.mp3quran.net/sud/${surahNumber.toString().padStart(3, '0')}.mp3`;
    
    // تعيين مصدر الصوت
    audioPlayer.src = audioUrl;
    
    // تشغيل الصوت
    audioPlayer.play()
        .then(() => {
            // تحديث حالة التشغيل
            isPlaying = true;
            
            // إظهار زر الإيقاف وإخفاء زر التشغيل
            const playButton = document.getElementById('play-surah');
            const stopButton = document.getElementById('stop-surah');
            
            if (playButton) playButton.style.display = 'none';
            if (stopButton) stopButton.style.display = 'inline-block';
        })
        .catch(error => {
            console.error('خطأ في تشغيل الصوت:', error);
            handleAudioError();
        });
}

/**
 * إيقاف تشغيل الصوت
 */
function stopAudio() {
    // إيقاف الصوت
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    
    // تحديث حالة التشغيل
    isPlaying = false;
    
    // إظهار زر التشغيل وإخفاء زر الإيقاف
    const playButton = document.getElementById('play-surah');
    const stopButton = document.getElementById('stop-surah');
    
    if (playButton) playButton.style.display = 'inline-block';
    if (stopButton) stopButton.style.display = 'none';
    
    // إزالة تمييز الآية الحالية
    removeVerseHighlighting();
}

/**
 * معالجة انتهاء تشغيل الصوت
 */
function handleAudioEnded() {
    // التحقق من وضع التكرار
    if (repeatMode === 'surah') {
        // إعادة تشغيل السورة
        audioPlayer.currentTime = 0;
        audioPlayer.play();
    } else if (repeatMode === 'verse') {
        // إعادة تشغيل الآية الحالية
        // (تحتاج إلى تنفيذ منطق تحديد الآية)
        audioPlayer.currentTime = 0;
        audioPlayer.play();
    } else {
        // إيقاف التشغيل
        stopAudio();
    }
}

/**
 * معالجة خطأ في تشغيل الصوت
 */
function handleAudioError() {
    // إظهار رسالة خطأ
    showErrorMessage('تعذر تحميل ملف الصوت. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
    
    // إيقاف التشغيل
    stopAudio();
}

/**
 * معالجة تحديث الوقت
 */
function handleTimeUpdate() {
    // تحديث شريط التقدم (إذا كان موجوداً)
    const progressBar = document.getElementById('audio-progress');
    if (progressBar) {
        const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${percentage}%`;
    }
    
    // تحديث الآية الحالية (إذا كان التمييز مفعلاً)
    if (wordByWordEnabled) {
        highlightCurrentVerse();
    }
}

/**
 * تعيين سرعة التشغيل
 * @param {number} rate - سرعة التشغيل
 */
function setPlaybackRate(rate) {
    // التحقق من صحة السرعة
    if (isNaN(rate) || rate < 0.5 || rate > 2.0) {
        console.error('سرعة تشغيل غير صالحة:', rate);
        return;
    }
    
    // تحديث سرعة التشغيل
    playbackRate = rate;
    audioPlayer.playbackRate = rate;
    
    // تحديث واجهة المستخدم
    const speedSelect = document.querySelector('.speed-select');
    if (speedSelect) {
        speedSelect.value = rate.toString();
    }
}

/**
 * تعيين وضع التكرار
 * @param {string} mode - وضع التكرار (none, surah, verse)
 */
function setRepeatMode(mode) {
    // التحقق من صحة الوضع
    if (!['none', 'surah', 'verse'].includes(mode)) {
        console.error('وضع تكرار غير صالح:', mode);
        return;
    }
    
    // تحديث وضع التكرار
    repeatMode = mode;
    
    // تحديث واجهة المستخدم
    const repeatSelect = document.querySelector('.repeat-select');
    if (repeatSelect) {
        repeatSelect.value = mode;
    }
}

/**
 * تبديل حالة الترجمة كلمة بكلمة
 */
function toggleWordByWord() {
    // تبديل الحالة
    wordByWordEnabled = !wordByWordEnabled;
    
    // تحديث واجهة المستخدم
    const wordByWordButton = document.getElementById('word-by-word-toggle');
    if (wordByWordButton) {
        wordByWordButton.classList.toggle('active', wordByWordEnabled);
    }
    
    // تطبيق التغييرات
    if (wordByWordEnabled) {
        // تفعيل تمييز الكلمات
        highlightCurrentVerse();
    } else {
        // إزالة تمييز الكلمات
        removeVerseHighlighting();
    }
}

/**
 * تمييز الآية الحالية
 */
function highlightCurrentVerse() {
    // هذه الدالة تحتاج إلى تنفيذ منطق تحديد الآية الحالية بناءً على وقت التشغيل
    // يمكن استخدام بيانات توقيت الآيات من API خارجي
    
    // مثال بسيط: تمييز آية عشوائية كل 5 ثوانٍ
    const verseElements = document.querySelectorAll('.verse');
    if (verseElements.length > 0) {
        // إزالة التمييز من جميع الآيات
        removeVerseHighlighting();
        
        // تحديد الآية بناءً على وقت التشغيل
        const verseIndex = Math.floor(audioPlayer.currentTime / 5) % verseElements.length;
        verseElements[verseIndex].classList.add('highlighted-verse');
        
        // تمرير إلى الآية المحددة
        verseElements[verseIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * إزالة تمييز الآيات
 */
function removeVerseHighlighting() {
    const highlightedVerses = document.querySelectorAll('.highlighted-verse');
    highlightedVerses.forEach(verse => {
        verse.classList.remove('highlighted-verse');
    });
}

/**
 * إظهار رسالة خطأ
 * @param {string} message - نص الرسالة
 */
function showErrorMessage(message) {
    // إنشاء عنصر الرسالة
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // إضافة زر إغلاق
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fermer';
    closeButton.className = 'close-btn';
    closeButton.addEventListener('click', function() {
        errorDiv.remove();
    });
    
    // إضافة زر الإغلاق إلى الرسالة
    errorDiv.appendChild(closeButton);
    
    // إضافة الرسالة إلى الصفحة
    const versesContainer = document.getElementById('verses-container');
    if (versesContainer) {
        versesContainer.prepend(errorDiv);
    } else {
        document.body.prepend(errorDiv);
    }
    
    // إزالة الرسالة بعد 10 ثوانٍ
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 10000);
}

// تصدير الدوال للاستخدام في ملفات أخرى
window.playSurah = playSurah;
window.stopAudio = stopAudio;
window.setPlaybackRate = setPlaybackRate;
window.setRepeatMode = setRepeatMode;
window.toggleWordByWord = toggleWordByWord;
