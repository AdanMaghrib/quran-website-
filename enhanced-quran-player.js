/**
 * مشغل صوتي محسن للقرآن الكريم
 * يدعم تشغيل سور القرآن الكريم بصوت الشيخ مشاري راشد العفاسي
 * مع ميزات متقدمة: التحكم في السرعة، التكرار، الاستمرار التلقائي، وحفظ موضع التوقف
 */

// المتغيرات العامة
let audioPlayer; // عنصر الصوت
let currentSurah = 1; // السورة الحالية
let isPlaying = false; // حالة التشغيل
let repeatMode = 'none'; // وضع التكرار (none, surah, verse)
let playbackRate = 1.0; // سرعة التشغيل
let autoPlayNext = false; // استمرار القراءة التلقائية للسورة التالية
let currentReciter = 'Alafasy'; // القارئ الافتراضي (مشاري راشد العفاسي)

// المتغيرات المتعلقة بحفظ الموضع
let lastPosition = {}; // تخزين آخر موضع توقف لكل سورة

// عند تحميل المستند
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة مشغل الصوت
    initAudioPlayer();
    
    // إضافة مستمعي الأحداث للأزرار
    setupEventListeners();
    
    // استرجاع الإعدادات المحفوظة
    loadSavedSettings();
    
    // إضافة عناصر واجهة المستخدم الإضافية
    addEnhancedUIElements();
});

/**
 * تهيئة مشغل الصوت
 */
function initAudioPlayer() {
    // إنشاء عنصر الصوت إذا لم يكن موجوداً
    let existingPlayer = document.getElementById('quran-audio-player');
    
    if (existingPlayer) {
        audioPlayer = existingPlayer;
    } else {
        audioPlayer = document.createElement('audio');
        audioPlayer.id = 'quran-audio-player';
        audioPlayer.style.display = 'none';
        audioPlayer.controls = true; // إضافة عناصر التحكم للتوافق مع iOS
        document.body.appendChild(audioPlayer);
    }
    
    // إضافة مستمعي الأحداث
    audioPlayer.addEventListener('ended', handleAudioEnded);
    audioPlayer.addEventListener('error', handleAudioError);
    audioPlayer.addEventListener('timeupdate', handleTimeUpdate);
    audioPlayer.addEventListener('play', function() {
        isPlaying = true;
        updateUIForPlayback(true);
    });
    audioPlayer.addEventListener('pause', function() {
        isPlaying = false;
        updateUIForPlayback(false);
    });
    
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
    
    // قائمة اختيار القارئ
    const reciterSelect = document.getElementById('reciter-select');
    if (reciterSelect) {
        reciterSelect.addEventListener('change', function() {
            currentReciter = this.value;
            // إذا كان الصوت يعمل، أعد تشغيله بالقارئ الجديد
            if (isPlaying) {
                const surahNumber = document.getElementById('surah-title').getAttribute('data-surah-number');
                playSurah(surahNumber);
            }
        });
    }
}

/**
 * إضافة عناصر واجهة المستخدم الإضافية
 */
function addEnhancedUIElements() {
    // التحقق من وجود قسم خيارات القارئ
    const reciterOptions = document.querySelector('.reciter-options');
    if (!reciterOptions) return;
    
    // إضافة عناصر التحكم في السرعة
    if (!document.querySelector('.speed-control')) {
        const speedControl = document.createElement('div');
        speedControl.className = 'speed-control';
        speedControl.innerHTML = `
            <label for="speed-select">سرعة التشغيل:</label>
            <select id="speed-select" class="speed-select">
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1.0" selected>1.0x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2.0">2.0x</option>
            </select>
        `;
        reciterOptions.appendChild(speedControl);
        
        // إضافة مستمع الحدث
        document.getElementById('speed-select').addEventListener('change', function() {
            setPlaybackRate(parseFloat(this.value));
        });
    }
    
    // إضافة عناصر التحكم في التكرار
    if (!document.querySelector('.repeat-control')) {
        const repeatControl = document.createElement('div');
        repeatControl.className = 'repeat-control';
        repeatControl.innerHTML = `
            <label for="repeat-select">التكرار:</label>
            <select id="repeat-select" class="repeat-select">
                <option value="none" selected>بدون تكرار</option>
                <option value="surah">تكرار السورة</option>
                <option value="verse">تكرار الآية</option>
            </select>
        `;
        reciterOptions.appendChild(repeatControl);
        
        // إضافة مستمع الحدث
        document.getElementById('repeat-select').addEventListener('change', function() {
            setRepeatMode(this.value);
        });
    }
    
    // إضافة خيار الاستمرار التلقائي
    if (!document.querySelector('.auto-continue')) {
        const autoContinueControl = document.createElement('div');
        autoContinueControl.className = 'auto-continue';
        autoContinueControl.innerHTML = `
            <label for="auto-continue-checkbox">استمرار تلقائي:</label>
            <input type="checkbox" id="auto-continue-checkbox">
        `;
        reciterOptions.appendChild(autoContinueControl);
        
        // إضافة مستمع الحدث
        document.getElementById('auto-continue-checkbox').addEventListener('change', function() {
            autoPlayNext = this.checked;
            // حفظ الإعداد
            localStorage.setItem('quran_auto_continue', autoPlayNext ? 'true' : 'false');
        });
    }
    
    // إضافة شريط التقدم
    if (!document.querySelector('.progress-container')) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.innerHTML = `
            <div class="progress-bar-container">
                <div id="audio-progress" class="progress-bar"></div>
            </div>
            <div class="time-display">
                <span id="current-time">00:00</span> / <span id="total-time">00:00</span>
            </div>
        `;
        
        // إضافة شريط التقدم بعد خيارات القارئ
        const surahOptions = document.querySelector('.surah-options');
        if (surahOptions) {
            surahOptions.parentNode.insertBefore(progressContainer, surahOptions.nextSibling);
        }
        
        // إضافة مستمع الحدث للنقر على شريط التقدم
        const progressBarContainer = document.querySelector('.progress-bar-container');
        if (progressBarContainer) {
            progressBarContainer.addEventListener('click', function(e) {
                if (!audioPlayer.duration) return;
                
                const rect = this.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audioPlayer.currentTime = pos * audioPlayer.duration;
                
                // حفظ الموضع الجديد
                saveCurrentPosition();
            });
        }
    }
    
    // إضافة أنماط CSS للعناصر الجديدة
    addCustomStyles();
}

/**
 * إضافة أنماط CSS للعناصر الجديدة
 */
function addCustomStyles() {
    if (!document.getElementById('enhanced-player-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'enhanced-player-styles';
        styleElement.textContent = `
            .reciter-options {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .speed-control, .repeat-control, .auto-continue {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .progress-container {
                margin: 15px 0;
            }
            
            .progress-bar-container {
                height: 10px;
                background-color: #e0e0e0;
                border-radius: 5px;
                overflow: hidden;
                cursor: pointer;
                margin-bottom: 5px;
            }
            
            .progress-bar {
                height: 100%;
                background-color: #4CAF50;
                width: 0;
                transition: width 0.1s;
            }
            
            .time-display {
                font-size: 0.8em;
                text-align: left;
                color: #666;
            }
            
            .highlighted-verse {
                background-color: rgba(76, 175, 80, 0.1);
                border-right: 3px solid #4CAF50;
            }
            
            @media (max-width: 768px) {
                .reciter-options {
                    flex-direction: column;
                    align-items: flex-start;
                }
            }
        `;
        document.head.appendChild(styleElement);
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
    
    // تحديد مصدر الصوت بناءً على القارئ المحدد
    let audioSrc = '';
    
    // استخدام الملفات المحلية المتوفرة
    if (currentReciter === 'Alafasy') {
        // التحقق من السور المتوفرة محلياً
        if (surahNumber === 1) {
            audioSrc = 'audio/alafasy/fatiha.mp3';
        } else if (surahNumber === 2) {
            audioSrc = 'audio/alafasy/baqarah.mp3';
        } else if (surahNumber === 3) {
            audioSrc = 'audio/alafasy/imran.mp3';
        } else {
            // للسور غير المتوفرة محلياً، استخدم API خارجي
            audioSrc = `https://server7.mp3quran.net/shur/${surahNumber.toString().padStart(3, '0')}.mp3`;
        }
    } else if (currentReciter === 'Abdul_Basit_Murattal') {
        audioSrc = `https://server7.mp3quran.net/basit/${surahNumber.toString().padStart(3, '0')}.mp3`;
    } else if (currentReciter === 'Maher_AlMuaiqly') {
        audioSrc = `https://server12.mp3quran.net/maher/${surahNumber.toString().padStart(3, '0')}.mp3`;
    } else if (currentReciter === 'Husary') {
        audioSrc = `https://server13.mp3quran.net/husr/${surahNumber.toString().padStart(3, '0')}.mp3`;
    } else if (currentReciter === 'Minshawi') {
        audioSrc = `https://server8.mp3quran.net/minsh/${surahNumber.toString().padStart(3, '0')}.mp3`;
    } else if (currentReciter === 'Sudais') {
        audioSrc = `https://server11.mp3quran.net/sds/${surahNumber.toString().padStart(3, '0')}.mp3`;
    } else {
        // استخدم الفاتحة كافتراضي إذا لم يتم التعرف على القارئ
        audioSrc = 'audio/alafasy/fatiha.mp3';
    }
    
    console.log('Playing audio file:', audioSrc);
    
    // تعيين مصدر الصوت
    audioPlayer.src = audioSrc;
    
    // استرجاع آخر موضع توقف للسورة الحالية
    const savedPosition = getSavedPosition(surahNumber, currentReciter);
    if (savedPosition > 0) {
        audioPlayer.currentTime = savedPosition;
    }
    
    // تعيين سرعة التشغيل
    audioPlayer.playbackRate = playbackRate;
    
    // تشغيل الصوت
    const playPromise = audioPlayer.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // تشغيل ناجح
            console.log('Audio playback started successfully');
            // تحديث واجهة المستخدم
            updateUIForPlayback(true);
        }).catch(error => {
            // فشل في التشغيل
            console.error('Error playing audio:', error);
            
            // معالجة خاصة لمتصفح Safari على iOS
            if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                handleIOSPlayback();
            } else {
                // رسالة خطأ عامة لباقي المتصفحات
                showErrorMessage('تعذر تشغيل الصوت. يرجى التحقق من إعدادات المتصفح الخاص بك والمحاولة مرة أخرى.');
            }
        });
    }
}

/**
 * معالجة خاصة لتشغيل الصوت في متصفح Safari على iOS
 */
function handleIOSPlayback() {
    // إظهار عنصر الصوت مؤقتاً للسماح بالتفاعل المباشر
    audioPlayer.style.display = 'block';
    audioPlayer.style.position = 'fixed';
    audioPlayer.style.top = '50%';
    audioPlayer.style.left = '50%';
    audioPlayer.style.transform = 'translate(-50%, -50%)';
    audioPlayer.style.zIndex = '9999';
    
    showErrorMessage('يرجى النقر مباشرة على عنصر التحكم بالصوت للاستماع. اضغط على زر التشغيل في مشغل الصوت الذي سيظهر.');
    
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
        audioPlayer.style.display = 'none';
        document.body.removeChild(closeButton);
    };
    
    document.body.appendChild(closeButton);
}

/**
 * تحديث واجهة المستخدم بناءً على حالة التشغيل
 * @param {boolean} isPlaying - حالة التشغيل
 */
function updateUIForPlayback(isPlaying) {
    const playButton = document.getElementById('play-surah');
    const stopButton = document.getElementById('stop-surah');
    
    if (playButton) playButton.style.display = isPlaying ? 'none' : 'inline-block';
    if (stopButton) stopButton.style.display = isPlaying ? 'inline-block' : 'none';
}

/**
 * إيقاف تشغيل الصوت
 */
function stopAudio() {
    // حفظ الموضع الحالي قبل الإيقاف
    saveCurrentPosition();
    
    // إيقاف الصوت
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    
    // تحديث حالة التشغيل
    isPlaying = false;
    
    // تحديث واجهة المستخدم
    updateUIForPlayback(false);
    
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
    } else if (autoPlayNext) {
        // الانتقال إلى السورة التالية
        navigateToNextSurah();
    } else {
        // إيقاف التشغيل
        stopAudio();
    }
}

/**
 * الانتقال إلى السورة التالية
 */
function navigateToNextSurah() {
    if (currentSurah < 114) {
        const nextSurahNumber = currentSurah + 1;
        
        // التحقق من وجود زر الانتقال إلى السورة التالية
        const nextSurahButton = document.getElementById('next-surah');
        if (nextSurahButton) {
            // محاكاة النقر على الزر للانتقال إلى السورة التالية
            nextSurahButton.click();
            
            // تشغيل السورة التالية بعد فترة قصيرة
            setTimeout(() => {
                playSurah(nextSurahNumber);
            }, 500);
        } else {
            // إذا لم يكن الزر موجوداً، تشغيل السورة التالية مباشرة
            playSurah(nextSurahNumber);
        }
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
    // تحديث شريط التقدم
    updateProgressBar();
    
    // تحديث عرض الوقت
    updateTimeDisplay();
    
    // حفظ الموضع الحالي كل 5 ثوانٍ
    if (Math.floor(audioPlayer.currentTime) % 5 === 0) {
        saveCurrentPosition();
    }
}

/**
 * تحديث شريط التقدم
 */
function updateProgressBar() {
    const progressBar = document.getElementById('audio-progress');
    if (progressBar && !isNaN(audioPlayer.duration)) {
        const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${percentage}%`;
    }
}

/**
 * تحديث عرض الوقت
 */
function updateTimeDisplay() {
    const currentTimeElement = document.getElementById('current-time');
    const totalTimeElement = document.getElementById('total-time');
    
    if (currentTimeElement && totalTimeElement) {
        currentTimeElement.textContent = formatTime(audioPlayer.currentTime);
        totalTimeElement.textContent = formatTime(audioPlayer.duration);
    }
}

/**
 * تنسيق الوقت بصيغة MM:SS
 * @param {number} timeInSeconds - الوقت بالثواني
 * @returns {string} - الوقت بصيغة MM:SS
 */
function formatTime(timeInSeconds) {
    if (isNaN(timeInSeconds)) return '00:00';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
    const speedSelect = document.getElementById('speed-select');
    if (speedSelect) {
        speedSelect.value = rate.toString();
    }
    
    // حفظ الإعداد
    localStorage.setItem('quran_playback_rate', rate.toString());
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
    const repeatSelect = document.getElementById('repeat-select');
    if (repeatSelect) {
        repeatSelect.value = mode;
    }
    
    // حفظ الإعداد
    localStorage.setItem('quran_repeat_mode', mode);
}

/**
 * حفظ الموضع الحالي
 */
function saveCurrentPosition() {
    if (!audioPlayer || !currentSurah || audioPlayer.currentTime === 0) return;
    
    // حفظ الموضع الحالي في الذاكرة
    const key = `${currentSurah}_${currentReciter}`;
    lastPosition[key] = audioPlayer.currentTime;
    
    // حفظ في التخزين المحلي
    try {
        localStorage.setItem('quran_last_positions', JSON.stringify(lastPosition));
    } catch (e) {
        console.error('Error saving position to localStorage:', e);
    }
}

/**
 * استرجاع آخر موضع توقف
 * @param {number} surahNumber - رقم السورة
 * @param {string} reciter - القارئ
 * @returns {number} - آخر موضع توقف (بالثواني)
 */
function getSavedPosition(surahNumber, reciter) {
    const key = `${surahNumber}_${reciter}`;
    
    // التحقق من الذاكرة أولاً
    if (lastPosition[key] !== undefined) {
        return lastPosition[key];
    }
    
    // التحقق من التخزين المحلي
    try {
        const savedPositions = localStorage.getItem('quran_last_positions');
        if (savedPositions) {
            const positions = JSON.parse(savedPositions);
            lastPosition = positions; // تحديث المتغير العام
            return positions[key] || 0;
        }
    } catch (e) {
        console.error('Error loading position from localStorage:', e);
    }
    
    return 0;
}

/**
 * تحميل الإعدادات المحفوظة
 */
function loadSavedSettings() {
    try {
        // استرجاع سرعة التشغيل
        const savedRate = localStorage.getItem('quran_playback_rate');
        if (savedRate) {
            setPlaybackRate(parseFloat(savedRate));
        }
        
        // استرجاع وضع التكرار
        const savedRepeatMode = localStorage.getItem('quran_repeat_mode');
        if (savedRepeatMode) {
            setRepeatMode(savedRepeatMode);
        }
        
        // استرجاع إعداد الاستمرار التلقائي
        const savedAutoContinue = localStorage.getItem('quran_auto_continue');
        if (savedAutoContinue) {
            autoPlayNext = savedAutoContinue === 'true';
            const autoContinueCheckbox = document.getElementById('auto-continue-checkbox');
            if (autoContinueCheckbox) {
                autoContinueCheckbox.checked = autoPlayNext;
            }
        }
        
        // استرجاع مواضع التوقف
        const savedPositions = localStorage.getItem('quran_last_positions');
        if (savedPositions) {
            lastPosition = JSON.parse(savedPositions);
        }
    } catch (e) {
        console.error('Error loading settings from localStorage:', e);
    }
}

/**
 * إظهار رسالة خطأ
 * @param {string} message - نص الرسالة
 */
function showErrorMessage(message) {
    // التحقق من وجود رسالة خطأ سابقة وإزالتها
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // إنشاء عنصر الرسالة
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // إضافة أنماط CSS
    errorDiv.style.backgroundColor = '#f44336';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '10px 15px';
    errorDiv.style.borderRadius = '5px';
    errorDiv.style.margin = '10px 0';
    errorDiv.style.position = 'relative';
    errorDiv.style.textAlign = 'center';
    
    // إضافة زر إغلاق
    const closeButton = document.createElement('button');
    closeButton.textContent = 'إغلاق';
    closeButton.style.marginRight = '10px';
    closeButton.style.padding = '5px 10px';
    closeButton.style.backgroundColor = 'white';
    closeButton.style.color = '#f44336';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '3px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.marginTop = '10px';
    
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

/**
 * إزالة تمييز الآيات
 */
function removeVerseHighlighting() {
    const highlightedVerses = document.querySelectorAll('.highlighted-verse');
    highlightedVerses.forEach(verse => {
        verse.classList.remove('highlighted-verse');
    });
}

// تصدير الدوال للاستخدام في ملفات أخرى
window.playSurah = playSurah;
window.stopAudio = stopAudio;
window.setPlaybackRate = setPlaybackRate;
window.setRepeatMode = setRepeatMode;
