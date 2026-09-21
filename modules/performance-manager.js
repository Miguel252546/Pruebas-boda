class PerformanceManager {
    constructor() {
        this.refresh();
        this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.dpr = window.devicePixelRatio || 1;

        this.canvasStarCount = this.isMobile ? 60 : 150;
        this.starCount = this.isSmall ? 28 : (this.isMobile ? 50 : 90);
        this.bokehCount = this.isSmall ? 8 : (this.isMobile ? 14 : 22);
        this.petalCount = this.isSmall ? 10 : (this.isMobile ? 18 : 28);
        this.orbitCount = this.isSmall ? 6 : (this.isMobile ? 8 : 12);
        this.rayCount = this.isSmall ? 0 : (this.isMobile ? 2 : 4);
        this.bgBallCount = this.isSmall ? 6 : (this.isMobile ? 12 : 20);
        this.pokeballParticleCount = 30;
    }

    refresh() {
        this.innerWidth = window.innerWidth;
        this.innerHeight = window.innerHeight;
        this.isMobile = this.innerWidth < 768;
        this.isSmall = this.innerWidth < 480;
    }
}