class CanvasRenderer {
    constructor(perf, ac) {
        this.perf = perf;
        this.ac = ac;
        this.skyCanvas = document.getElementById('pokeSky');
        this.heartsCanvas = document.getElementById('pokeHearts');
        this.skyCtx = this.skyCanvas ? this.skyCanvas.getContext('2d') : null;
        this.heartsCtx = this.heartsCanvas ? this.heartsCanvas.getContext('2d') : null;

        this.skyW = 0; this.skyH = 0;
        this.heartsW = 0; this.heartsH = 0;
        this.stars = [];
        this.hearts = [];
        this.skyGradients = [];
        this._animatorId = null;
        this._spawnId = null;
        this._boundResize = this._onResize.bind(this);
    }

    init() {
        if (!this.skyCtx || !this.heartsCtx) return;
        this._resize();
        window.addEventListener('resize', this._boundResize);
        window.addEventListener('orientationchange', () => setTimeout(() => this._resize(), 300));
        this._animatorId = this.ac.registerAnimator((now) => {
            this._drawSky(now);
            this._drawHearts(now);
        });
        this._spawnId = this.ac.setInterval(() => this._spawnHeart(), 360);
    }

    destroy() {
        window.removeEventListener('resize', this._boundResize);
        if (this._animatorId !== null) this.ac.unregisterAnimator(this._animatorId);
        if (this._spawnId !== null) this.ac.clearInterval(this._spawnId);
        this.stars = [];
        this.hearts = [];
        this.skyGradients = [];
    }

    _buildGradients() {
        this.skyGradients = [
            [this.skyW * 0.35, this.skyH * 0.38, this.skyW * 0.52, 0.14, 290],
            [this.skyW * 0.68, this.skyH * 0.58, this.skyW * 0.42, 0.10, 345],
            [this.skyW * 0.5,  this.skyH * 0.5,  this.skyW * 0.3,  0.06, 42]
        ];
    }

    _resize() {
        this.skyW = this.skyCanvas.width = window.innerWidth;
        this.skyH = this.skyCanvas.height = window.innerHeight;
        this.heartsW = this.heartsCanvas.width = window.innerWidth;
        this.heartsH = this.heartsCanvas.height = window.innerHeight;
        this._buildGradients();
        const cnt = this.perf.canvasStarCount;
        this.stars = [];
        for (let i = 0; i < cnt; i++) {
            this.stars.push({
                x: Math.random() * this.skyW,
                y: Math.random() * this.skyH,
                r: Math.random() * 1.5 + 0.15,
                a: Math.random(),
                da: (Math.random() - 0.5) * 0.006,
                h: [350, 42, 210, 270][Math.floor(Math.random() * 4)]
            });
        }
    }

    _onResize() {
        this.perf.refresh();
        this._resize();
    }

    _drawSky() {
        if (!this.skyCtx) return;
        const ctx = this.skyCtx;
        ctx.clearRect(0, 0, this.skyW, this.skyH);
        const gds = this.skyGradients;
        for (let i = 0; i < gds.length; i++) {
            const gd = gds[i];
            const g = ctx.createRadialGradient(gd[0], gd[1], 0, gd[0], gd[1], gd[2]);
            g.addColorStop(0, `hsla(${gd[4]}, 65%, 38%, ${gd[3]})`);
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, this.skyW, this.skyH);
        }
        const stars = this.stars;
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            s.a += s.da;
            if (s.a > 1) { s.a = 1; s.da *= -1; }
            else if (s.a < 0) { s.a = 0; s.da *= -1; }
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${s.h}, 72%, 90%, ${s.a})`;
            ctx.fill();
        }
    }

    _spawnHeart() {
        if (this.hearts.length > 24) return;
        const isHeart = Math.random() > 0.42;
        this.hearts.push({
            x: Math.random() * this.heartsW,
            y: this.heartsH + 16,
            sz: Math.random() * 11 + 4,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -(Math.random() * 0.4 + 0.17),
            rot: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.014,
            a: Math.random() * 0.27 + 0.06,
            isHeart: isHeart,
            hue: isHeart ? 336 + Math.random() * 20 : 34 + Math.random() * 18
        });
    }

    _drawHearts(now) {
        if (!this.heartsCtx) return;
        const ctx = this.heartsCtx;
        ctx.clearRect(0, 0, this.heartsW, this.heartsH);
        const time = now || performance.now();
        const sway = Math.sin(time * 0.0007) * 0.26;
        this.hearts = this.hearts.filter(p => p.y > -40);
        for (let i = 0; i < this.hearts.length; i++) {
            const p = this.hearts[i];
            p.x += p.vx + sway;
            p.y += p.vy;
            p.rot += p.vr;
            ctx.save();
            ctx.globalAlpha = p.a;
            if (p.isHeart) {
                ctx.fillStyle = `hsl(${p.hue}, 78%, 65%)`;
                ctx.translate(p.x, p.y);
                ctx.beginPath();
                ctx.moveTo(0, -6);
                ctx.bezierCurveTo(0, -10, -7, -10, -7, -4);
                ctx.bezierCurveTo(-7, 0, 0, 5, 0, 9);
                ctx.bezierCurveTo(0, 5, 7, 0, 7, -4);
                ctx.bezierCurveTo(7, -10, 0, -10, 0, -6);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillStyle = `hsl(${p.hue}, 65%, 68%)`;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.sz * 0.28, p.sz, 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }
}