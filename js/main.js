class LanguageManager {
    constructor() {
        this.currentLang = 'hu';
        this.translations = {};
        this.init();
    }

    async init() {
        try {
            await this.loadTranslations(this.currentLang);
            this.updateContent();
            this.setupEventListeners();
            // this.updateLanguageButton(); // Temporarily disabled
            document.documentElement.lang = this.currentLang;
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    async loadTranslations(lang) {
        try {
            const response = await fetch(`translations/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.translations = await response.json();
            console.log('Translations loaded successfully');
        } catch (error) {
            console.error(`Error loading translations for ${lang}:`, error);
            throw error;
        }
    }

    async changeLanguage(lang) {
        await this.loadTranslations(lang);
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        this.updateContent();
        // this.updateLanguageButton(); // Temporarily disabled
        document.documentElement.lang = lang;
    }

    updateContent() {
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.dataset.langKey;
            let translation = this.getNestedTranslation(key);
            
            if (translation) {
                if (key === 'footer.copyright') {
                    const currentYear = new Date().getFullYear();
                    translation = translation.replace('{year}', currentYear);
                }

                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else if (element.tagName === 'IMG') {
                    element.alt = translation;
                } else {
                    element.textContent = translation;
                }
            } else {
                console.warn(`No translation found for key: ${key}`);
            }
        });
    }

    getNestedTranslation(key) {
        return key.split('.').reduce((obj, i) => obj?.[i], this.translations);
    }

    updateLanguageButton() {
        /*
        const currentLangBtn = document.querySelector('.current-language');
        if (currentLangBtn) {
            currentLangBtn.textContent = this.currentLang.toUpperCase();
        }
        */
    }

    setupEventListeners() {
        /* 
        const languageBtn = document.querySelector('.language-btn');
        const languageOptions = document.querySelector('.language-options');

        if (languageBtn && languageOptions) {
            languageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                languageOptions.classList.toggle('show');
            });

            document.addEventListener('click', () => {
                languageOptions.classList.remove('show');
            });

            document.querySelectorAll('.language-option').forEach(option => {
                option.addEventListener('click', () => {
                    const lang = option.dataset.lang;
                    this.changeLanguage(lang);
                });
            });
        }
        */
    }
}

// Theme manager class
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupThemeToggle();
        this.loadSavedTheme();
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
    }

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.classList.remove(currentTheme);
        html.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
    }
}

// Form manager class
class FormManager {
    constructor() {
        this.setupForms();
    }

    setupForms() {
        const contactForm = document.querySelector('#contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (submitButton) submitButton.disabled = true;

        try {
            if (!this.validateForm(data)) {
                // Use language manager to get translated message
                throw new Error(window.languageManager.getNestedTranslation('contact.form.messages.required'));
            }

            await this.simulateServerRequest(data);
            
            // Use language manager to get translated message
            this.showMessage('success', window.languageManager.getNestedTranslation('contact.form.messages.success'));
            form.reset();
        } catch (error) {
            console.error('Error submitting form:', error);
            // Use language manager to get translated message
            this.showMessage('error', error.message || window.languageManager.getNestedTranslation('contact.form.messages.error'));
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    }

    validateForm(data) {
        // Basic validation
        const required = ['name', 'email', 'message'];
        return required.every(field => data[field]?.trim());
    }

    async simulateServerRequest(data) {
        // Simulate server request with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return data;
    }

    showMessage(type, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type} mt-4`;
        messageDiv.textContent = message;

        const form = document.querySelector('#contact-form');
        if (form) {
            const existingMessage = form.parentNode.querySelector('.alert');
            if (existingMessage) {
                existingMessage.remove();
            }
            form.parentNode.insertBefore(messageDiv, form.nextSibling);
            setTimeout(() => messageDiv.remove(), 5000);
        }
    }
}

// Scroll manager class
class ScrollManager {
    constructor() {
        this.setupSmoothScroll();
        this.setupScrollAnimations();
        this.setupScrollHeader();
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                
                // Ha # vagy #top, akkor scroll to top
                if (targetId === '#' || targetId === '#top') {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                    return;
                }
    
                // Egyéb belső linkek kezelése
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerOffset = 76; // A fix header magassága
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px'
        });

        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            observer.observe(element);
        });
    }

    setupScrollHeader() {
        const header = document.querySelector('header');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                header?.classList.remove('scroll-up');
                return;
            }

            if (currentScroll > lastScroll && !header?.classList.contains('scroll-down')) {
                // Scrolling down
                header?.classList.remove('scroll-up');
                header?.classList.add('scroll-down');
            } else if (currentScroll < lastScroll && header?.classList.contains('scroll-down')) {
                // Scrolling up
                header?.classList.remove('scroll-down');
                header?.classList.add('scroll-up');
            }

            lastScroll = currentScroll;
        });
    }
}

// Video manager class
class VideoManager {
    constructor() {
        this.setupVideos();
    }

    setupVideos() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.play().catch(error => {
                console.log("Video autoplay failed:", error);
            });

            // Ensure video restarts when it ends
            video.addEventListener('ended', () => {
                video.play().catch(() => {});
            });

            // Pause video when not in viewport
            this.setupVideoIntersectionObserver(video);
        });
    }

    setupVideoIntersectionObserver(video) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.2 });

        observer.observe(video);
    }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.languageManager = new LanguageManager();
    window.themeManager = new ThemeManager();
    window.formManager = new FormManager();
    window.scrollManager = new ScrollManager();
    window.videoManager = new VideoManager();
});

// Handle service worker if needed
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(error => {
            console.log('ServiceWorker registration failed: ', error);
        });
    });
}

// Export for module usage if needed
export {
    LanguageManager,
    ThemeManager,
    FormManager,
    ScrollManager,
    VideoManager
};