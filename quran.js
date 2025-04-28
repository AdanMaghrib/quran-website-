/**
 * ملف JavaScript لصفحة القرآن الكريم
 * يتعامل مع واجهة برمجة تطبيقات AlQuran.cloud للحصول على بيانات القرآن
 */

// المتغيرات العامة
let surahs = []; // مصفوفة لتخزين بيانات السور
let currentSurah = null; // السورة الحالية المعروضة
let currentReciter = 'Abdul_Basit_Murattal'; // القارئ الافتراضي

// عند تحميل المستند
document.addEventListener('DOMContentLoaded', function() {
    // تحديث السنة في التذييل
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // تهيئة صفحة القرآن
    initQuranPage();
    
    // إضافة مستمعي الأحداث للأزرار
    document.getElementById('view-surah').addEventListener('click', () => switchView('surah'));
    document.getElementById('view-juz').addEventListener('click', () => switchView('juz'));
    document.getElementById('view-revelation').addEventListener('click', () => switchView('revelation'));
    
    document.getElementById('back-to-list').addEventListener('click', showSurahsList);
    document.getElementById('search-btn').addEventListener('click', searchQuran);
    document.getElementById('quran-search').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchQuran();
        }
    });
    
    document.getElementById('reciter-select').addEventListener('change', function() {
        currentReciter = this.value;
    });
    
    document.getElementById('translation-select').addEventListener('change', function() {
        if (currentSurah) {
            loadSurahVerses(currentSurah.number, this.value);
        }
    });
    
    document.getElementById('tafsir-select').addEventListener('change', function() {
        if (currentSurah) {
            loadTafsir(currentSurah.number, this.value);
        }
    });
    
    document.getElementById('prev-surah').addEventListener('click', navigateToPrevSurah);
    document.getElementById('next-surah').addEventListener('click', navigateToNextSurah);
});

/**
 * تهيئة صفحة القرآن وتحميل قائمة السور
 */
function initQuranPage() {
    // تحميل قائمة السور
    fetchSurahs();
}

/**
 * جلب قائمة السور من واجهة برمجة التطبيقات
 */
function fetchSurahs() {
    axios.get('https://api.alquran.cloud/v1/surah')
        .then(response => {
            if (response.data && response.data.code === 200) {
                surahs = response.data.data;
                displaySurahs(surahs);
                
                // جعل قائمة السور متاحة عالمياً للاستخدام في ملفات أخرى
                window.quranSurahs = surahs;
            } else {
                showError('حدث خطأ أثناء تحميل قائمة السور');
            }
        })
        .catch(error => {
            console.error('Error fetching surahs:', error);
            showError('تعذر الاتصال بخادم القرآن. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
        });
}

/**
 * عرض قائمة السور في الصفحة
 * @param {Array} surahsList - قائمة السور
 */
function displaySurahs(surahsList) {
    const surahsContainer = document.getElementById('surahs-list');
    surahsContainer.innerHTML = '';
    
    surahsList.forEach(surah => {
        const surahCard = document.createElement('div');
        surahCard.className = 'surah-card';
        surahCard.dataset.surahId = surah.number;
        
        surahCard.innerHTML = `
            <div class="surah-card-header">
                <span class="surah-number">${surah.number}</span>
                <span class="surah-type">${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
            </div>
            <h3 class="surah-name">${surah.name}</h3>
            <div class="surah-info">
                <span>${surah.englishName}</span>
                <span>${surah.numberOfAyahs} آيات</span>
            </div>
        `;
        
        surahCard.addEventListener('click', () => {
            showSurah(surah.number);
        });
        
        surahsContainer.appendChild(surahCard);
    });
}

/**
 * عرض السورة المحددة
 * @param {number} surahNumber - رقم السورة
 */
function showSurah(surahNumber) {
    // إخفاء قائمة السور وإظهار عرض السورة
    document.getElementById('surahs-list').style.display = 'none';
    document.getElementById('search-results').style.display = 'none';
    document.getElementById('surah-view').style.display = 'block';
    
    // تحميل بيانات السورة
    const surah = surahs.find(s => s.number === surahNumber);
    if (surah) {
        currentSurah = surah;
        window.currentSurah = surah; // جعل السورة الحالية متاحة عالمياً
        
        // تحديث عنوان السورة ومعلوماتها
        const surahTitleElement = document.getElementById('surah-title');
        surahTitleElement.textContent = `سورة ${surah.name}`;
        surahTitleElement.dataset.surahNumber = surah.number; // إضافة رقم السورة كسمة للعنوان
        
        document.getElementById('surah-type').textContent = surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية';
        document.getElementById('surah-verses').textContent = `عدد الآيات: ${surah.numberOfAyahs}`;
        
        // إخفاء البسملة في سورة التوبة (رقم 9)
        document.getElementById('bismillah').style.display = surah.number === 9 ? 'none' : 'block';
        
        // تحميل آيات السورة
        const translationSelect = document.getElementById('translation-select');
        loadSurahVerses(surah.number, translationSelect.value);
        
        // تحديث أزرار التنقل
        updateNavigationButtons(surah.number);
    } else {
        showError('لم يتم العثور على السورة المطلوبة');
    }
}

/**
 * تحميل آيات السورة
 * @param {number} surahNumber - رقم السورة
 * @param {string} translation - رمز الترجمة (en, fr, none)
 */
function loadSurahVerses(surahNumber, translation) {
    const versesContainer = document.getElementById('verses-container');
    versesContainer.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>جاري تحميل الآيات...</p>
        </div>
    `;
    
    // تحميل الآيات بالعربية
    axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}`)
        .then(response => {
            if (response.data && response.data.code === 200) {
                const verses = response.data.data.ayahs;
                
                // إذا كانت الترجمة مطلوبة
                if (translation && translation !== 'none') {
                    // تحديد رمز الترجمة المناسب
                    const translationCode = translation === 'en' ? 'en.sahih' : 'fr.hamidullah';
                    
                    // تحميل الترجمة
                    axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}/${translationCode}`)
                        .then(transResponse => {
                            if (transResponse.data && transResponse.data.code === 200) {
                                const translatedVerses = transResponse.data.data.ayahs;
                                displayVersesWithTranslation(verses, translatedVerses);
                            } else {
                                displayVerses(verses);
                                showError('تعذر تحميل الترجمة');
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching translation:', error);
                            displayVerses(verses);
                            showError('تعذر تحميل الترجمة');
                        });
                } else {
                    // عرض الآيات بدون ترجمة
                    displayVerses(verses);
                }
                
                // تحميل التفسير إذا كان محدداً
                const tafsirSelect = document.getElementById('tafsir-select');
                if (tafsirSelect.value !== 'none') {
                    loadTafsir(surahNumber, tafsirSelect.value);
                }
            } else {
                showError('حدث خطأ أثناء تحميل الآيات');
            }
        })
        .catch(error => {
            console.error('Error fetching verses:', error);
            showError('تعذر الاتصال بخادم القرآن. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
        });
}

/**
 * عرض الآيات في الصفحة
 * @param {Array} verses - قائمة الآيات
 */
function displayVerses(verses) {
    const versesContainer = document.getElementById('verses-container');
    versesContainer.innerHTML = '';
    
    verses.forEach(verse => {
        const verseElement = document.createElement('div');
        verseElement.className = 'verse';
        verseElement.dataset.verseNumber = verse.numberInSurah;
        
        verseElement.innerHTML = `
            <div class="verse-text">
                <span class="verse-number">${verse.numberInSurah}</span>
                ${verse.text}
            </div>
        `;
        
        versesContainer.appendChild(verseElement);
    });
}

/**
 * عرض الآيات مع الترجمة
 * @param {Array} verses - قائمة الآيات بالعربية
 * @param {Array} translatedVerses - قائمة الآيات المترجمة
 */
function displayVersesWithTranslation(verses, translatedVerses) {
    const versesContainer = document.getElementById('verses-container');
    versesContainer.innerHTML = '';
    
    verses.forEach((verse, index) => {
        const verseElement = document.createElement('div');
        verseElement.className = 'verse';
        verseElement.dataset.verseNumber = verse.numberInSurah;
        
        const translatedVerse = translatedVerses[index];
        
        verseElement.innerHTML = `
            <div class="verse-text">
                <span class="verse-number">${verse.numberInSurah}</span>
                ${verse.text}
            </div>
            <div class="verse-translation">
                ${translatedVerse.text}
            </div>
        `;
        
        versesContainer.appendChild(verseElement);
    });
}

/**
 * تحميل التفسير للسورة
 * @param {number} surahNumber - رقم السورة
 * @param {string} tafsirCode - رمز التفسير
 */
function loadTafsir(surahNumber, tafsirCode) {
    if (tafsirCode === 'none') {
        // إزالة التفسير من الآيات
        const tafsirElements = document.querySelectorAll('.verse-tafsir');
        tafsirElements.forEach(el => el.remove());
        return;
    }
    
    axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}/${tafsirCode}`)
        .then(response => {
            if (response.data && response.data.code === 200) {
                const tafsirVerses = response.data.data.ayahs;
                
                // إضافة التفسير لكل آية
                tafsirVerses.forEach(tafsir => {
                    const verseElement = document.querySelector(`.verse[data-verse-number="${tafsir.numberInSurah}"]`);
                    if (verseElement) {
                        // إزالة التفسير السابق إن وجد
                        const oldTafsir = verseElement.querySelector('.verse-tafsir');
                        if (oldTafsir) {
                            oldTafsir.remove();
                        }
                        
                        // إضافة التفسير الجديد
                        const tafsirElement = document.createElement('div');
                        tafsirElement.className = 'verse-tafsir';
                        
                        // معالجة النص لإصلاح مشكلة الترميز
                        const cleanText = fixArabicText(tafsir.text);
                        tafsirElement.innerHTML = cleanText;
                        
                        verseElement.appendChild(tafsirElement);
                    }
                });
            } else {
                showError('تعذر تحميل التفسير');
            }
        })
        .catch(error => {
            console.error('Error fetching tafsir:', error);
            showError('تعذر تحميل التفسير');
        });
}

/**
 * إصلاح مشكلة عرض النصوص العربية
 * @param {string} text - النص العربي المراد إصلاحه
 * @returns {string} - النص بعد الإصلاح
 */
function fixArabicText(text) {
    if (!text) return '';
    
    // استبدال رموز HTML الخاصة
    let cleanText = text
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#(\d+);/g, function(match, dec) {
            return String.fromCharCode(dec);
        });
    
    // إصلاح ترتيب الحروف العربية (في حالة وجود مشكلة في الترتيب)
    cleanText = cleanText.replace(/\u0020\u064e/g, '\u064e\u0020'); // فتحة بعد مسافة
    cleanText = cleanText.replace(/\u0020\u064f/g, '\u064f\u0020'); // ضمة بعد مسافة
    cleanText = cleanText.replace(/\u0020\u0650/g, '\u0650\u0020'); // كسرة بعد مسافة
    cleanText = cleanText.replace(/\u0020\u0651/g, '\u0651\u0020'); // شدة بعد مسافة
    cleanText = cleanText.replace(/\u0020\u0652/g, '\u0652\u0020'); // سكون بعد مسافة
    
    // إضافة علامات HTML لتحسين العرض
    cleanText = `<span class="arabic-text">${cleanText}</span>`;
    
    return cleanText;
}

/**
 * البحث في القرآن الكريم
 */
function searchQuran() {
    const searchQuery = document.getElementById('quran-search').value.trim();
    if (!searchQuery) return;
    
    // إظهار قسم نتائج البحث
    document.getElementById('surahs-list').style.display = 'none';
    document.getElementById('surah-view').style.display = 'none';
    
    const searchResults = document.getElementById('search-results');
    searchResults.style.display = 'block';
    searchResults.querySelector('.results-container').innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>جاري البحث...</p>
        </div>
    `;
    
    // البحث باستخدام واجهة برمجة التطبيقات
    axios.get(`https://api.alquran.cloud/v1/search/${searchQuery}/all/ar`)
        .then(response => {
            if (response.data && response.data.code === 200) {
                const results = response.data.data.matches;
                displaySearchResults(results, searchQuery);
            } else {
                showNoResults(searchQuery);
            }
        })
        .catch(error => {
            console.error('Error searching Quran:', error);
            showError('تعذر إجراء البحث. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
        });
}

/**
 * عرض نتائج البحث
 * @param {Array} results - نتائج البحث
 * @param {string} query - نص البحث
 */
function displaySearchResults(results, query) {
    const resultsContainer = document.querySelector('#search-results .results-container');
    
    if (results.length === 0) {
        showNoResults(query);
        return;
    }
    
    resultsContainer.innerHTML = `
        <p class="search-summary">تم العثور على ${results.length} نتيجة لـ "${query}"</p>
    `;
    
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        // الحصول على اسم السورة من مصفوفة السور
        const surah = surahs.find(s => s.number === result.surah.number);
        const surahName = surah ? surah.name : result.surah.name;
        
        resultItem.innerHTML = `
            <div class="result-surah">سورة ${surahName} - الآية ${result.numberInSurah}</div>
            <div class="result-text">${highlightSearchTerm(result.text, query)}</div>
            <div class="result-meta">
                <span>${result.surah.englishName}</span>
                <span class="result-link" data-surah="${result.surah.number}" data-verse="${result.numberInSurah}">عرض في السورة</span>
            </div>
        `;
        
        // إضافة مستمع الحدث للرابط
        resultItem.querySelector('.result-link').addEventListener('click', function() {
            const surahNumber = parseInt(this.dataset.surah);
            const verseNumber = parseInt(this.dataset.verse);
            showSurahWithVerse(surahNumber, verseNumber);
        });
        
        resultsContainer.appendChild(resultItem);
    });
}

/**
 * تمييز مصطلح البحث في النص
 * @param {string} text - النص الأصلي
 * @param {string} term - مصطلح البحث
 * @returns {string} - النص مع تمييز مصطلح البحث
 */
function highlightSearchTerm(text, term) {
    // تهروب الأحرف الخاصة في مصطلح البحث
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

/**
 * عرض رسالة عدم وجود نتائج
 * @param {string} query - نص البحث
 */
function showNoResults(query) {
    const resultsContainer = document.querySelector('#search-results .results-container');
    resultsContainer.innerHTML = `
        <div class="no-results">
            <i class="fas fa-search"></i>
            <p>لم يتم العثور على نتائج لـ "${query}"</p>
            <p>يرجى التحقق من الكلمات المفتاحية أو تجربة كلمات أخرى.</p>
        </div>
    `;
}

/**
 * عرض السورة مع تمييز آية محددة
 * @param {number} surahNumber - رقم السورة
 * @param {number} verseNumber - رقم الآية
 */
function showSurahWithVerse(surahNumber, verseNumber) {
    // عرض السورة أولاً
    showSurah(surahNumber);
    
    // انتظار تحميل الآيات ثم التمرير إلى الآية المحددة
    setTimeout(() => {
        const verseElement = document.querySelector(`.verse[data-verse-number="${verseNumber}"]`);
        if (verseElement) {
            // تمييز الآية
            verseElement.classList.add('highlighted-verse');
            
            // التمرير إلى الآية
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // إزالة التمييز بعد فترة
            setTimeout(() => {
                verseElement.classList.remove('highlighted-verse');
            }, 3000);
        }
    }, 1000);
}

/**
 * تحديث أزرار التنقل بين السور
 * @param {number} currentSurahNumber - رقم السورة الحالية
 */
function updateNavigationButtons(currentSurahNumber) {
    const prevButton = document.getElementById('prev-surah');
    const nextButton = document.getElementById('next-surah');
    
    // تعطيل زر السورة السابقة إذا كانت السورة الحالية هي الفاتحة
    if (currentSurahNumber === 1) {
        prevButton.disabled = true;
        prevButton.classList.add('disabled');
    } else {
        prevButton.disabled = false;
        prevButton.classList.remove('disabled');
    }
    
    // تعطيل زر السورة التالية إذا كانت السورة الحالية هي الناس
    if (currentSurahNumber === 114) {
        nextButton.disabled = true;
        nextButton.classList.add('disabled');
    } else {
        nextButton.disabled = false;
        nextButton.classList.remove('disabled');
    }
}

/**
 * الانتقال إلى السورة السابقة
 */
function navigateToPrevSurah() {
    if (!currentSurah || currentSurah.number <= 1) return;
    
    showSurah(currentSurah.number - 1);
}

/**
 * الانتقال إلى السورة التالية
 */
function navigateToNextSurah() {
    if (!currentSurah || currentSurah.number >= 114) return;
    
    showSurah(currentSurah.number + 1);
}

/**
 * تبديل طريقة عرض القرآن (سور، أجزاء، ترتيب النزول)
 * @param {string} viewMode - وضع العرض
 */
function switchView(viewMode) {
    // تحديث الأزرار النشطة
    document.querySelectorAll('.view-options button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`view-${viewMode}`).classList.add('active');
    
    // إعادة تحميل القائمة حسب وضع العرض
    switch (viewMode) {
        case 'surah':
            displaySurahs(surahs);
            break;
        case 'juz':
            // سيتم تنفيذ هذه الوظيفة لاحقاً
            alert('سيتم إضافة عرض الأجزاء قريباً');
            document.getElementById('view-surah').classList.add('active');
            break;
        case 'revelation':
            // سيتم تنفيذ هذه الوظيفة لاحقاً
            alert('سيتم إضافة عرض ترتيب النزول قريباً');
            document.getElementById('view-surah').classList.add('active');
            break;
    }
}

/**
 * إظهار قائمة السور
 */
function showSurahsList() {
    document.getElementById('surah-view').style.display = 'none';
    document.getElementById('search-results').style.display = 'none';
    document.getElementById('surahs-list').style.display = 'grid';
}

/**
 * عرض رسالة خطأ
 * @param {string} message - نص الرسالة
 */
function showError(message) {
    alert(message);
}
