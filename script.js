document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // DOM MANAGER
    // =========================================================================
    const DOM = {
        mainContent: document.getElementById('mainContent'),
        audio: document.getElementById('bgMusic'),
        musicBtn: document.getElementById('musicBtn'),
        musicIcon: document.getElementById('musicIcon'),
        weddingVideo: document.getElementById('bgVideo'),
        videoOverlay: document.getElementById('videoOverlay'),
        galleryViewport: document.querySelector('.gallery-viewport'),
        lightbox: document.getElementById('lightbox'),
        lightboxImg: document.getElementById('lightboxImg'),
        lightboxClose: document.getElementById('lightboxClose'),
        lightboxPrev: document.getElementById('lightboxPrev'),
        lightboxNext: document.getElementById('lightboxNext'),
        whatsappBtn: document.getElementById('whatsappBtn'),
        dropdownMenu: document.getElementById('dropdownMenu'),
        heroImage: document.querySelector('.hero-image'),
        particles: {
            hero: document.getElementById('heroParticles'),
            countdown: document.getElementById('countdownParticles'),
            rsvp: document.getElementById('rsvpParticles'),
            footer: document.getElementById('footerParticles'),
            detalles: document.getElementById('detallesParticles'),
        }
    };

    // =========================================================================
    // VIDEO MANAGER
    // =========================================================================
    const VideoManager = {
        init() {
            if (!DOM.videoOverlay || !DOM.weddingVideo) return;
            DOM.videoOverlay.style.cursor = 'pointer';
            DOM.videoOverlay.style.pointerEvents = 'auto';
            DOM.videoOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handlePlay();
            });
            DOM.weddingVideo.addEventListener('click', (e) => e.stopPropagation());
            DOM.weddingVideo.style.pointerEvents = 'auto';
        },
        handlePlay() {
            const overlay = DOM.videoOverlay;
            const video = DOM.weddingVideo;
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
            overlay.style.visibility = 'hidden';
            setTimeout(() => {
                overlay.classList.add('hidden');
                video.classList.add('active');
                video.style.opacity = '1';
                video.style.zIndex = '10';
                video.style.pointerEvents = 'auto';
                video.muted = false;
                video.volume = 1;
                video.play().catch(err => {
                    console.error('Error playing video:', err);
                    this.resetOverlay();
                });
            }, 500);
        },
        resetOverlay() {
            DOM.videoOverlay.style.opacity = '1';
            DOM.videoOverlay.style.pointerEvents = 'auto';
            DOM.videoOverlay.style.visibility = 'visible';
            DOM.videoOverlay.classList.remove('hidden');
            DOM.weddingVideo.classList.remove('active');
            DOM.weddingVideo.style.opacity = '0';
        }
    };

    // =========================================================================
    // GALLERY MANAGER
    // =========================================================================
    const GalleryManager = {
        index: 0,
        get fotos() { return window.__galleryFotos || []; },
        get items() { return window.__galleryItems || []; },
        init() {
            const container = document.getElementById('dynamic-gallery');
            if (!container) return;

            container.addEventListener('click', (e) => {
                if (GalleryCarousel._suppressClick) return;
                const item = e.target.closest('.gallery-item');
                if (!item) return;
                const idx = this.items.indexOf(item);
                if (idx !== -1) this.open(idx);
            });

            if (DOM.lightboxClose) {
                DOM.lightboxClose.addEventListener('click', () => this.close());
            }
            if (DOM.lightbox) {
                DOM.lightbox.addEventListener('click', (e) => {
                    if (e.target === DOM.lightbox) this.close();
                });
            }
            if (DOM.lightboxPrev) {
                DOM.lightboxPrev.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.goStep(-1);
                });
            }
            if (DOM.lightboxNext) {
                DOM.lightboxNext.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.goStep(1);
                });
            }
            document.addEventListener('keydown', (e) => {
                if (!this.isOpen()) return;
                if (e.key === 'Escape') {
                    this.close();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.goStep(-1);
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.goStep(1);
                }
            });
            this._bindSwipe();
        },
        isOpen() {
            return !!(DOM.lightbox && DOM.lightbox.classList.contains('active'));
        },
        open(idx) {
            if (!this.fotos.length || !DOM.lightbox || !DOM.lightboxImg) return;
            this.index = (idx + this.fotos.length) % this.fotos.length;
            const foto = this.fotos[this.index];
            DOM.lightboxImg.src = cloudSrc(foto.imageUrl, 1600);
            DOM.lightboxImg.alt = foto.name || '';
            DOM.lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        },
        goStep(step) {
            this.open(this.index + step);
        },
        close() {
            if (DOM.lightbox) {
                DOM.lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        },
        _bindSwipe() {
            if (!DOM.lightbox) return;
            let startX = null;
            DOM.lightbox.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            }, { passive: true });
            DOM.lightbox.addEventListener('touchend', (e) => {
                if (startX === null) return;
                const dx = e.changedTouches[0].clientX - startX;
                if (Math.abs(dx) > 45) this.goStep(dx < 0 ? 1 : -1);
                startX = null;
            }, { passive: true });
        }
    };

    // =========================================================================
    // COUNTDOWN MANAGER
    // =========================================================================
    const CountdownManager = {
        targetDate: new Date('2027-05-15T15:00:00').getTime(),
        els: {},
        intervalId: null,
        tickingTweens: {},
        countdownDone: false,
        init() {
            if (this.intervalId !== null) return;
            this.els = {
                days: document.getElementById('days'),
                hours: document.getElementById('hours'),
                minutes: document.getElementById('minutes'),
                seconds: document.getElementById('seconds')
            };
            this.update();
            this.intervalId = setInterval(() => this.update(), 1000);
        },
        _safeInt(value) {
            if (!Number.isFinite(value)) return 0;
            return value < 0 ? 0 : Math.floor(value);
        },
        update() {
            if (this.countdownDone) {
                this._render(0, 0, 0, 0, false);
                return;
            }
            const now = Date.now();
            const distance = this.targetDate - now;
            const days = this._safeInt(distance / 86400000);
            const hours = this._safeInt((distance % 86400000) / 3600000);
            const minutes = this._safeInt((distance % 3600000) / 60000);
            const seconds = this._safeInt((distance % 60000) / 1000);
            this._render(days, hours, minutes, seconds, false);
            if (distance <= 0) {
                this.countdownDone = true;
                this._render(0, 0, 0, 0, true);
            }
        },
        _render(days, hours, minutes, seconds, forceRender) {
            this._setValue('days', days, forceRender, false);
            this._setValue('hours', hours, forceRender, true);
            this._setValue('minutes', minutes, forceRender, true);
            this._setValue('seconds', seconds, forceRender, false);
        },
        _setValue(id, value, forceRender, animate) {
            const el = this.els[id];
            if (!el) return;
            const pad = id === 'days' ? Math.max(2, String(value).length) : 2;
            const newValue = String(value).padStart(pad, '0');
            if (!forceRender && el.textContent === newValue) return;
            if (typeof gsap !== 'undefined') {
                if (this.tickingTweens[id]) {
                    this.tickingTweens[id].kill();
                    this.tickingTweens[id] = null;
                }
            }
            if (!animate || typeof gsap === 'undefined') {
                el.textContent = newValue;
                return;
            }
            this.tickingTweens[id] = gsap.fromTo(el,
                { scale: 1 },
                {
                    scale: 1.05,
                    duration: 0.08,
                    ease: 'power1.out',
                    onComplete: () => {
                        el.textContent = newValue;
                        this.tickingTweens[id] = gsap.to(el, {
                            scale: 1,
                            duration: 0.12,
                            ease: 'power1.in',
                            onComplete: () => { this.tickingTweens[id] = null; }
                        });
                    }
                }
            );
        }
    };

    // =========================================================================
    // ANIMATION MANAGER
    // =========================================================================
    const AnimationManager = {
        init() {
            gsap.registerPlugin(ScrollTrigger);
            this.initHeroParallax();
            this.initScrollAnimations();
            this.initParticles();
        },
        initHeroParallax() {
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        const scrolled = window.pageYOffset;
                        if (DOM.heroImage && scrolled < window.innerHeight) {
                            DOM.heroImage.style.transform = 'scale(' + (1.1 + scrolled * 0.0003) + ') translateY(' + (scrolled * 0.3) + 'px)';
                        }
                        ticking = false;
                    });
                    ticking = true;
                }
            });
        },
        initParticles() {
            const isMobile = window.innerWidth < 768;
            const createParticles = (container, count, className, getStyle) => {
                if (!container) return;
                const actualCount = isMobile ? Math.ceil(count * 0.5) : count;
                const frag = document.createDocumentFragment();
                for (let i = 0; i < actualCount; i++) {
                    const p = document.createElement('div');
                    p.className = className;
                    let style = 'left:' + (Math.random() * 100) + '%;';
                    if (getStyle) style += getStyle(i);
                    p.style.cssText = style;
                    frag.appendChild(p);
                }
                container.appendChild(frag);
            };
            createParticles(DOM.particles.hero, 35, 'hero-particle');
            createParticles(DOM.particles.countdown, 25, 'section-particle');
            createParticles(DOM.particles.rsvp, 30, 'section-particle', () => 'bottom:0;animation:floatUp 8s ease-in-out infinite;animation-delay:' + (Math.random() * 8) + 's;');
            createParticles(DOM.particles.footer, 25, 'section-particle');
            createParticles(DOM.particles.detalles, 25, 'section-particle');
        },
        initScrollAnimations() {
            gsap.from('.deco-line', {
                scrollTrigger: { trigger: '.opening', start: 'top 80%', toggleActions: 'play none none reverse' },
                opacity: 0, scale: 0, duration: 1, ease: 'back.out(1.7)'
            });
            gsap.from('.opening-text', {
                scrollTrigger: { trigger: '.opening', start: 'top 75%', toggleActions: 'play none none reverse' },
                opacity: 0, y: 60, duration: 1, delay: 0.2
            });
            gsap.from('.names-line', {
                scrollTrigger: { trigger: '.opening', start: 'top 70%', toggleActions: 'play none none reverse' },
                opacity: 0, y: 40, duration: 1, delay: 0.4
            });
            gsap.from('.count-box', {
                scrollTrigger: { trigger: '.countdown', start: 'top 80%', toggleActions: 'play none none reverse' },
                opacity: 0, y: 50, scale: 0.8, duration: 0.8, stagger: 0.15, ease: 'back.out(1.4)'
            });
            gsap.from('.gallery-viewport', {
                scrollTrigger: { trigger: '.gallery', start: 'top 80%', toggleActions: 'play none none reverse' },
                opacity: 0, y: 60, duration: 0.8
            });
            gsap.from('.detalle-card', {
                scrollTrigger: { trigger: '.detalles', start: 'top 80%' },
                opacity: 0, y: 50, duration: 0.8, stagger: 0.2
            });
            if (document.querySelector('.regalos')) {
                gsap.from('.regalos .regalo-card', {
                    scrollTrigger: { trigger: '.regalos', start: 'top 80%', toggleActions: 'play none none reverse' },
                    opacity: 0, scale: 0.8, y: 50, duration: 1, ease: 'back.out(1.4)'
                });
            }
            gsap.from('.rsvp-icon', {
                scrollTrigger: { trigger: '.rsvp', start: 'top 75%', toggleActions: 'play none none reverse' },
                opacity: 0, scale: 0, duration: 0.8, ease: 'back.out(1.7)'
            });
            gsap.from('.rsvp-question', {
                scrollTrigger: { trigger: '.rsvp', start: 'top 70%', toggleActions: 'play none none reverse' },
                opacity: 0, y: 80, duration: 1.2, delay: 0.2
            });
            gsap.from('.rsvp-text', {
                scrollTrigger: { trigger: '.rsvp', start: 'top 60%', toggleActions: 'play none none reverse' },
                opacity: 0, y: 40, duration: 0.8, delay: 0.4
            });
            gsap.from('.rsvp-btn', {
                scrollTrigger: { trigger: '.rsvp', start: 'top 55%', toggleActions: 'play none none reverse' },
                opacity: 0, y: 30, scale: 0.9, duration: 0.8, delay: 0.5, ease: 'back.out(1.4)'
            });
            gsap.from('.float-btns', {
                opacity: 0, x: 100, duration: 1, delay: 0.5
            });
        }
    };

    // =========================================================================
    // UI EFFECTS MANAGER
    // =========================================================================
    const UIEffects = {
        init() {
            this.initWhatsAppDropdown();
            this.initMagneticButtons();
            this.initCardTilt();
            this.initCursorGlow();
            this.initSmoothScroll();
        },
        initWhatsAppDropdown() {
            if (!DOM.whatsappBtn || !DOM.dropdownMenu) return;
            DOM.whatsappBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                DOM.dropdownMenu.classList.toggle('active');
            });
            document.addEventListener('click', (e) => {
                if (!DOM.whatsappBtn.contains(e.target) && !DOM.dropdownMenu.contains(e.target)) {
                    DOM.dropdownMenu.classList.remove('active');
                }
            });
        },
        initMagneticButtons() {
            const btns = document.querySelectorAll('.rsvp-btn, .hero-btn, .detail-btn');
            btns.forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    gsap.to(btn, { x: x * 0.15, y: y * 0.15, duration: 0.3 });
                });
                btn.addEventListener('mouseleave', () => {
                    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
                });
            });
        },
        initCardTilt() {
            const cards = document.querySelectorAll('.detail-card, .parent-card');
            cards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    gsap.to(card, {
                        rotateY: (rect.width / 2 - x) / 25,
                        rotateX: (y - rect.height / 2) / 25,
                        duration: 0.3
                    });
                });
                card.addEventListener('mouseleave', () => {
                    gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
                });
            });
        },
        initCursorGlow() {
            const glow = document.createElement('div');
            glow.style.cssText =
                'position: fixed; ' +
                'width: 500px; ' +
                'height: 500px; ' +
                'background: radial-gradient(circle, rgba(135, 206, 235, 0.08) 0%, transparent 70%); ' +
                'pointer-events: none; ' +
                'z-index: 9999; ' +
                'transform: translate(-50%, -50%); ' +
                'opacity: 0; ' +
                'transition: opacity 0.3s;';
            document.body.appendChild(glow);
            document.addEventListener('mousemove', (e) => {
                glow.style.left = e.clientX + 'px';
                glow.style.top = e.clientY + 'px';
                glow.style.opacity = '1';
            });
            document.addEventListener('mouseleave', () => glow.style.opacity = '0');
        },
        initSmoothScroll() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            });
        }
    };

    // =========================================================================
    // VISUAL ENHANCER
    // =========================================================================
    const VisualEnhancer = {
        init() {
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            this.initScrollReveal();
            this.initSparkles();
        },
        initScrollReveal() {
            const targets = [
                '.opening-inner',
                '.countdown-grid',
                '.detalles-grid',
                '.vestimenta-grid',
                '.video-wrapper',
                '.regalo-card',
                '.regalos .regalo-card',
                '.precio-tarjeta .regalo-card',
                '.rsvp-box',
                '.parents-grid',
                '.historia-timeline'
            ];
            targets.forEach(selector => {
                const els = document.querySelectorAll(selector);
                for (let i = 0; i < els.length; i++) {
                    const el = els[i];
                    if (!el.classList.contains('reveal-up') && !el.classList.contains('reveal-scale')) {
                        el.classList.add('reveal-up');
                    }
                }
            });
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
            document.querySelectorAll('.reveal-up, .reveal-scale').forEach(el => observer.observe(el));
        },
        initSparkles() {
            const containers = document.querySelectorAll('.section-title.light, .regalo-icon, .rsvp-icon, .deco-line i, .hero-names, .footer-title');
            containers.forEach(container => {
                const ring = document.createElement('div');
                ring.className = 'sparkle-ring';
                ring.style.cssText = 'position:absolute;inset:-20px;pointer-events:none;z-index:0;overflow:visible;';
                const count = 4 + Math.floor(Math.random() * 3);
                for (let i = 0; i < count; i++) {
                    const dot = document.createElement('div');
                    dot.className = 'sparkle-dot';
                    const size = 3 + Math.random() * 4;
                    const angle = (i / count) * 360;
                    const dist = 20 + Math.random() * 25;
                    const delay = Math.random() * 2;
                    const colors = ['#fff', '#87CEEB', '#f7e5a4', '#ffb6c1', '#d4a64d'];
                    const color = colors[i % colors.length];
                    dot.style.cssText =
                        'width:' + size + 'px;height:' + size + 'px;' +
                        'left:calc(50% + ' + (Math.cos(angle * Math.PI / 180) * dist) + 'px);' +
                        'top:calc(50% + ' + (Math.sin(angle * Math.PI / 180) * dist) + 'px);' +
                        'background:' + color + ';' +
                        'box-shadow:0 0 ' + (size + 4) + 'px ' + color + ', 0 0 ' + (size + 10) + 'px rgba(135,206,235,0.4);' +
                        'animation-delay:' + delay + 's;' +
                        'animation-duration:' + (2 + Math.random() * 2) + 's;';
                    ring.appendChild(dot);
                }
                if (getComputedStyle(container).position === 'static') {
                    container.style.position = 'relative';
                }
                container.appendChild(ring);
            });
        }
    };

    // =========================================================================
    // ADVERTISING RAIL
    // =========================================================================
    const AdsManager = {
        ads: [
            { id: 'sample-1', image: '', imageFallback: '♥', tag: 'Oferta', title: 'Ahorra más en tus compras', url: '#', target: '_blank' },
            { id: 'sample-2', image: '', imageFallback: '✦', tag: 'Recomendado', title: 'Tu luna de miel', url: '#', target: '_blank' }
        ],
        init() {
            const section = document.getElementById('adsSection');
            const list = document.getElementById('adsTrack');
            if (!section || !list) return;
            if (!this.ads || this.ads.length === 0) {
                section.style.display = 'none';
                return;
            }
            this.renderCards(list);
        },
        renderCards(container) {
            container.innerHTML = '';
            this.ads.forEach((ad) => {
                const card = document.createElement('a');
                card.className = 'ads-card';
                card.href = ad.url || '#';
                card.target = ad.target || '_blank';
                card.rel = card.target === '_blank' ? 'noopener noreferrer' : '';
                card.setAttribute('aria-label', ad.title || 'Publicidad');
                const thumbHTML = ad.image
                    ? '<img src="' + ad.image + '" alt="" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';">' +
                      '<span class="ads-thumb-fallback" style="display:none;">' + (ad.imageFallback || '★') + '</span>'
                    : '<span class="ads-thumb-fallback">' + (ad.imageFallback || '★') + '</span>';
                card.innerHTML =
                    '<div class="ads-thumb" aria-hidden="true">' + thumbHTML + '</div>' +
                    '<div class="ads-content">' +
                    (ad.tag ? '<span class="ads-tag">' + ad.tag + '</span>' : '') +
                    '<h3 class="ads-title">' + (ad.title || '') + '</h3>' +
                    '</div>' +
                    '<i class="fas fa-chevron-right ads-arrow" aria-hidden="true"></i>';
                container.appendChild(card);
            });
        }
    };

    // =========================================================================
    // APP CONTROLLER
    // =========================================================================
    const App = {
        init() {
            if (!DOM.mainContent) return;
            DOM.mainContent.style.display = 'block';
            DOM.mainContent.style.opacity = '0';
            gsap.to(DOM.mainContent, {
                opacity: 1,
                duration: 1,
                onComplete: () => this.startModules()
            });
        },
        startModules() {
            VideoManager.init();
            GalleryManager.init();
            CountdownManager.init();
            AnimationManager.init();
            UIEffects.init();
            VisualEnhancer.init();
            AdsManager.init();
            console.log('Wedding App: All modules initialized successfully.');
        }
    };

    App.init();
});

// =========================================================================
// CLOUDINARY — URL optimizada
// =========================================================================
// Inserta transformaciones (f_auto, q_auto, w_) en URLs de res.cloudinary.com
// para servir WebP/AVIF redimensionado en lugar del original.
function cloudSrc(url, width) {
    if (!url || url.indexOf('/image/upload/') === -1) return url;
    return url.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_' + width + '/');
}

// =========================================================================
// CARRUSEL DE GALERÍA — Viewport/Track + swipe/drag + dots
// =========================================================================
const GalleryCarousel = {
    fotos: [],
    items: [],
    track: null,
    viewportEl: null,
    prevBtn: null,
    nextBtn: null,
    dotsWrap: null,
    page: 0,
    _suppressClick: false,
    _drag: null,
    _resizeRaf: null,

    _perPage() {
        const w = window.innerWidth;
        if (w <= 768) return 1;
        if (w <= 992) return 2;
        return 3;
    },

    _pages() {
        return Math.max(1, Math.ceil(this.fotos.length / this._perPage()));
    },

    init(fotos) {
        this.fotos = Array.isArray(fotos) ? fotos : [];
        this.track = document.getElementById('dynamic-gallery');
        this.viewportEl = document.querySelector('.gallery-viewport');
        this.prevBtn = document.getElementById('galleryPrev');
        this.nextBtn = document.getElementById('galleryNext');
        this.dotsWrap = document.getElementById('galleryDots');
        if (!this.track) return;

        this._renderTrack();
        this._refresh();
        this._bind();

        window.__galleryFotos = this.fotos;
        window.__galleryItems = this.items;
    },

    _renderTrack() {
        const frag = document.createDocumentFragment();
        const items = [];
        this.fotos.forEach((foto) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';

            const img = document.createElement('img');
            img.src = cloudSrc(foto.imageUrl, 800);
            img.alt = foto.name;
            img.loading = 'lazy';
            img.decoding = 'async';
            img.addEventListener('load', function () {
                img.classList.add('loaded');
            });
            img.addEventListener('error', function () {
                img.classList.add('loaded');
            });
            item.appendChild(img);

            const overlay = document.createElement('div');
            overlay.className = 'gallery-overlay';
            overlay.innerHTML = '<i class="fas fa-expand"></i>';
            item.appendChild(overlay);

            frag.appendChild(item);
            items.push(item);
        });
        this.track.innerHTML = '';
        this.track.appendChild(frag);
        this.items = items;
    },

    _setTransform() {
        if (!this.track) return;
        this.track.style.transform = 'translateX(' + (-this.page * 100) + '%)';
    },

    _refresh() {
        this.page = Math.min(this.page, this._pages() - 1);
        this._setTransform();
        this._renderDots();
        this._updateArrows();
    },

    _go(index) {
        const next = Math.max(0, Math.min(index, this._pages() - 1));
        if (next === this.page) return;
        this.page = next;
        this._refresh();
    },

    _renderDots() {
        if (!this.dotsWrap) return;
        const pages = this._pages();
        this.dotsWrap.innerHTML = '';
        for (let i = 0; i < pages; i++) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'gallery-dot' + (i === this.page ? ' active' : '');
            dot.setAttribute('aria-label', 'Ir a la página ' + (i + 1));
            dot.setAttribute('aria-current', i === this.page ? 'true' : 'false');
            dot.addEventListener('click', () => this._go(i));
            this.dotsWrap.appendChild(dot);
        }
    },

    _updateArrows() {
        if (this.prevBtn) this.prevBtn.disabled = this.page <= 0;
        if (this.nextBtn) this.nextBtn.disabled = this.page >= this._pages() - 1;
    },

    _bind() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this._go(this.page - 1));
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this._go(this.page + 1));
        }
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            if (this._lightboxOpen()) return;
            if (e.target && e.target.closest && e.target.closest('.gallery-carousel')) {
                e.preventDefault();
                this._go(e.key === 'ArrowLeft' ? this.page - 1 : this.page + 1);
            }
        });
        if (this.viewportEl) this._bindPointer(this.viewportEl);
        if (this._resizeRaf) cancelAnimationFrame(this._resizeRaf);
        window.addEventListener('resize', () => {
            if (this._resizeRaf) cancelAnimationFrame(this._resizeRaf);
            this._resizeRaf = requestAnimationFrame(() => {
                this._resizeRaf = null;
                this._refresh();
            });
        });
    },

    _lightboxOpen() {
        const lb = document.getElementById('lightbox');
        return !!(lb && lb.classList.contains('active'));
    },

    _bindPointer(vp) {
        vp.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            this._drag = { id: e.pointerId, x: e.clientX, page: this.page, active: false };
            if (vp.setPointerCapture) {
                try { vp.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
            }
        });
        vp.addEventListener('pointermove', (e) => {
            if (!this._drag || e.pointerId !== this._drag.id) return;
            const dx = e.clientX - this._drag.x;
            if (!this._drag.active && Math.abs(dx) > 6) {
                this._drag.active = true;
                if (this.track) this.track.classList.add('dragging');
            }
            if (!this._drag.active) return;
            const vpW = vp.clientWidth || 1;
            const offPct = (dx / vpW) * 100;
            this.track.style.transform =
                'translateX(' + (-this._drag.page * 100 + offPct) + '%)';
        });
        const endDrag = (e) => {
            if (!this._drag || e.pointerId !== this._drag.id) return;
            const wasActive = this._drag.active;
            const dx = e.clientX - this._drag.x;
            const vpW = vp.clientWidth || 1;
            let target = this._drag.page;
            if (dx < -vpW * 0.15) target = this._drag.page + 1;
            else if (dx > vpW * 0.15) target = this._drag.page - 1;
            if (wasActive) this._suppressClick = true;
            if (this.track) this.track.classList.remove('dragging');
            this._drag = null;
            this.page = Math.max(0, Math.min(target, this._pages() - 1));
            this._refresh();
            window.setTimeout(() => { this._suppressClick = false; }, 150);
        };
        vp.addEventListener('pointerup', endDrag);
        vp.addEventListener('pointercancel', endDrag);
    }
};

async function cargarGaleria() {
    try {
        const response = await fetch('datos_fotos.json');
        if (!response.ok) throw new Error('No se pudo cargar el archivo JSON');
        const fotos = await response.json();
        GalleryCarousel.init(fotos);
    } catch (error) {
        console.error('Error cargando la galería:', error);
    }
}

window.addEventListener('DOMContentLoaded', cargarGaleria);
