// === TRANSITION ANIMATIONS ===
//
// pixelReveal  — Neo → Retro
//   Canvas tile grid spreads from button corner.
//   Each tile "card-flips" (squeezes to 0, repaints, expands) from dark Neo
//   colours to newsprint Retro colours in a radiating wave.
//
// inkFlow — Retro → Neo
//   SVG ink bottle near the toggle tips over. After a brief delay, dark ink
//   bleeds from the button corner in an organic, irregular blob that slowly
//   covers the screen.

const Animations = {

  // ─────────────────────────────────────────────────────────────────────────
  // pixelReveal(onThemeSwitch, onDone)
  // ─────────────────────────────────────────────────────────────────────────
  pixelReveal(onThemeSwitch, onDone) {
    const canvas = _makeCanvas();
    const W  = canvas.width;
    const H  = canvas.height;
    const ctx = canvas.getContext('2d');

    const TILE   = 22;          // tile size in px
    const WAVE   = 1050;        // ms for wave to travel max distance
    const FLIP   = 85;          // ms for one tile to complete its flip
    const SWITCH = WAVE * 0.54; // theme switch at 54% wave travel

    const cols = Math.ceil(W / TILE) + 1;
    const rows = Math.ceil(H / TILE) + 1;

    // Wave radiates from the toggle button (bottom-right)
    const oc = (W - 54) / TILE;
    const or = (H - 38) / TILE;

    let maxDist = 0;
    const tiles = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const d = Math.hypot(c - oc, r - or);
        if (d > maxDist) maxDist = d;
        tiles.push({ r, c, x: c * TILE, y: r * TILE, d });
      }
    }

    // Colour palettes — slight variation per tile to create mosaic depth
    const NEO  = ['#0a0b12','#0e1018','#141722','#0a0b12','#1a1e2d','#0a0b12','#0e1018'];
    const RET  = ['#f2ede4','#e4dfd2','#f2ede4','#ece7dc','#f2ede4','#dbd6c8','#f8f5ee'];
    const tc   = (tile, pal) => pal[(tile.r * 3 + tile.c * 5) % pal.length];

    const t0 = performance.now();
    let switched = false;

    function frame(now) {
      const e = now - t0;
      ctx.clearRect(0, 0, W, H);

      let allDone = true;

      for (const tile of tiles) {
        const ts = (tile.d / maxDist) * WAVE; // when this tile starts flipping
        const p  = e - ts;

        if (p < 0) {
          // Not yet — show Neo colour
          ctx.fillStyle = tc(tile, NEO);
          ctx.fillRect(tile.x, tile.y, TILE, TILE);
          allDone = false;
        } else if (p < FLIP) {
          // Phase 1: Neo face squeezes to 0 width (card turning)
          const sx = 1 - p / FLIP;
          ctx.fillStyle = tc(tile, NEO);
          const w = TILE * sx;
          ctx.fillRect(tile.x + (TILE - w) * 0.5, tile.y, w, TILE);
          allDone = false;
        } else if (p < FLIP * 2) {
          // Phase 2: Retro face expands from 0
          const sx = (p - FLIP) / FLIP;
          ctx.fillStyle = tc(tile, RET);
          const w = TILE * sx;
          ctx.fillRect(tile.x + (TILE - w) * 0.5, tile.y, w, TILE);
          allDone = false;
        } else {
          // Settled — Retro colour stays
          ctx.fillStyle = tc(tile, RET);
          ctx.fillRect(tile.x, tile.y, TILE, TILE);
        }
      }

      if (!switched && e >= SWITCH) {
        switched = true;
        onThemeSwitch();
      }

      if (allDone) {
        _fadeAndRemove(canvas, onDone);
      } else {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  },


  // ─────────────────────────────────────────────────────────────────────────
  // inkFlow(onThemeSwitch, onDone)
  // ─────────────────────────────────────────────────────────────────────────
  inkFlow(onThemeSwitch, onDone) {

    // ── Ink bottle SVG near the toggle button ────────────────────────────
    const bottle = document.createElement('div');
    bottle.id = 'tt-ink-bottle';
    bottle.innerHTML =
      `<svg viewBox="0 0 32 46" xmlns="http://www.w3.org/2000/svg">
        <!-- cap -->
        <rect x="10" y="0"  width="12" height="7"  rx="2"   fill="#38321e"/>
        <rect x="8"  y="6"  width="16" height="4"  rx="1.5" fill="#38321e"/>
        <!-- body -->
        <path d="M7 10 Q3 21 3 31 L3 41 Q3 46 7 46 L25 46 Q29 46 29 41
                 L29 31 Q29 21 25 10 Z" fill="#38321e"/>
        <!-- ink fill -->
        <path d="M7 26 Q3 31 3 41 L3 41 Q3 46 7 46 L25 46 Q29 46 29 41
                 L29 31 Q29 26 25 26 Z" fill="#1a1810"/>
        <!-- glass highlight -->
        <path d="M9.5 13 Q9 23 10 32"
              stroke="rgba(255,255,255,0.13)" stroke-width="2"
              stroke-linecap="round" fill="none"/>
      </svg>`;
    document.body.appendChild(bottle);

    // ── Ink spread canvas ─────────────────────────────────────────────────
    const canvas = _makeCanvas();
    const W  = canvas.width;
    const H  = canvas.height;
    const ctx = canvas.getContext('2d');

    // Ink source = toggle button position
    const sx = W - 54;
    const sy = H - 38;
    const maxR = Math.hypot(W, H) * 1.06;

    const BOTTLE_DELAY = 280;  // ms: bottle tips before ink starts
    const FLOW_DUR     = 1380; // ms: ink travel time to full coverage
    const SWITCH_AT    = 0.58; // fraction of FLOW_DUR when theme switches

    // Organic blob shape: per-segment radii modifiers (deterministic)
    const N = 36;
    const rMod = Array.from({ length: N }, (_, i) =>
      0.82 + 0.18 * (Math.sin(i * 2.73 + 0.9) * 0.55 + Math.cos(i * 1.1 + 2.3) * 0.45)
    );
    // Directional bias: ink spreads more aggressively toward screen centre
    const dBias = Array.from({ length: N }, (_, i) => {
      const ang = (i / N) * Math.PI * 2;
      return 1 + 0.30 * Math.max(0, Math.cos(ang - Math.PI * 1.25));
    });

    function drawInk(r) {
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const idx = i % N;
        const ang = (idx / N) * Math.PI * 2;
        const radius = r * rMod[idx] * dBias[idx];
        const px = sx + Math.cos(ang) * radius;
        const py = sy + Math.sin(ang) * radius;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = '#0a0b12';
      ctx.fill();

      // Drip tendrils ahead of the main blob
      if (r > 60) {
        ctx.fillStyle = '#0a0b12';
        const dripAngles = [0.82, 1.55, 2.28, 3.60, 4.40];
        for (const ang of dripAngles) {
          const dr = r * (1.18 + 0.07 * Math.sin(ang * 4.1));
          const dx = sx + Math.cos(ang) * dr;
          const dy = sy + Math.sin(ang) * dr;
          ctx.beginPath();
          ctx.arc(dx, dy, r * 0.07, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    let t0    = null;
    let switched = false;

    function frame(now) {
      if (!t0) t0 = now;
      const elapsed = now - t0 - BOTTLE_DELAY;
      if (elapsed < 0) { requestAnimationFrame(frame); return; }

      const p = Math.min(elapsed / FLOW_DUR, 1);
      // Easing: spill starts fast, slows as it spreads (like real ink on paper)
      const eased = 1 - Math.pow(1 - p, 2.5);
      drawInk(eased * maxR);

      if (!switched && p >= SWITCH_AT) {
        switched = true;
        onThemeSwitch();
      }

      if (p >= 1) {
        // Fade canvas, remove bottle
        canvas.style.transition = 'opacity 0.45s ease';
        canvas.style.opacity    = '0';
        bottle.style.transition = 'opacity 0.2s ease';
        bottle.style.opacity    = '0';
        setTimeout(() => {
          canvas.remove();
          bottle.remove();
          onDone();
        }, 460);
      } else {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }
};


// ── Helpers ────────────────────────────────────────────────────────────────

function _makeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const W   = window.innerWidth;
  const H   = window.innerHeight;
  const c   = document.createElement('canvas');
  c.width   = Math.round(W * dpr);
  c.height  = Math.round(H * dpr);
  c.style.cssText = `position:fixed;inset:0;width:${W}px;height:${H}px;`
                  + `z-index:9999;pointer-events:none;`;
  const ctx = c.getContext('2d');
  ctx.scale(dpr, dpr);
  document.body.appendChild(c);
  return c;
}

function _fadeAndRemove(el, cb) {
  el.style.transition = 'opacity 0.38s ease';
  el.style.opacity    = '0';
  setTimeout(() => { el.remove(); if (cb) cb(); }, 380);
}
