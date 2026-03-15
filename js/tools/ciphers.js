// === CLASSICAL CIPHERS ===
function renderCiphers(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title"><span class="title-accent">◆</span> Classical Ciphers</h1>
      <p class="page-subtitle">Caesar, Vigenère, Atbash, Rail Fence, Substitution, XOR, and more</p>
    </div>

    <div class="panel">
      <div class="panel-header"><span class="panel-title">Input</span></div>
      <textarea id="cipher-input" placeholder="Enter text to encrypt/decrypt..." rows="3"></textarea>
    </div>

    <div class="tab-bar">
      <button class="tab-btn active" data-tab="caesar">Caesar / ROT</button>
      <button class="tab-btn" data-tab="vigenere">Vigenère</button>
      <button class="tab-btn" data-tab="atbash">Atbash</button>
      <button class="tab-btn" data-tab="substitution">Substitution</button>
      <button class="tab-btn" data-tab="railfence">Rail Fence</button>
      <button class="tab-btn" data-tab="xor">XOR</button>
      <button class="tab-btn" data-tab="affine">Affine</button>
      <button class="tab-btn" data-tab="beaufort">Beaufort</button>
      <button class="tab-btn" data-tab="freq">Frequency Analysis</button>
    </div>

    <!-- Caesar / ROT -->
    <div class="tab-content active" id="tab-caesar">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Caesar / ROT-N</span>
          <button class="btn btn-small btn-accent" id="caesar-all">Show All 26</button>
        </div>
        <div class="control-row">
          <span class="control-label">Shift</span>
          <input type="range" id="caesar-shift" min="0" max="25" value="13">
          <span class="range-value" id="caesar-shift-val">13</span>
          <button class="btn btn-small" id="caesar-encode">Encode</button>
          <button class="btn btn-small" id="caesar-decode">Decode</button>
        </div>
        <div class="output-box mt-8" id="caesar-output"></div>
        <div id="caesar-all-output" class="hidden mt-16" style="max-height:400px;overflow:auto"></div>
      </div>
    </div>

    <!-- Vigenère -->
    <div class="tab-content" id="tab-vigenere">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Vigenère Cipher</span></div>
        <div class="control-row">
          <span class="control-label">Key</span>
          <input type="text" id="vig-key" placeholder="Enter key..." style="max-width:200px">
          <button class="btn btn-small" id="vig-encode">Encode</button>
          <button class="btn btn-small" id="vig-decode">Decode</button>
        </div>
        <div class="output-box mt-8" id="vig-output"></div>
        <div class="mt-16">
          <div class="text-sm text-muted mb-12">Vigenère Table</div>
          <div id="vig-table" style="overflow:auto;font-size:0.65rem;font-family:var(--font-mono);line-height:1.8"></div>
        </div>
      </div>
    </div>

    <!-- Atbash -->
    <div class="tab-content" id="tab-atbash">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Atbash Cipher</span>
          <span class="badge badge-accent">A↔Z B↔Y C↔X</span>
        </div>
        <button class="btn btn-accent" id="atbash-run">Apply Atbash</button>
        <div class="output-box mt-8" id="atbash-output"></div>
      </div>
    </div>

    <!-- Substitution -->
    <div class="tab-content" id="tab-substitution">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Substitution Cipher</span></div>
        <div class="control-row">
          <span class="control-label">Alphabet</span>
          <input type="text" id="sub-alphabet" value="ZYXWVUTSRQPONMLKJIHGFEDCBA" maxlength="26" style="font-family:var(--font-mono);letter-spacing:2px">
        </div>
        <div class="text-sm text-muted mt-8">Standard: ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
        <div class="control-row mt-8">
          <button class="btn btn-small" id="sub-encode">Encode</button>
          <button class="btn btn-small" id="sub-decode">Decode</button>
          <button class="btn btn-small" id="sub-random">Random Key</button>
        </div>
        <div class="output-box mt-8" id="sub-output"></div>
      </div>
    </div>

    <!-- Rail Fence -->
    <div class="tab-content" id="tab-railfence">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Rail Fence Cipher</span></div>
        <div class="control-row">
          <span class="control-label">Rails</span>
          <input type="number" id="rail-count" value="3" min="2" max="20" style="max-width:80px">
          <span class="control-label">Offset</span>
          <input type="number" id="rail-offset" value="0" min="0" max="20" style="max-width:80px">
          <button class="btn btn-small" id="rail-encode">Encode</button>
          <button class="btn btn-small" id="rail-decode">Decode</button>
        </div>
        <div class="output-box mt-8" id="rail-output"></div>
        <div class="output-box mt-8 text-muted" id="rail-visual" style="font-size:0.72rem;color:var(--text-muted)"></div>
      </div>
    </div>

    <!-- XOR -->
    <div class="tab-content" id="tab-xor">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">XOR Cipher</span></div>
        <div class="control-row">
          <span class="control-label">Key</span>
          <input type="text" id="xor-key" placeholder="Key (text or hex with 0x prefix)" style="max-width:250px">
          <button class="btn btn-small" id="xor-apply">Apply XOR</button>
          <button class="btn btn-small" id="xor-brute">Brute Force (1 byte)</button>
        </div>
        <div class="output-box mt-8" id="xor-output"></div>
        <div id="xor-brute-output" class="hidden mt-8" style="max-height:400px;overflow:auto"></div>
      </div>
    </div>

    <!-- Affine -->
    <div class="tab-content" id="tab-affine">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Affine Cipher</span>
          <span class="badge badge-purple">E(x) = (ax + b) mod 26</span>
        </div>
        <div class="control-row">
          <span class="control-label">a</span>
          <input type="number" id="affine-a" value="5" min="1" max="25" style="max-width:80px">
          <span class="control-label">b</span>
          <input type="number" id="affine-b" value="8" min="0" max="25" style="max-width:80px">
          <button class="btn btn-small" id="affine-encode">Encode</button>
          <button class="btn btn-small" id="affine-decode">Decode</button>
        </div>
        <div class="output-box mt-8" id="affine-output"></div>
      </div>
    </div>

    <!-- Beaufort -->
    <div class="tab-content" id="tab-beaufort">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Beaufort Cipher</span></div>
        <div class="control-row">
          <span class="control-label">Key</span>
          <input type="text" id="beaufort-key" placeholder="Enter key..." style="max-width:200px">
          <button class="btn btn-accent" id="beaufort-run">Apply (self-reciprocal)</button>
        </div>
        <div class="output-box mt-8" id="beaufort-output"></div>
      </div>
    </div>

    <!-- Frequency Analysis -->
    <div class="tab-content" id="tab-freq">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Frequency Analysis</span>
          <button class="btn btn-accent btn-small" id="freq-run">Analyze</button>
        </div>
        <div class="two-col mt-8">
          <div>
            <div class="text-sm text-muted mb-12">Character Frequency</div>
            <canvas id="freq-chart" width="400" height="200"></canvas>
          </div>
          <div>
            <div class="text-sm text-muted mb-12">Statistics</div>
            <div id="freq-stats" class="output-box" style="font-size:0.75rem"></div>
            <div class="text-sm text-muted mb-12 mt-16">English Reference</div>
            <div class="text-sm font-mono" style="color:var(--text-secondary)">E T A O I N S H R D L C U M W F G Y P B V K J X Q Z</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Tab switching
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      container.querySelector(`#tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  const getInput = () => container.querySelector('#cipher-input').value;

  // === CAESAR ===
  function caesarShift(text, shift) {
    return text.split('').map(c => {
      if (c >= 'A' && c <= 'Z') return String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26 + 26) % 26 + 65);
      if (c >= 'a' && c <= 'z') return String.fromCharCode(((c.charCodeAt(0) - 97 + shift) % 26 + 26) % 26 + 97);
      return c;
    }).join('');
  }

  container.querySelector('#caesar-shift').addEventListener('input', e => {
    container.querySelector('#caesar-shift-val').textContent = e.target.value;
  });
  container.querySelector('#caesar-encode').addEventListener('click', () => {
    const shift = parseInt(container.querySelector('#caesar-shift').value);
    container.querySelector('#caesar-output').textContent = caesarShift(getInput(), shift);
  });
  container.querySelector('#caesar-decode').addEventListener('click', () => {
    const shift = parseInt(container.querySelector('#caesar-shift').value);
    container.querySelector('#caesar-output').textContent = caesarShift(getInput(), -shift);
  });
  container.querySelector('#caesar-all').addEventListener('click', () => {
    const el = container.querySelector('#caesar-all-output');
    el.classList.toggle('hidden');
    const text = getInput();
    let html = '';
    for (let i = 0; i < 26; i++) {
      html += `<div class="control-row" style="padding:4px 0;border-bottom:1px solid var(--border)">
        <span class="badge badge-accent" style="min-width:60px">ROT-${i.toString().padStart(2,'0')}</span>
        <span class="font-mono">${caesarShift(text, i)}</span>
      </div>`;
    }
    el.innerHTML = html;
  });

  // === VIGENÈRE ===
  function vigenere(text, key, decrypt = false) {
    if (!key) return text;
    key = key.toUpperCase();
    let ki = 0;
    return text.split('').map(c => {
      if (c >= 'A' && c <= 'Z') {
        const shift = decrypt ? -(key.charCodeAt(ki % key.length) - 65) : (key.charCodeAt(ki % key.length) - 65);
        ki++;
        return String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26 + 26) % 26 + 65);
      }
      if (c >= 'a' && c <= 'z') {
        const shift = decrypt ? -(key.charCodeAt(ki % key.length) - 65) : (key.charCodeAt(ki % key.length) - 65);
        ki++;
        return String.fromCharCode(((c.charCodeAt(0) - 97 + shift) % 26 + 26) % 26 + 97);
      }
      return c;
    }).join('');
  }

  container.querySelector('#vig-encode').addEventListener('click', () => {
    container.querySelector('#vig-output').textContent = vigenere(getInput(), container.querySelector('#vig-key').value);
  });
  container.querySelector('#vig-decode').addEventListener('click', () => {
    container.querySelector('#vig-output').textContent = vigenere(getInput(), container.querySelector('#vig-key').value, true);
  });

  // Build Vigenère table
  const tableEl = container.querySelector('#vig-table');
  let tableHTML = '<span style="color:var(--text-muted)">  </span>';
  for (let i = 0; i < 26; i++) tableHTML += `<span style="color:var(--accent)">${String.fromCharCode(65+i)}</span> `;
  tableHTML += '\n';
  for (let i = 0; i < 26; i++) {
    tableHTML += `<span style="color:var(--accent)">${String.fromCharCode(65+i)}</span> `;
    for (let j = 0; j < 26; j++) {
      tableHTML += String.fromCharCode(((i+j)%26)+65) + ' ';
    }
    tableHTML += '\n';
  }
  tableEl.innerHTML = `<pre style="margin:0">${tableHTML}</pre>`;

  // === ATBASH ===
  container.querySelector('#atbash-run').addEventListener('click', () => {
    container.querySelector('#atbash-output').textContent = getInput().split('').map(c => {
      if (c >= 'A' && c <= 'Z') return String.fromCharCode(90 - (c.charCodeAt(0) - 65));
      if (c >= 'a' && c <= 'z') return String.fromCharCode(122 - (c.charCodeAt(0) - 97));
      return c;
    }).join('');
  });

  // === SUBSTITUTION ===
  container.querySelector('#sub-encode').addEventListener('click', () => {
    const alpha = container.querySelector('#sub-alphabet').value.toUpperCase();
    container.querySelector('#sub-output').textContent = getInput().split('').map(c => {
      if (c >= 'A' && c <= 'Z') return alpha[c.charCodeAt(0) - 65];
      if (c >= 'a' && c <= 'z') return alpha[c.charCodeAt(0) - 97].toLowerCase();
      return c;
    }).join('');
  });
  container.querySelector('#sub-decode').addEventListener('click', () => {
    const alpha = container.querySelector('#sub-alphabet').value.toUpperCase();
    container.querySelector('#sub-output').textContent = getInput().split('').map(c => {
      if (c >= 'A' && c <= 'Z') { const i = alpha.indexOf(c); return i >= 0 ? String.fromCharCode(65+i) : c; }
      if (c >= 'a' && c <= 'z') { const i = alpha.indexOf(c.toUpperCase()); return i >= 0 ? String.fromCharCode(97+i) : c; }
      return c;
    }).join('');
  });
  container.querySelector('#sub-random').addEventListener('click', () => {
    const arr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    container.querySelector('#sub-alphabet').value = arr.join('');
  });

  // === RAIL FENCE ===
  function railFenceEncode(text, rails, offset = 0) {
    if (rails < 2) return text;
    const fence = Array.from({length: rails}, () => []);
    let rail = 0, dir = 1;
    for (let i = 0; i < offset; i++) { rail += dir; if (rail === 0 || rail === rails - 1) dir = -dir; }
    for (const c of text) {
      fence[rail].push(c);
      rail += dir;
      if (rail === 0 || rail === rails - 1) dir = -dir;
    }
    return fence.map(r => r.join('')).join('');
  }

  function railFenceDecode(text, rails, offset = 0) {
    if (rails < 2) return text;
    const n = text.length;
    const fence = Array.from({length: rails}, () => []);
    // Determine lengths
    let rail = 0, dir = 1;
    for (let i = 0; i < offset; i++) { rail += dir; if (rail === 0 || rail === rails - 1) dir = -dir; }
    const pattern = [];
    for (let i = 0; i < n; i++) {
      pattern.push(rail);
      fence[rail].push(null);
      rail += dir;
      if (rail === 0 || rail === rails - 1) dir = -dir;
    }
    // Fill
    let idx = 0;
    for (let r = 0; r < rails; r++) {
      for (let j = 0; j < fence[r].length; j++) {
        fence[r][j] = text[idx++];
      }
    }
    // Read off
    const counters = new Array(rails).fill(0);
    return pattern.map(r => fence[r][counters[r]++]).join('');
  }

  container.querySelector('#rail-encode').addEventListener('click', () => {
    const rails = parseInt(container.querySelector('#rail-count').value);
    const offset = parseInt(container.querySelector('#rail-offset').value);
    container.querySelector('#rail-output').textContent = railFenceEncode(getInput(), rails, offset);
  });
  container.querySelector('#rail-decode').addEventListener('click', () => {
    const rails = parseInt(container.querySelector('#rail-count').value);
    const offset = parseInt(container.querySelector('#rail-offset').value);
    container.querySelector('#rail-output').textContent = railFenceDecode(getInput(), rails, offset);
  });

  // === XOR ===
  container.querySelector('#xor-apply').addEventListener('click', () => {
    const text = getInput();
    const keyStr = container.querySelector('#xor-key').value;
    let keyBytes;
    if (keyStr.startsWith('0x')) {
      keyBytes = keyStr.slice(2).match(/.{1,2}/g).map(h => parseInt(h, 16));
    } else {
      keyBytes = keyStr.split('').map(c => c.charCodeAt(0));
    }
    if (!keyBytes.length) return;
    const result = text.split('').map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ keyBytes[i % keyBytes.length])
    ).join('');
    container.querySelector('#xor-output').textContent = result;
  });

  container.querySelector('#xor-brute').addEventListener('click', () => {
    const el = container.querySelector('#xor-brute-output');
    el.classList.remove('hidden');
    const text = getInput();
    let html = '';
    for (let key = 0; key < 256; key++) {
      const result = text.split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ key)).join('');
      const isPrintable = result.split('').every(c => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126);
      if (isPrintable || key < 128) {
        html += `<div class="control-row" style="padding:2px 0;border-bottom:1px solid var(--border)">
          <span class="badge badge-accent" style="min-width:60px">0x${key.toString(16).padStart(2,'0')}</span>
          <span class="font-mono" style="font-size:0.78rem">${result.replace(/</g, '&lt;')}</span>
        </div>`;
      }
    }
    el.innerHTML = html;
  });

  // === AFFINE ===
  function modInverse(a, m) {
    for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
    return null;
  }

  container.querySelector('#affine-encode').addEventListener('click', () => {
    const a = parseInt(container.querySelector('#affine-a').value);
    const b = parseInt(container.querySelector('#affine-b').value);
    container.querySelector('#affine-output').textContent = getInput().split('').map(c => {
      if (c >= 'A' && c <= 'Z') return String.fromCharCode(((a * (c.charCodeAt(0) - 65) + b) % 26) + 65);
      if (c >= 'a' && c <= 'z') return String.fromCharCode(((a * (c.charCodeAt(0) - 97) + b) % 26) + 97);
      return c;
    }).join('');
  });
  container.querySelector('#affine-decode').addEventListener('click', () => {
    const a = parseInt(container.querySelector('#affine-a').value);
    const b = parseInt(container.querySelector('#affine-b').value);
    const aInv = modInverse(a, 26);
    if (!aInv) { container.querySelector('#affine-output').textContent = 'Error: a has no inverse mod 26'; return; }
    container.querySelector('#affine-output').textContent = getInput().split('').map(c => {
      if (c >= 'A' && c <= 'Z') return String.fromCharCode((((aInv * ((c.charCodeAt(0) - 65) - b)) % 26) + 26) % 26 + 65);
      if (c >= 'a' && c <= 'z') return String.fromCharCode((((aInv * ((c.charCodeAt(0) - 97) - b)) % 26) + 26) % 26 + 97);
      return c;
    }).join('');
  });

  // === BEAUFORT ===
  container.querySelector('#beaufort-run').addEventListener('click', () => {
    const key = container.querySelector('#beaufort-key').value.toUpperCase();
    if (!key) return;
    let ki = 0;
    container.querySelector('#beaufort-output').textContent = getInput().split('').map(c => {
      if (c >= 'A' && c <= 'Z') {
        const result = ((key.charCodeAt(ki % key.length) - 65) - (c.charCodeAt(0) - 65) + 26) % 26;
        ki++;
        return String.fromCharCode(result + 65);
      }
      if (c >= 'a' && c <= 'z') {
        const result = ((key.charCodeAt(ki % key.length) - 65) - (c.charCodeAt(0) - 97) + 26) % 26;
        ki++;
        return String.fromCharCode(result + 97);
      }
      return c;
    }).join('');
  });

  // === FREQUENCY ANALYSIS ===
  container.querySelector('#freq-run').addEventListener('click', () => {
    const text = getInput().toUpperCase();
    const freq = {};
    let total = 0;
    for (const c of text) {
      if (c >= 'A' && c <= 'Z') {
        freq[c] = (freq[c] || 0) + 1;
        total++;
      }
    }

    // Draw chart
    const canvas = container.querySelector('#freq-chart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 400, 200);
    const sorted = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => ({ c, count: freq[c] || 0 }));
    const max = Math.max(...sorted.map(s => s.count), 1);
    const barW = 400 / 26;

    sorted.forEach((s, i) => {
      const h = (s.count / max) * 170;
      ctx.fillStyle = s.count > 0 ? '#00d4aa' : '#1c1f2e';
      ctx.fillRect(i * barW + 1, 180 - h, barW - 2, h);
      ctx.fillStyle = '#565b7a';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(s.c, i * barW + barW / 2, 195);
    });

    // Stats
    const sortedByFreq = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    let stats = `Total letters: ${total}\n`;
    stats += `Unique: ${Object.keys(freq).length}\n\n`;
    stats += `Frequency order:\n${sortedByFreq.map(([c, n]) => `${c}: ${n} (${(n/total*100).toFixed(1)}%)`).join('\n')}`;

    // IC
    let ic = 0;
    for (const [, n] of Object.entries(freq)) ic += n * (n - 1);
    ic /= total * (total - 1) || 1;
    stats += `\n\nIndex of Coincidence: ${ic.toFixed(4)}`;
    stats += `\n(English ≈ 0.0667, Random ≈ 0.0385)`;

    container.querySelector('#freq-stats').textContent = stats;
  });
}

Router.register('/toolkit/ciphers', 'ciphers', renderCiphers);
