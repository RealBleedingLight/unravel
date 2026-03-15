// === IMAGE EDITOR ===
function renderImageEditor(container) {
  let img = null;
  let originalData = null;
  let canvas, ctx;

  const settings = {
    brightness: 0, contrast: 0, saturation: 0,
    hue: 0, invert: false, grayscale: false,
    threshold: -1, posterize: 0,
    r: true, g: true, b: true,
    zoom: 1, rotate: 0, flipH: false, flipV: false
  };

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title"><span class="title-accent">◐</span> Image Editor</h1>
      <p class="page-subtitle">Adjust brightness, contrast, RGB channels, color pick, histogram analysis</p>
    </div>
    <div class="drop-zone" id="img-drop">
      <div class="drop-zone-text">
        <strong>Drop an image here</strong>
        or click to select — PNG, JPG, BMP, GIF, WEBP
      </div>
      <input type="file" id="img-input" accept="image/*" style="display:none">
    </div>
    <div id="img-workspace" class="hidden">
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">Canvas</span>
          <div class="flex gap-8">
            <button class="btn btn-small" id="img-zoom-in">Zoom +</button>
            <button class="btn btn-small" id="img-zoom-out">Zoom −</button>
            <button class="btn btn-small" id="img-zoom-fit">Fit</button>
            <button class="btn btn-small" id="img-rotate-cw">↻ 90°</button>
            <button class="btn btn-small" id="img-flip-h">⇔ Flip H</button>
            <button class="btn btn-small" id="img-flip-v">⇕ Flip V</button>
            <button class="btn btn-small" id="img-pixel-toggle">Pixel Grid</button>
            <button class="btn btn-accent btn-small" id="img-download">↓ Save</button>
          </div>
        </div>
        <div class="canvas-wrap" id="img-canvas-wrap">
          <canvas id="img-canvas"></canvas>
        </div>
        <div class="color-info mt-8" id="color-info">
          <div class="color-swatch" id="color-swatch"></div>
          <span id="color-hex" class="font-mono text-accent">Hover over image</span>
          <span id="color-rgb" class="font-mono text-muted"></span>
          <span id="color-pos" class="font-mono text-muted"></span>
        </div>
      </div>

      <div class="two-col">
        <div class="panel">
          <div class="panel-header"><span class="panel-title">Adjustments</span>
            <button class="btn btn-small" id="img-reset">Reset All</button>
          </div>
          <div class="control-row">
            <span class="control-label">Brightness</span>
            <input type="range" id="adj-brightness" min="-100" max="100" value="0">
            <span class="range-value" id="val-brightness">0</span>
          </div>
          <div class="control-row">
            <span class="control-label">Contrast</span>
            <input type="range" id="adj-contrast" min="-100" max="100" value="0">
            <span class="range-value" id="val-contrast">0</span>
          </div>
          <div class="control-row">
            <span class="control-label">Saturation</span>
            <input type="range" id="adj-saturation" min="-100" max="100" value="0">
            <span class="range-value" id="val-saturation">0</span>
          </div>
          <div class="control-row">
            <span class="control-label">Hue Rotate</span>
            <input type="range" id="adj-hue" min="0" max="360" value="0">
            <span class="range-value" id="val-hue">0°</span>
          </div>
          <div class="control-row">
            <span class="control-label">Threshold</span>
            <input type="range" id="adj-threshold" min="-1" max="255" value="-1">
            <span class="range-value" id="val-threshold">OFF</span>
          </div>
          <div class="control-row">
            <span class="control-label">Posterize</span>
            <input type="range" id="adj-posterize" min="0" max="8" value="0">
            <span class="range-value" id="val-posterize">OFF</span>
          </div>
          <div class="control-row mt-8">
            <span class="control-label">Channels</span>
            <label style="color:var(--danger);cursor:pointer;display:flex;align-items:center;gap:4px">
              <input type="checkbox" id="ch-r" checked> R</label>
            <label style="color:var(--accent);cursor:pointer;display:flex;align-items:center;gap:4px">
              <input type="checkbox" id="ch-g" checked> G</label>
            <label style="color:var(--info);cursor:pointer;display:flex;align-items:center;gap:4px">
              <input type="checkbox" id="ch-b" checked> B</label>
          </div>
          <div class="control-row mt-8">
            <button class="btn btn-small" id="adj-invert">Invert</button>
            <button class="btn btn-small" id="adj-grayscale">Grayscale</button>
            <button class="btn btn-small" id="adj-edge">Edge Detect</button>
            <button class="btn btn-small" id="adj-sharpen">Sharpen</button>
            <button class="btn btn-small" id="adj-blur">Blur</button>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header"><span class="panel-title">Histogram</span></div>
          <canvas id="histogram-canvas" class="histogram-canvas" width="512" height="120"></canvas>
          <div class="flex gap-8 mt-8 justify-between">
            <span class="text-sm text-muted" id="img-dimensions"></span>
            <span class="text-sm text-muted" id="img-size-info"></span>
          </div>
          <div class="mt-16">
            <div class="panel-title mb-12">Color Palette (Top 8)</div>
            <div id="color-palette" class="flex gap-8 flex-wrap"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Wire up drop zone
  const dropZone = container.querySelector('#img-drop');
  const fileInput = container.querySelector('#img-input');

  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('dragover'); loadImage(e.dataTransfer.files[0]); });
  fileInput.addEventListener('change', e => { if (e.target.files[0]) loadImage(e.target.files[0]); });

  function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      img = new Image();
      img.onload = () => {
        canvas = container.querySelector('#img-canvas');
        ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        container.querySelector('#img-drop').classList.add('hidden');
        container.querySelector('#img-workspace').classList.remove('hidden');
        container.querySelector('#img-dimensions').textContent = `${img.width} × ${img.height}`;
        container.querySelector('#img-size-info').textContent = `${(file.size / 1024).toFixed(1)} KB`;
        applyAdjustments();
        drawHistogram();
        extractPalette();
        setupColorPicker();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function applyAdjustments() {
    if (!originalData) return;
    const src = originalData.data;
    const out = ctx.createImageData(canvas.width, canvas.height);
    const dst = out.data;
    const b = settings.brightness;
    const c = settings.contrast;
    const factor = (259 * (c + 255)) / (255 * (259 - c));

    for (let i = 0; i < src.length; i += 4) {
      let r = src[i], g = src[i+1], bl = src[i+2], a = src[i+3];

      // Brightness
      r += b; g += b; bl += b;

      // Contrast
      r = factor * (r - 128) + 128;
      g = factor * (g - 128) + 128;
      bl = factor * (bl - 128) + 128;

      // Saturation
      if (settings.saturation !== 0) {
        const sat = settings.saturation / 100;
        const gray = 0.2989 * r + 0.587 * g + 0.114 * bl;
        r = gray + (1 + sat) * (r - gray);
        g = gray + (1 + sat) * (g - gray);
        bl = gray + (1 + sat) * (bl - gray);
      }

      // Channel isolation
      if (!settings.r) r = 0;
      if (!settings.g) g = 0;
      if (!settings.b) bl = 0;

      // Invert
      if (settings.invert) { r = 255 - r; g = 255 - g; bl = 255 - bl; }

      // Grayscale
      if (settings.grayscale) {
        const gray = 0.2989 * r + 0.587 * g + 0.114 * bl;
        r = g = bl = gray;
      }

      // Threshold
      if (settings.threshold >= 0) {
        const gray = 0.2989 * r + 0.587 * g + 0.114 * bl;
        r = g = bl = gray >= settings.threshold ? 255 : 0;
      }

      // Posterize
      if (settings.posterize > 0) {
        const levels = settings.posterize;
        r = Math.round(Math.round(r / 255 * levels) / levels * 255);
        g = Math.round(Math.round(g / 255 * levels) / levels * 255);
        bl = Math.round(Math.round(bl / 255 * levels) / levels * 255);
      }

      dst[i] = Math.max(0, Math.min(255, r));
      dst[i+1] = Math.max(0, Math.min(255, g));
      dst[i+2] = Math.max(0, Math.min(255, bl));
      dst[i+3] = a;
    }
    ctx.putImageData(out, 0, 0);
  }

  function applyConvolution(kernel, divisor = 1) {
    if (!originalData) return;
    const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const out = ctx.createImageData(canvas.width, canvas.height);
    const w = canvas.width, h = canvas.height;
    const sd = src.data, od = out.data;
    const ks = Math.sqrt(kernel.length);
    const half = Math.floor(ks / 2);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 0, g = 0, b = 0;
        for (let ky = 0; ky < ks; ky++) {
          for (let kx = 0; kx < ks; kx++) {
            const px = Math.min(w-1, Math.max(0, x + kx - half));
            const py = Math.min(h-1, Math.max(0, y + ky - half));
            const idx = (py * w + px) * 4;
            const ki = ky * ks + kx;
            r += sd[idx] * kernel[ki];
            g += sd[idx+1] * kernel[ki];
            b += sd[idx+2] * kernel[ki];
          }
        }
        const idx = (y * w + x) * 4;
        od[idx] = Math.max(0, Math.min(255, r / divisor));
        od[idx+1] = Math.max(0, Math.min(255, g / divisor));
        od[idx+2] = Math.max(0, Math.min(255, b / divisor));
        od[idx+3] = sd[idx+3];
      }
    }
    ctx.putImageData(out, 0, 0);
    // Update originalData so further adjustments stack
    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  function drawHistogram() {
    const hCanvas = container.querySelector('#histogram-canvas');
    const hCtx = hCanvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const rH = new Array(256).fill(0);
    const gH = new Array(256).fill(0);
    const bH = new Array(256).fill(0);

    for (let i = 0; i < data.length; i += 4) {
      rH[data[i]]++;
      gH[data[i+1]]++;
      bH[data[i+2]]++;
    }

    const max = Math.max(...rH, ...gH, ...bH);
    hCtx.clearRect(0, 0, 512, 120);

    const drawChannel = (hist, color) => {
      hCtx.beginPath();
      hCtx.strokeStyle = color;
      hCtx.lineWidth = 1;
      hCtx.globalAlpha = 0.6;
      for (let i = 0; i < 256; i++) {
        const x = i * 2;
        const h = (hist[i] / max) * 110;
        hCtx.moveTo(x, 120);
        hCtx.lineTo(x, 120 - h);
      }
      hCtx.stroke();
      hCtx.globalAlpha = 1;
    };

    drawChannel(rH, '#ff4d6a');
    drawChannel(gH, '#00d4aa');
    drawChannel(bH, '#4da6ff');
  }

  function extractPalette() {
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colorMap = {};
    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) {
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i+1] / 32) * 32;
      const b = Math.round(data[i+2] / 32) * 32;
      const key = `${r},${g},${b}`;
      colorMap[key] = (colorMap[key] || 0) + 1;
    }
    const sorted = Object.entries(colorMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const paletteEl = container.querySelector('#color-palette');
    paletteEl.innerHTML = '';
    sorted.forEach(([color]) => {
      const [r, g, b] = color.split(',');
      const hex = '#' + [r,g,b].map(c => parseInt(c).toString(16).padStart(2,'0')).join('');
      const swatch = el('div', {
        className: 'color-swatch',
        title: hex,
        style: `background:rgb(${color});cursor:pointer;`,
        onClick: () => navigator.clipboard.writeText(hex)
      });
      paletteEl.appendChild(swatch);
    });
  }

  function setupColorPicker() {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);
      if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
      const data = ctx.getImageData(x, y, 1, 1).data;
      const hex = '#' + [data[0], data[1], data[2]].map(c => c.toString(16).padStart(2, '0')).join('');
      container.querySelector('#color-swatch').style.background = hex;
      container.querySelector('#color-hex').textContent = hex;
      container.querySelector('#color-rgb').textContent = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
      container.querySelector('#color-pos').textContent = `(${x}, ${y})`;
    });
  }

  // Bind sliders
  setTimeout(() => {
    ['brightness','contrast','saturation','hue','threshold','posterize'].forEach(name => {
      const slider = container.querySelector(`#adj-${name}`);
      if (!slider) return;
      slider.addEventListener('input', () => {
        settings[name] = parseInt(slider.value);
        const valEl = container.querySelector(`#val-${name}`);
        if (name === 'threshold') valEl.textContent = slider.value == -1 ? 'OFF' : slider.value;
        else if (name === 'posterize') valEl.textContent = slider.value == 0 ? 'OFF' : slider.value;
        else if (name === 'hue') valEl.textContent = slider.value + '°';
        else valEl.textContent = slider.value;
        applyAdjustments();
        drawHistogram();
      });
    });

    ['r','g','b'].forEach(ch => {
      container.querySelector(`#ch-${ch}`).addEventListener('change', (e) => {
        settings[ch] = e.target.checked;
        applyAdjustments();
        drawHistogram();
      });
    });

    container.querySelector('#adj-invert').addEventListener('click', () => {
      settings.invert = !settings.invert;
      applyAdjustments(); drawHistogram();
    });
    container.querySelector('#adj-grayscale').addEventListener('click', () => {
      settings.grayscale = !settings.grayscale;
      applyAdjustments(); drawHistogram();
    });
    container.querySelector('#adj-edge').addEventListener('click', () => {
      applyAdjustments();
      applyConvolution([-1,-1,-1,-1,8,-1,-1,-1,-1]);
      drawHistogram();
    });
    container.querySelector('#adj-sharpen').addEventListener('click', () => {
      applyAdjustments();
      applyConvolution([0,-1,0,-1,5,-1,0,-1,0]);
      drawHistogram();
    });
    container.querySelector('#adj-blur').addEventListener('click', () => {
      applyAdjustments();
      applyConvolution([1,1,1,1,1,1,1,1,1], 9);
      drawHistogram();
    });
    container.querySelector('#img-reset').addEventListener('click', () => {
      Object.assign(settings, { brightness:0,contrast:0,saturation:0,hue:0,invert:false,grayscale:false,threshold:-1,posterize:0,r:true,g:true,b:true });
      ['brightness','contrast','saturation','hue'].forEach(n => {
        container.querySelector(`#adj-${n}`).value = n === 'hue' ? 0 : 0;
        container.querySelector(`#val-${n}`).textContent = n === 'hue' ? '0°' : '0';
      });
      container.querySelector('#adj-threshold').value = -1;
      container.querySelector('#val-threshold').textContent = 'OFF';
      container.querySelector('#adj-posterize').value = 0;
      container.querySelector('#val-posterize').textContent = 'OFF';
      ['r','g','b'].forEach(c => container.querySelector(`#ch-${c}`).checked = true);
      applyAdjustments(); drawHistogram(); extractPalette();
    });

    container.querySelector('#img-zoom-in').addEventListener('click', () => {
      const wrap = container.querySelector('#img-canvas-wrap');
      settings.zoom = Math.min(settings.zoom * 1.5, 10);
      canvas.style.transform = `scale(${settings.zoom})`;
      canvas.style.transformOrigin = 'top left';
    });
    container.querySelector('#img-zoom-out').addEventListener('click', () => {
      settings.zoom = Math.max(settings.zoom / 1.5, 0.1);
      canvas.style.transform = `scale(${settings.zoom})`;
    });
    container.querySelector('#img-zoom-fit').addEventListener('click', () => {
      settings.zoom = 1;
      canvas.style.transform = '';
    });
    container.querySelector('#img-rotate-cw').addEventListener('click', () => {
      if (!img) return;
      settings.rotate = (settings.rotate + 90) % 360;
      const tmpCanvas = document.createElement('canvas');
      const tmpCtx = tmpCanvas.getContext('2d');
      tmpCanvas.width = canvas.height;
      tmpCanvas.height = canvas.width;
      tmpCtx.translate(tmpCanvas.width/2, tmpCanvas.height/2);
      tmpCtx.rotate(Math.PI/2);
      tmpCtx.drawImage(canvas, -canvas.width/2, -canvas.height/2);
      canvas.width = tmpCanvas.width;
      canvas.height = tmpCanvas.height;
      ctx.drawImage(tmpCanvas, 0, 0);
      originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      container.querySelector('#img-dimensions').textContent = `${canvas.width} × ${canvas.height}`;
      drawHistogram();
    });
    container.querySelector('#img-flip-h').addEventListener('click', () => {
      if (!img) return;
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = canvas.width; tmpCanvas.height = canvas.height;
      const tmpCtx = tmpCanvas.getContext('2d');
      tmpCtx.translate(canvas.width, 0);
      tmpCtx.scale(-1, 1);
      tmpCtx.drawImage(canvas, 0, 0);
      ctx.drawImage(tmpCanvas, 0, 0);
      originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    });
    container.querySelector('#img-flip-v').addEventListener('click', () => {
      if (!img) return;
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = canvas.width; tmpCanvas.height = canvas.height;
      const tmpCtx = tmpCanvas.getContext('2d');
      tmpCtx.translate(0, canvas.height);
      tmpCtx.scale(1, -1);
      tmpCtx.drawImage(canvas, 0, 0);
      ctx.drawImage(tmpCanvas, 0, 0);
      originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    });
    container.querySelector('#img-pixel-toggle').addEventListener('click', () => {
      container.querySelector('#img-canvas-wrap').classList.toggle('pixelated');
    });
    container.querySelector('#img-download').addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'edited.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }, 0);
}

Router.register('/toolkit', 'image-editor', renderImageEditor);
