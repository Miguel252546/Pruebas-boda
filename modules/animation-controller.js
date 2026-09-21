class AnimationController {
    constructor(eventBus) {
        this.eventBus = eventBus || null;
        this._animators = new Map();
        this._nextId = 0;
        this._timers = [];
        this._intervals = [];
        this._rafId = null;
        this._paused = false;
        this._boundVis = this._onVisibilityChange.bind(this);
        document.addEventListener('visibilitychange', this._boundVis);
    }

    registerAnimator(fn) {
        const id = this._nextId++;
        this._animators.set(id, fn);
        if (!this._rafId && !this._paused) this._startLoop();
        return id;
    }

    unregisterAnimator(id) {
        this._animators.delete(id);
        if (this._animators.size === 0) this._stopLoop();
    }

    setTimeout(fn, delay) {
        const id = window.setTimeout(fn, delay);
        this._timers.push(id);
        return id;
    }

    setInterval(fn, delay) {
        const id = window.setInterval(fn, delay);
        this._intervals.push(id);
        return id;
    }

    clearTimeout(id) {
        window.clearTimeout(id);
        this._timers = this._timers.filter(t => t !== id);
    }

    clearInterval(id) {
        window.clearInterval(id);
        this._intervals = this._intervals.filter(t => t !== id);
    }

    pause() {
        if (this._paused) return;
        this._paused = true;
        this._stopLoop();
    }

    resume() {
        if (!this._paused) return;
        this._paused = false;
        if (this._animators.size > 0) this._startLoop();
    }

    destroy() {
        this._stopLoop();
        this._timers.forEach(window.clearTimeout);
        this._intervals.forEach(window.clearInterval);
        this._animators.clear();
        this._timers = [];
        this._intervals = [];
        document.removeEventListener('visibilitychange', this._boundVis);
    }

    _startLoop() {
        const loop = (now) => {
            if (this._paused) return;
            this._animators.forEach(fn => fn(now));
            this._rafId = window.requestAnimationFrame(loop);
        };
        this._rafId = window.requestAnimationFrame(loop);
    }

    _stopLoop() {
        if (this._rafId !== null) {
            window.cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    _onVisibilityChange() {
        if (document.hidden) {
            this.eventBus?.emit('visibility:hidden');
            this.pause();
        } else {
            this.eventBus?.emit('visibility:visible');
            this.resume();
        }
    }
}