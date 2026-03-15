// === STEGANOGRAPHY TOOL ===
function renderStego(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title"><span class="title-accent">◈</span> Steganography</h1>
      <p class="page-subtitle">LSB extraction, bit plane analysis, hidden string detection</p>
    </div>
    <div class="drop-zone" id="stego-drop">
      <div class="drop-zone-text">
        <strong>Drop an image for stego analysis</strong>
        PNG recommended for lossless analysis
      </div>
      <input type="file" id="stego-input" accept="image/*" style="display:none">
    </div>
    <div id="stego-workspace" class="hidden">
      <div class="tab-bar">
        <button class="tab-btn active" data-tab="lsb">LSB Extract</button>
        <button class="tab-btn" data-tab="bitplane">Bit Planes</button>
        <button class="tab-btn" data-tab="strings">String Search</button>
        <button class="tab-btn" data-tab="rawdata">Raw Data</button>
      </div>

      <div class="tab-content active" id="tab-lsb">
        <div class="panel">
          <div class="panel-header"><span class="panel-title">LSB Extraction</span></div>
          <div class="control-row">
            <span class="control-label">Bits</span>
            <select id="lsb-bits" style="max-width:100px">
              <option value="1">1 bit</option>
              <option value="2">2 bits</option>
              <option value="3">3 bits</option>
              <option value="4">4 bits</option>
            </select>
            <span class="control-label">Channel</span>
            <select id="lsb-channel" style="max-width:120px">
              <option value="all">All (RGB)</option>
              <option value="r">Red only</option>
              <option value="g">Green only</option>
              <option value="b">Blue only</option>
              <option value="a">Alpha only</option>
            </select>
            <span class="control-label">Order</span>
            <select id="lsb-order" style="max-width:120px">
              <option value="row">Row-major</option>
              <option value="col">Column-major</option>
            </select>
            <button class="btn btn-accent" id="lsb-extract">Extract</button>
          </div>
          <div class="two-col mt-16">
            <div>
              <div class="text-sm text-muted mb-12">Visual output</div>
              <div class="canvas-wrap"><canvas id="lsb-canvas"></canvas></div>
            </div>
            <div>
              <div class="text-sm text-muted mb-12">Extracted text (if ASCII)</div>
              <div class="output-box" id="lsb-text" style="max-height:300px;overflow:auto;min-height:200px"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="tab-content" id="tab-bitplane">
        <div class="panel">
          <div class="panel-header"><span class="panel-title">Bit Plane Viewer</span></div>
          <div class="control-row">
            <span class="control-label">Channel</span>
            <select id="bp-channel" style="max-width:100px">
              <option value="r">Red</option>
              <option value="g">Green</option>
              <option value="b">Blue</option>
            </select>
            <span class="control-label">Bit</span>
            <select id="bp-bit" style="max-width:100px">
              <option value="0">Bit 0 (LSB)</option>
              <option value="1">Bit 1</option>
              <option value="2">Bit 2</option>
              <option value="3">Bit 3</option>
              <option value="4">Bit 4</option>
              <option value="5">Bit 5</option>
              <option value="6">Bit 6</option>
              <option value="7">Bit 7 (MSB)</option>
            </select>
            <button class="btn btn-accent" id="bp-render">Render</button>
          </div>
          <div class="canvas-wrap mt-16"><canvas id="bp-canvas"></canvas></div>
        </div>
      </div>

      <div class="tab-content" id="tab-strings">
        <div class="panel">
          <div class="panel-header"><span class="panel-title">Strings in Image Data</span></div>
          <div class="control-row">
            <span class="control-label">Min length</span>
            <input type="number" id="str-min" value="4" style="max-width:80px" min="2" max="50">
            <button class="btn btn-accent" id="str-search">Search</button>
          </div>
          <div class="output-box mt-16" id="str-results" style="max-height:400px;overflow:auto"></div>
        </div>
      </div>

      <div class="tab-content" id="tab-rawdata">
        <div class="panel">
          <div class="panel-header"><span class="panel-title">Raw Pixel Data</span>
            <div class="flex gap-8">
              <button class="btn btn-small" id="raw-hex">Hex Dump</button>
              <button class="btn btn-small" id="raw-binary">Binary Dump</button>
            </div>
          </div>
          <div class="output-box" id="raw-output" style="max-height:400px;overflow:auto;font-size:0.72rem"></div>
        </div>
      </div>
    </div>
  `;

  let imgData = null;
  let canvas, ctx;

  const drop = container.querySelector('#stego-drop');
  const input = container.querySelector('#stego-input');
  drop.addEventListener('click', () => input.click());
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('dragover'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
  drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('dragover'); loadImg(e.dataTransfer.files[0]); });
  input.addEventListener('change', e => { if (e.target.files[0]) loadImg(e.target.files[0]); });

  function loadImg(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        drop.classList.add('hidden');
        container.querySelector('#stego-workspace').classList.remove('hidden');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Tabs
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      container.querySelector(`#tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  // LSB Extract
  container.querySelector('#lsb-extract').addEventListener('click', () => {
    if (!imgData) return;
    const bits = parseInt(container.querySelector('#lsb-bits').value);
    const channel = container.querySelector('#lsb-channel').value;
    const order = container.querySelector('#lsb-order').value;
    const data = imgData.data;
    const w = imgData.width, h = imgData.height;

    // Visual extraction
    const lsbCanvas = container.querySelector('#lsb-canvas');
    lsbCanvas.width = w; lsbCanvas.height = h;
    const lsbCtx = lsbCanvas.getContext('2d');
    const outData = lsbCtx.createImageData(w, h);
    const mask = (1 << bits) - 1;
    const scale = 255 / mask;

    for (let i = 0; i < data.length; i += 4) {
      const r = (data[i] & mask) * scale;
      const g = (data[i+1] & mask) * scale;
      const b = (data[i+2] & mask) * scale;
      outData.data[i] = r;
      outData.data[i+1] = g;
      outData.data[i+2] = b;
      outData.data[i+3] = 255;
    }
    lsbCtx.putImageData(outData, 0, 0);

    // Text extraction
    let bitStream = [];
    const chMap = { r: 0, g: 1, b: 2, a: 3 };

    if (order === 'row') {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          if (channel === 'all') {
            for (let c = 0; c < 3; c++) {
              for (let bit = 0; bit < bits; bit++) {
                bitStream.push((data[idx + c] >> bit) & 1);
              }
            }
          } else {
            const c = chMap[channel];
            for (let bit = 0; bit < bits; bit++) {
              bitStream.push((data[idx + c] >> bit) & 1);
            }
          }
        }
      }
    } else {
      for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
          const idx = (y * w + x) * 4;
          if (channel === 'all') {
            for (let c = 0; c < 3; c++) {
              for (let bit = 0; bit < bits; bit++) {
                bitStream.push((data[idx + c] >> bit) & 1);
              }
            }
          } else {
            const c = chMap[channel];
            for (let bit = 0; bit < bits; bit++) {
              bitStream.push((data[idx + c] >> bit) & 1);
            }
          }
        }
      }
    }

    // Convert to bytes then ASCII
    let text = '';
    for (let i = 0; i + 7 < bitStream.length; i += 8) {
      let byte = 0;
      for (let b = 0; b < 8; b++) byte |= bitStream[i + b] << b;
      if (byte === 0) break; // null terminator
      if (byte >= 32 && byte <= 126 || byte === 10 || byte === 13) text += String.fromCharCode(byte);
      else text += '.';
    }
    container.querySelector('#lsb-text').textContent = text.slice(0, 5000) || '(No readable ASCII found)';
  });

  // Bit Plane
  container.querySelector('#bp-render').addEventListener('click', () => {
    if (!imgData) return;
    const ch = { r: 0, g: 1, b: 2 }[container.querySelector('#bp-channel').value];
    const bit = parseInt(container.querySelector('#bp-bit').value);
    const bpCanvas = container.querySelector('#bp-canvas');
    bpCanvas.width = imgData.width; bpCanvas.height = imgData.height;
    const bpCtx = bpCanvas.getContext('2d');
    const out = bpCtx.createImageData(imgData.width, imgData.height);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const val = ((imgData.data[i + ch] >> bit) & 1) * 255;
      out.data[i] = out.data[i+1] = out.data[i+2] = val;
      out.data[i+3] = 255;
    }
    bpCtx.putImageData(out, 0, 0);
  });

  // String search
  container.querySelector('#str-search').addEventListener('click', () => {
    if (!imgData) return;
    const minLen = parseInt(container.querySelector('#str-min').value) || 4;
    const data = imgData.data;
    let current = '';
    const results = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i] >= 32 && data[i] <= 126) {
        current += String.fromCharCode(data[i]);
      } else {
        if (current.length >= minLen) results.push({ offset: i - current.length, str: current });
        current = '';
      }
    }
    if (current.length >= minLen) results.push({ offset: data.length - current.length, str: current });
    const output = results.map(r => `[0x${r.offset.toString(16).padStart(6,'0')}] ${r.str}`).join('\n');
    container.querySelector('#str-results').textContent = output || 'No strings found';
  });

  // Raw data
  container.querySelector('#raw-hex').addEventListener('click', () => {
    if (!imgData) return;
    const data = imgData.data;
    let hex = '';
    const limit = Math.min(data.length, 2048);
    for (let i = 0; i < limit; i++) {
      hex += data[i].toString(16).padStart(2, '0') + ' ';
      if ((i + 1) % 32 === 0) hex += '\n';
    }
    if (data.length > limit) hex += `\n... (${data.length - limit} more bytes)`;
    container.querySelector('#raw-output').textContent = hex;
  });

  container.querySelector('#raw-binary').addEventListener('click', () => {
    if (!imgData) return;
    const data = imgData.data;
    let bin = '';
    const limit = Math.min(data.length, 512);
    for (let i = 0; i < limit; i++) {
      bin += data[i].toString(2).padStart(8, '0') + ' ';
      if ((i + 1) % 8 === 0) bin += '\n';
    }
    if (data.length > limit) bin += `\n... (${data.length - limit} more bytes)`;
    container.querySelector('#raw-output').textContent = bin;
  });
}

Router.register('/toolkit/stego', 'stego', renderStego);
