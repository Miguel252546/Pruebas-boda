class ParticleEngine {
    constructor(perf, ac) {
        this.perf = perf;
        this.ac = ac;
        this._groups = new Map();
        this._unsubscribePause = null;
        this._unsubscribeResume = null;
    }

    createGroup(name, config) {
        const container = typeof config.container === 'string'
            ? document.getElementById(config.container)
            : config.container;
        if (!container) return null;

        const count = config.count || 0;
        const elements = [];
        const frag = document.createDocumentFragment();

        for (let i = 0; i < count; i++) {
            const el = config.createElement(i);
            if (el) {
                frag.appendChild(el);
                elements.push(el);
            }
        }

        container.appendChild(frag);

        const group = { name, container, elements, config };
        this._groups.set(name, group);

        if (config.pauseOnHidden !== false) {
            if (!this._unsubscribePause) {
                this._unsubscribePause = this.ac.eventBus?.on('visibility:hidden', () => this._pauseAll());
            }
            if (!this._unsubscribeResume) {
                this._unsubscribeResume = this.ac.eventBus?.on('visibility:visible', () => this._resumeAll());
            }
        }

        return group;
    }

    removeGroup(name) {
        const group = this._groups.get(name);
        if (!group) return;
        group.elements.forEach(el => el.remove());
        this._groups.delete(name);
    }

    destroy() {
        this._groups.forEach((g) => {
            g.elements.forEach(el => el.remove());
        });
        this._groups.clear();
        if (this._unsubscribePause) this._unsubscribePause();
        if (this._unsubscribeResume) this._unsubscribeResume();
    }

    _pauseAll() {
        this._groups.forEach(g => {
            g.elements.forEach(el => { el.style.animationPlayState = 'paused'; });
        });
    }

    _resumeAll() {
        this._groups.forEach(g => {
            g.elements.forEach(el => { el.style.animationPlayState = 'running'; });
        });
    }

    static rand(a, b) {
        return a + Math.random() * (b - a);
    }

    static createStar(i) {
        const palettes = [
            { color: '#ffffff',                            cls: 'poke-star' },
            { color: 'rgba(212, 166, 77, 0.95)',           cls: 'poke-star poke-star--gold' },
            { color: 'rgba(135, 206, 235, 0.95)',          cls: 'poke-star poke-star--sky' },
            { color: 'rgba(212, 96, 122, 0.9)',            cls: 'poke-star poke-star--rose' },
            { color: 'rgba(255, 240, 200, 0.95)',          cls: 'poke-star poke-star--cream' }
        ];
        const p = palettes[i % palettes.length];
        const s = document.createElement('span');
        s.className = p.cls;
        const size = ParticleEngine.rand(1, 3.5);
        const depth = ParticleEngine.rand(0.6, 1.4);
        s.style.cssText =
            'left:' + ParticleEngine.rand(0, 100) + 'vw;' +
            'top:'  + ParticleEngine.rand(0, 100) + 'vh;' +
            'width:'  + (size * depth) + 'px;' +
            'height:' + (size * depth) + 'px;' +
            'background:radial-gradient(circle,' + p.color + ' 0%, rgba(255,255,255,0) 70%);' +
            '--st-dur:' + ParticleEngine.rand(2.5, 6) + 's;' +
            '--st-del:' + ParticleEngine.rand(0, -6) + 's;' +
            'opacity:'  + ParticleEngine.rand(0.5, 1) + ';';
        return s;
    }

    static createBokehDot(i) {
        const dot = document.createElement('span');
        dot.className = 'poke-bokeh-dot';
        const size = ParticleEngine.rand(4, 12);
        const pick = Math.random();
        const hue = (pick > 0.7) ? 200 : (pick > 0.45) ? 330 : (pick > 0.2) ? 45 : 50;
        dot.style.cssText =
            'left:' + ParticleEngine.rand(0, 100) + 'vw;' +
            'width:'  + size + 'px;' +
            'height:' + size + 'px;' +
            '--bk-hue:'  + hue + ';' +
            '--bk-dur:'  + ParticleEngine.rand(10, 20) + 's;' +
            '--bk-del:'  + ParticleEngine.rand(0, -18) + 's;' +
            '--bk-sway:' + ParticleEngine.rand(-30, 30) + 'px;' +
            '--bk-op:'   + ParticleEngine.rand(0.25, 0.6) + ';';
        return dot;
    }

    static createPetal(i) {
        const palette = [
            'rgba(244, 194, 194, 0.9)',
            'rgba(232, 184, 136, 0.85)',
            'rgba(212, 166, 77, 0.85)',
            'rgba(255, 245, 220, 0.9)',
            'rgba(220, 180, 200, 0.85)',
            'rgba(212, 96, 122, 0.85)'
        ];
        const isHeart = Math.random() < 0.25;
        const r = document.createElement('span');
        r.className = 'poke-rise ' + (isHeart ? 'poke-rise--heart' : 'poke-rise--petal');
        const size = ParticleEngine.rand(isHeart ? 8 : 6, isHeart ? 14 : 14);
        r.style.cssText =
            'left:' + ParticleEngine.rand(2, 98) + 'vw;' +
            'width:'  + size + 'px;' +
            'height:' + size + 'px;' +
            '--pr-color:' + palette[i % palette.length] + ';' +
            '--pr-sz:'    + size + 'px;' +
            '--pr-dur:'   + ParticleEngine.rand(12, 22) + 's;' +
            '--pr-del:'   + ParticleEngine.rand(0, -20) + 's;' +
            '--pr-sway:'  + ParticleEngine.rand(-50, 50) + 'px;';
        return r;
    }

    static createOrbitDot(i) {
        const palette = [
            { c: 'rgba(255, 255, 255, 0.95)',  g: 'rgba(135, 206, 235, 0.7)' },
            { c: 'rgba(212, 166, 77, 0.95)',    g: 'rgba(212, 166, 77, 0.55)' },
            { c: 'rgba(255, 240, 200, 0.95)',   g: 'rgba(255, 240, 200, 0.5)' },
            { c: 'rgba(135, 206, 235, 0.95)',   g: 'rgba(135, 206, 235, 0.6)' },
            { c: 'rgba(212, 96, 122, 0.9)',     g: 'rgba(212, 96, 122, 0.45)' }
        ];
        const o = document.createElement('span');
        o.className = 'poke-orbit-dot';
        const p = palette[i % palette.length];
        const r = ParticleEngine.rand(220, 280);
        const sz = ParticleEngine.rand(3, 7);
        o.style.cssText =
            '--ob-r:'     + r + 'px;' +
            '--ob-sz:'    + sz + 'px;' +
            '--ob-color:' + p.c + ';' +
            '--ob-glow:'  + p.g + ';' +
            '--ob-dur:'   + ParticleEngine.rand(14, 28) + 's;' +
            '--ob-del:'   + ParticleEngine.rand(0, -20) + 's;' +
            '--ob-start:' + ParticleEngine.rand(0, 360) + 'deg;';
        return o;
    }

    static createPokeballParticle(i) {
        const pc = ['#c9a84c', '#f0d98a', '#d4607a', '#f0a0b4', '#fff', '#d6f0ff', '#ffe870'];
        const p = document.createElement('div');
        p.className = 'pokeball-p';
        const angle = (i / 30) * 360;
        const dist = 100 + Math.random() * 100;
        const dur = 0.6 + Math.random() * 0.5;
        const del = 0.25 + Math.random() * 0.4;
        const size = 3 + Math.random() * 8;
        p.style.cssText = '--ppa:' + angle + 'deg;--ppdist:' + dist + 'px;--ppt:' + dur + 's;--ppd:' + del + 's;background:' + pc[i % pc.length] + ';width:' + size + 'px;height:' + size + 'px;box-shadow:0 0 ' + (size + 2) + 'px ' + pc[i % pc.length] + ';';
        return p;
    }

    static createFloatingPokeball(i, ballTypes, positions) {
        const t = ballTypes[i % ballTypes.length];
        const p = positions[i % positions.length];
        if (!p) return null;
        const sz = 35 + Math.random() * 30;
        const div = document.createElement('div');
        div.className = 'poke-bg-obj';
        div.setAttribute('aria-hidden', 'true');
        const dur = 18 + Math.random() * 22;
        const del = Math.random() * 30;
        const rot = (Math.random() - 0.5) * 300;
        const ty = -(180 + Math.random() * 100);
        const alp = 0.15 + Math.random() * 0.12;
        div.style.cssText = 'left:' + p.l + ';top:' + p.t + ';width:' + sz + 'px;height:' + sz + 'px;--pbd:' + dur + 's;--pbdel:' + del + 's;--pbr:' + rot + 'deg;--pbty:' + ty + 'px;--pba:' + alp + ';';
        div.innerHTML =
            '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 40 40" aria-hidden="true">' +
                '<circle cx="20" cy="20" r="19" fill="' + t[0] + '" stroke="rgba(0,0,0,0.4)" stroke-width="1.5"/>' +
                '<rect x="1" y="18" width="38" height="4" fill="' + t[1] + '"/>' +
                '<circle cx="20" cy="20" r="6" fill="' + t[3] + '" stroke="' + t[1] + '" stroke-width="2"/>' +
                '<circle cx="20" cy="20" r="3.5" fill="rgba(255,255,255,0.4)"/>' +
            '</svg>';
        return div;
    }
}