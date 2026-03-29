// === THEME SYSTEM ===
// Neo:   dark terminal, cyan accents, targeting reticle cursor
// Retro: newspaper puzzle paper, gold ink accents, magnifying glass cursor

const Theme = {
  STORAGE_KEY: 'cs_theme',
  NUDGE_KEY:   'cs_nudge_shown',
  current:     'retro',

  init() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    this.current = stored || 'retro';
    document.documentElement.setAttribute('data-theme', this.current);
  },

  _running: false,

  toggle() {
    if (this._running) return;
    const to = this.current === 'neo' ? 'retro' : 'neo';
    this._runTransition(to);
  },

  _runTransition(to) {
    this._running = true;

    const applyTheme = () => {
      this.current = to;
      document.documentElement.setAttribute('data-theme', to);
      localStorage.setItem(this.STORAGE_KEY, to);
      this._updateLabel();

      if (to === 'neo') {
        setTimeout(() => { if (typeof initGridCanvas === 'function') initGridCanvas(); }, 20);
      }
    };

    const onDone = () => {
      this._running = false;
    };

    if (to === 'retro') {
      Animations.pixelReveal(applyTheme, onDone);
    } else {
      Animations.inkFlow(applyTheme, onDone);
    }
  },

  _updateLabel() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    if (this.current === 'neo') {
      btn.innerHTML = '<span class="tt-icon">◎</span><span class="tt-text">RETRO</span>';
    } else {
      btn.innerHTML = '<span class="tt-icon">⊡</span><span class="tt-text">NEO</span>';
    }
    btn.dataset.current = this.current;
  },

  _showNudge() {
    if (localStorage.getItem(this.NUDGE_KEY)) return;
    localStorage.setItem(this.NUDGE_KEY, '1');

    setTimeout(() => {
      const nudge = document.createElement('div');
      nudge.id = 'tt-nudge';
      nudge.textContent = this.current === 'retro' ? 'try NEO →' : '← try RETRO';
      document.body.appendChild(nudge);

      // Trigger animation after paint
      requestAnimationFrame(() => {
        requestAnimationFrame(() => nudge.classList.add('tt-nudge-in'));
      });

      setTimeout(() => {
        nudge.classList.add('tt-nudge-out');
        setTimeout(() => nudge.remove(), 400);
      }, 3800);
    }, 2400);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Theme.init();          // sync stored preference → Theme.current
  Theme._updateLabel();

  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      document.getElementById('tt-nudge')?.remove();
      Theme.toggle();
    });
  }

  // Fire grid canvas if Neo is the active theme
  if (Theme.current === 'neo' && typeof initGridCanvas === 'function') {
    initGridCanvas();
  }

  Theme._showNudge();
});
