class OpeningEngine {
    constructor({ eventBus, audioManager }) {
        this.opening = document.getElementById('pokeOpening');
        this.stage = document.getElementById('pokeStage');
        this.pokeballWrap = document.getElementById('pokeBallWrap');
        this.pbScene = document.getElementById('pbScene');
        this.ringScene = document.getElementById('ringScene');
        this.pokeRing = document.getElementById('pokeRing');
        this.proposal = document.getElementById('pokeProposal');
        this.flash = document.getElementById('pokeFlash');
        this.lightLines = document.getElementById('pokeLightLines');
        this.hero = document.querySelector('.hero');
        this.yesBtn = document.getElementById('pokeYesBtn');

        this.eventBus = eventBus;
        this.audioManager = audioManager;

        this.state = 'IDLE';
        this._boundPokeballClick = this._onPokeballClick.bind(this);
        this._boundConfirmClick = this._onConfirmClick.bind(this);
        this._boundPreventTouch = this._onPreventTouch.bind(this);
        this._savedScrollY = -1;
    }

    init() {
        if (!this.opening) return;
        this.state = 'INIT';

        this.perf = new PerformanceManager();
        this.ac = new AnimationController(this.eventBus);
        this.canvas = new CanvasRenderer(this.perf, this.ac);
        this.particles = new ParticleEngine(this.perf, this.ac);

        this.canvas.init();
        this._initParticles();

        this.audioManager.connectOpeningControls();

        if (this.pokeballWrap) {
            this.pokeballWrap.addEventListener('click', this._boundPokeballClick);
        }
        if (this.yesBtn) {
            this.yesBtn.addEventListener('click', this._boundConfirmClick);
        }

        this.state = 'READY';

        this._lockScroll();
    }

    destroy() {
        this.canvas.destroy();
        this.particles.destroy();
        this.ac.destroy();

        this.audioManager.disconnectOpeningControls();

        if (this.pokeballWrap) {
            this.pokeballWrap.removeEventListener('click', this._boundPokeballClick);
        }
        if (this.yesBtn) {
            this.yesBtn.removeEventListener('click', this._boundConfirmClick);
        }

        this.state = 'DESTROYED';
    }

    _initParticles() {
        if (this.perf.reducedMotion) return;

        const pokeStars = document.getElementById('pokeStars');
        const pokeBokeh = document.getElementById('pokeBokeh');
        const pokeHeartsUp = document.getElementById('pokeHeartsUp');
        const pokeOrbit = document.getElementById('pokeOrbit');
        const pLayer = document.getElementById('pokePLayer');
        const bgLayer = document.getElementById('pokeBgLayer');

        // Stars
        if (pokeStars) {
            this.particles.createGroup('stars', {
                container: pokeStars,
                count: this.perf.starCount,
                pauseOnHidden: true,
                createElement: ParticleEngine.createStar
            });
        }

        // Bokeh
        if (pokeBokeh) {
            this.particles.createGroup('bokeh', {
                container: pokeBokeh,
                count: this.perf.bokehCount,
                pauseOnHidden: true,
                createElement: ParticleEngine.createBokehDot
            });
        }

        // Petals / Hearts rising
        if (pokeHeartsUp) {
            this.particles.createGroup('petals', {
                container: pokeHeartsUp,
                count: this.perf.petalCount,
                pauseOnHidden: true,
                createElement: ParticleEngine.createPetal
            });
        }

        // Orbit particles
        if (pokeOrbit) {
            this.particles.createGroup('orbit', {
                container: pokeOrbit,
                count: this.perf.orbitCount,
                pauseOnHidden: true,
                createElement: ParticleEngine.createOrbitDot
            });
        }

        // Pokeball particles (around the pokeball)
        if (pLayer) {
            this.particles.createGroup('pokeball-particles', {
                container: pLayer,
                count: this.perf.pokeballParticleCount,
                pauseOnHidden: false,
                createElement: ParticleEngine.createPokeballParticle
            });
        }

        // Floating background pokeballs
        if (bgLayer) {
            const ballTypes = [
                ['#cc2010', '#111', '#f2ede8', '#cc2010'],
                ['#1848c8', '#111', '#f2ede8', '#cc2010'],
                ['#f0c800', '#111', '#f2ede8', '#1a1a1a'],
                ['#9020c0', '#111', '#f2ede8', '#e040e0'],
                ['#388020', '#111', '#d8c870', '#c89000'],
                ['#e860a0', '#f0b0c0', '#f0f0f0', '#e860a0'],
                ['#0098c0', '#0070a0', '#e8f0f8', '#0098c0'],
                ['#78b020', '#a8c840', '#f0ece0', '#78b020'],
            ];
            const ballPos = [
                {l: '5%', t: '110%'}, {l: '85%', t: '110%'}, {l: '25%', t: '105%'}, {l: '65%', t: '108%'},
                {l: '10%', t: '105%'}, {l: '90%', t: '105%'}, {l: '45%', t: '112%'}, {l: '55%', t: '110%'},
                {l: '3%', t: '108%'}, {l: '95%', t: '112%'}, {l: '20%', t: '106%'}, {l: '75%', t: '109%'},
                {l: '35%', t: '111%'}, {l: '60%', t: '107%'}, {l: '50%', t: '105%'}, {l: '15%', t: '110%'},
                {l: '80%', t: '106%'}, {l: '40%', t: '108%'}, {l: '70%', t: '111%'}, {l: '30%', t: '109%'},
            ];
            this.particles.createGroup('bg-balls', {
                container: bgLayer,
                count: this.perf.bgBallCount,
                pauseOnHidden: true,
                createElement: (i) => ParticleEngine.createFloatingPokeball(i, ballTypes, ballPos)
            });
        }
    }

    _lockScroll() {
        this._savedScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        if (typeof window.ontouchstart !== 'undefined' || navigator.maxTouchPoints > 0) {
            document.addEventListener('touchmove', this._boundPreventTouch, { capture: true, passive: false });
        }
    }

    _unlockScroll() {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.removeEventListener('touchmove', this._boundPreventTouch, { capture: true });
        if (this._savedScrollY > 0) window.scrollTo(0, this._savedScrollY);
        this._savedScrollY = -1;
    }

    _onPreventTouch(e) {
        e.preventDefault();
    }

    _onPokeballClick() {
        if (this.state !== 'READY') return;
        this.state = 'POKEBALL_OPENING';
        this.eventBus.emit('pokeball:click');

        if (this.stage) this.stage.classList.add('opened');
        if (this.pokeballWrap) this.pokeballWrap.classList.add('opened');
        this.eventBus.emit('audio:play-request');

        this.ac.setTimeout(() => {
            this.state = 'RING_ENTRANCE';
            this._animateRingEntrance();
        }, 350);

        this.ac.setTimeout(() => {
            this.state = 'PROPOSAL_SHOWN';
            if (this.proposal) this.proposal.classList.add('show');
        }, 1200);
    }

    _animateRingEntrance() {
        if (this.pbScene) this.pbScene.style.opacity = '0';
        if (this.ringScene) this.ringScene.classList.add('show');

        this.ac.setTimeout(() => {
            if (this.pokeRing) this.pokeRing.classList.add('show');
        }, 700);
    }

    _onConfirmClick() {
        if (this.state !== 'PROPOSAL_SHOWN') return;
        this.state = 'CLOSING';
        this.eventBus.emit('confirm:click');

        if (this.lightLines) this.lightLines.classList.add('active');
        if (this.flash) this.flash.classList.add('go');
        if (this.opening) {
            this.opening.style.transition = 'opacity 0.3s ease';
            this.opening.style.opacity = '0';
        }

        this.ac.setTimeout(() => {
            if (this.flash) this.flash.classList.remove('go');
            if (this.lightLines) this.lightLines.classList.remove('active');
            if (this.opening) this.opening.style.display = 'none';
            this._unlockScroll();
            if (this.hero) this.hero.classList.add('animate-in');

            this.ac.setTimeout(() => {
                if (this.hero) {
                    this.hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                this.state = 'CLOSED';
                this.eventBus.emit('opening:closed');
                this.destroy();
            }, 200);
        }, 700);
    }
}