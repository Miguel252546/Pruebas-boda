class AppController {
    constructor() {
        this.eventBus = new EventBus();
        this.audioManager = new AudioManager(this.eventBus);
        this.openingEngine = null;
    }

    init() {
        this.audioManager.init();
        this._initOpening();
    }

    _initOpening() {
        this.openingEngine = new OpeningEngine({
            eventBus: this.eventBus,
            audioManager: this.audioManager
        });
        this.openingEngine.init();
        window.__openingEngine = this.openingEngine;
    }
}