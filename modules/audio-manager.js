class AudioManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.audio = document.getElementById('bgMusic');
        this.isPlaying = false;
        this.pokeBtn = document.getElementById('pokeMusicBtn');
        this.musicBtn = document.getElementById('musicBtn');
        this.musicIcon = document.getElementById('musicIcon');
        this._boundClickPoke = this._onPokeClick.bind(this);
        this._boundClickMusic = this._onMusicClick.bind(this);
        this._boundVis = this._onVisibilityChange.bind(this);
        this._unsubPlayReq = null;
        this._openingConnected = false;
    }

    // Permanent global setup — called once by AppController
    init() {
        if (!this.audio) return;
        this.audio.volume = 0.25;

        if (this.musicBtn) {
            this.musicBtn.addEventListener('click', this._boundClickMusic);
        }

        document.addEventListener('visibilitychange', this._boundVis);

        this._unsubPlayReq = this.eventBus?.on('audio:play-request', () => this.play());
    }

    // Opening-specific controls — connected/disconnected by OpeningEngine
    connectOpeningControls() {
        if (this._openingConnected) return;
        if (this.pokeBtn) {
            this.pokeBtn.addEventListener('click', this._boundClickPoke);
        }
        this._openingConnected = true;
    }

    disconnectOpeningControls() {
        if (!this._openingConnected) return;
        if (this.pokeBtn) {
            this.pokeBtn.removeEventListener('click', this._boundClickPoke);
        }
        this._openingConnected = false;
    }

    play() {
        if (this.isPlaying) return;
        this.audio.play().then(() => this._setState(true)).catch(() => {});
    }

    pause() {
        if (!this.isPlaying) return;
        this.audio.pause();
        this._setState(false);
    }

    toggle() {
        this.isPlaying ? this.pause() : this.play();
    }

    // No destroy() — permanent global service

    _setState(playing) {
        this.isPlaying = playing;
        if (this.pokeBtn) {
            this.pokeBtn.classList.toggle('playing', playing);
            this.pokeBtn.setAttribute('data-tip', playing ? 'Pausar' : 'Música');
        }
        if (this.musicBtn) {
            this.musicBtn.classList.toggle('playing', playing);
        }
        if (this.musicIcon) {
            this.musicIcon.className = playing ? 'fas fa-volume-up' : 'fas fa-music';
        }
        this.eventBus?.emit(playing ? 'audio:play' : 'audio:pause');
    }

    _onPokeClick(e) {
        e.stopPropagation();
        this.toggle();
    }

    _onMusicClick(e) {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
    }

    _onVisibilityChange() {
        if (document.hidden) this.pause();
    }
}