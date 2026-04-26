(function() {
    function initTranslatorDOM() {
        // Inject the translate div if it doesn't exist
        if (!document.getElementById('google_translate_element')) {
            const div = document.createElement('div');
            div.id = 'google_translate_element';
            div.style.cssText = "opacity:0; position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden;"; // Hidden safely!
            document.body.appendChild(div);
        }

        // Add necessary css to hide Google Translate top frame and tooltips
        const styleObj = document.createElement('style');
        styleObj.innerHTML = `
            body { top: 0px !important; position: static !important; }
            .skiptranslate iframe, .goog-te-banner-frame { display: none !important; } 
            .goog-tooltip { display: none !important; }
            .goog-tooltip:hover { display: none !important; }
            .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
        `;
        document.head.appendChild(styleObj);

        // Load Google Translate script natively
        const script = document.createElement('script');
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.head.appendChild(script);

        // On page load, highlight the correct language button if it exists
        const lang = localStorage.getItem("user_lang") || 'en';
        const btns = document.querySelectorAll('.lang-btn');
        btns.forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.style.background = '#0c2340';
                btn.style.color = '#ffffff';
            } else {
                btn.style.background = 'rgba(255, 255, 255, 0.2)';
                btn.style.color = 'var(--primary, #0c2340)';
            }
        });
    }

    // Provide the init script globally
    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,hi,te',
            autoDisplay: false
        }, 'google_translate_element');
        
        // Polling to translate on load automatically
        const targetLang = localStorage.getItem("user_lang");
        if (targetLang && targetLang !== 'en') {
            setTimeout(() => triggerTranslation(targetLang), 1000); // Wait 1s for safety
        }
    };

    function triggerTranslation(lang) {
        const selectElement = document.querySelector('.goog-te-combo');
        if (selectElement) {
            console.log("Translator: Changing language to", lang);
            selectElement.value = lang;
            
            // Standardizing the event dispatch for strict browsers
            let event = document.createEvent("HTMLEvents");
            event.initEvent("change", true, true);
            selectElement.dispatchEvent(event);
        } else {
            console.log("Translator: Waiting for Google combo box...");
            setTimeout(() => triggerTranslation(lang), 500);
        }
    }

    // Make language setter available globally immediately
    window.setLanguage = function(lang) {
        // Save choice in localStorage
        localStorage.setItem("user_lang", lang);

        if (lang === 'en') {
            // Reverting to English requires clearing the translation memory completely
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname + ";";
            location.reload();
            return;
        } else {
            // Force cookie for auto-translation on next page
            document.cookie = `googtrans=/en/${lang}; path=/;`;
            document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname};`;
            triggerTranslation(lang);
        }

        // Update button styles instantly when clicked
        const btns = document.querySelectorAll('.lang-btn');
        btns.forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.style.background = '#0c2340';
                btn.style.color = '#ffffff';
            } else {
                btn.style.background = 'rgba(255, 255, 255, 0.2)';
                btn.style.color = 'var(--primary, #0c2340)';
            }
        });
    };

    // Safely execute DOM manipulation only after DOM is completely ready!
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTranslatorDOM);
    } else {
        initTranslatorDOM();
    }
})();
