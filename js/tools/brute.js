// === BRUTE FORCE CIPHER DECODER ===
function renderBrute(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title"><span class="title-accent">◎</span> Brute Force Decoder</h1>
      <p class="page-subtitle">Try every cipher automatically — results ranked by English likelihood</p>
    </div>

    <div class="panel">
      <div class="panel-header"><span class="panel-title">Ciphertext Input</span></div>
      <textarea id="brute-input" placeholder="Paste your ciphertext here…" rows="4"></textarea>
      <div class="brute-controls">
        <button class="btn btn-accent" id="brute-run">⚡ Run All Ciphers</button>
        <span class="brute-count" id="brute-count"></span>
      </div>
    </div>

    <div class="brute-filters" id="brute-filters">
      <span class="brute-filter-label">Methods:</span>
      <label class="brute-chip"><input type="checkbox" value="rot" checked> ROT 1–25</label>
      <label class="brute-chip"><input type="checkbox" value="atbash" checked> Atbash</label>
      <label class="brute-chip"><input type="checkbox" value="reverse" checked> Reverse</label>
      <label class="brute-chip"><input type="checkbox" value="a1z26" checked> A1Z26</label>
      <label class="brute-chip"><input type="checkbox" value="railfence" checked> Rail Fence</label>
      <label class="brute-chip"><input type="checkbox" value="affine" checked> Affine</label>
      <label class="brute-chip"><input type="checkbox" value="vigenere" checked> Vigenère (wordlist)</label>
      <label class="brute-chip"><input type="checkbox" value="morse" checked> Morse</label>
      <label class="brute-chip"><input type="checkbox" value="base64" checked> Base64</label>
      <label class="brute-chip"><input type="checkbox" value="hex" checked> Hex</label>
      <label class="brute-chip"><input type="checkbox" value="binary" checked> Binary</label>
      <label class="brute-chip"><input type="checkbox" value="rot47" checked> ROT47</label>
    </div>

    <div id="brute-results" style="display:none">
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">Results</span>
          <div style="display:flex;gap:6px;align-items:center">
            <span class="text-sm text-muted" id="brute-result-count"></span>
            <button class="btn btn-small" id="brute-show-all">Show all</button>
            <button class="btn btn-small" id="brute-copy-top">Copy top result</button>
          </div>
        </div>
        <div id="brute-table"></div>
      </div>
    </div>
  `;

  // ── English scorer ────────────────────────────────────────────────────────────

  const ENG_FREQ = {E:12.7,T:9.1,A:8.2,O:7.5,I:7.0,N:6.7,S:6.3,H:6.1,R:6.0,D:4.3,
    L:4.0,C:2.8,U:2.8,M:2.4,W:2.4,F:2.2,G:2.0,Y:2.0,P:1.9,B:1.5,V:1.0,K:0.8,J:0.2,X:0.2,Q:0.1,Z:0.1};

  const COMMON_WORDS = new Set(('the be to of and a in that have it for not on with he as you do at this but his by '+
    'from they we say her she or an will my one all would there their what so up out if about who get which go me when '+
    'make can like time no just him know take people into year your good some could them see other than then now look '+
    'only come its over think also back after use two how our work first well way even new want because any these give '+
    'day most us is are was were has had been does did may might shall should flag secret hidden answer password code '+
    'message cipher key puzzle solve level game next hint').toUpperCase().split(' '));

  function scoreEnglish(text) {
    if (!text || !text.trim()) return 0;

    // Printable ratio (hard gate)
    const printable = text.split('').filter(c => { const cc = c.charCodeAt(0); return cc >= 32 && cc <= 126; }).length;
    const printRatio = printable / text.length;
    if (printRatio < 0.8) return 0;

    const upper = text.toUpperCase().replace(/[^A-Z ]/g, '');
    if (upper.replace(/ /g,'').length < 2) return printRatio * 10;

    // Letter frequency correlation
    const freq = {};
    let total = 0;
    for (const c of upper) {
      if (c >= 'A' && c <= 'Z') { freq[c] = (freq[c] || 0) + 1; total++; }
    }

    let freqScore = 0;
    if (total > 0) {
      for (const [c, expected] of Object.entries(ENG_FREQ)) {
        const actual = (freq[c] || 0) / total * 100;
        freqScore += Math.max(0, 1 - Math.abs(actual - expected) / 15);
      }
      freqScore = freqScore / 26 * 100;
    }

    // Common word hit rate
    const words = upper.split(/[\s,.:;!?]+/).filter(w => w.length >= 2);
    const wordScore = words.length
      ? (words.filter(w => COMMON_WORDS.has(w)).length / words.length) * 100
      : 0;

    return freqScore * 0.45 + wordScore * 0.45 + printRatio * 10;
  }

  // ── Cipher implementations ────────────────────────────────────────────────────

  function caesarShift(text, n) {
    return text.split('').map(c => {
      if (c >= 'A' && c <= 'Z') return String.fromCharCode(((c.charCodeAt(0)-65+n)%26+26)%26+65);
      if (c >= 'a' && c <= 'z') return String.fromCharCode(((c.charCodeAt(0)-97+n)%26+26)%26+97);
      return c;
    }).join('');
  }

  function atbash(text) {
    return text.split('').map(c => {
      if (c >= 'A' && c <= 'Z') return String.fromCharCode(90-(c.charCodeAt(0)-65));
      if (c >= 'a' && c <= 'z') return String.fromCharCode(122-(c.charCodeAt(0)-97));
      return c;
    }).join('');
  }

  function a1z26decode(text) {
    // Handle space or dash-separated numbers
    const sep = /[-,\s]+/;
    const parts = text.trim().split(sep);
    if (parts.length < 2) return null;
    const letters = parts.map(p => {
      const n = parseInt(p.trim());
      if (isNaN(n) || n < 1 || n > 26) return null;
      return String.fromCharCode(64 + n);
    });
    if (letters.some(l => l === null)) return null;
    return letters.join('');
  }

  function railFenceDecode(text, rails, offset = 0) {
    if (rails < 2 || rails > text.length) return null;
    const n = text.length;
    const fence = Array.from({length: rails}, () => []);
    let rail = 0, dir = 1;
    for (let i = 0; i < (offset % (2*(rails-1)) || 0); i++) {
      rail += dir;
      if (rail === 0 || rail === rails-1) dir = -dir;
    }
    const pattern = [];
    for (let i = 0; i < n; i++) {
      pattern.push(rail);
      fence[rail].push(null);
      rail += dir;
      if (rail === 0 || rail === rails-1) dir = -dir;
    }
    let idx = 0;
    for (let r = 0; r < rails; r++) {
      for (let j = 0; j < fence[r].length; j++) fence[r][j] = text[idx++];
    }
    const counters = new Array(rails).fill(0);
    return pattern.map(r => fence[r][counters[r]++]).join('');
  }

  function affineDecode(text, a, b) {
    const aInv = (() => { for (let x=1;x<26;x++) if((a*x)%26===1) return x; return null; })();
    if (!aInv) return null;
    return text.split('').map(c => {
      if (c >= 'A' && c <= 'Z') return String.fromCharCode((((aInv*((c.charCodeAt(0)-65)-b))%26)+26)%26+65);
      if (c >= 'a' && c <= 'z') return String.fromCharCode((((aInv*((c.charCodeAt(0)-97)-b))%26)+26)%26+97);
      return c;
    }).join('');
  }

  function vigenereDecode(text, key) {
    key = key.toUpperCase();
    let ki = 0;
    return text.split('').map(c => {
      if (c >= 'A' && c <= 'Z') {
        const r = ((c.charCodeAt(0)-65)-(key.charCodeAt(ki%key.length)-65)+26)%26;
        ki++;
        return String.fromCharCode(r+65);
      }
      if (c >= 'a' && c <= 'z') {
        const r = ((c.charCodeAt(0)-97)-(key.charCodeAt(ki%key.length)-65)+26)%26;
        ki++;
        return String.fromCharCode(r+97);
      }
      return c;
    }).join('');
  }

  const MORSE_MAP = (() => {
    const m = {'.-':'A','-...':'B','-.-.':'C','-..':'D','.':'E','..-.':'F','--.':'G','....':'H','..':'I',
      '.---':'J','-.-':'K','.-..':'L','--':'M','-.':'N','---':'O','.--.':'P','--.-':'Q','.-.':'R',
      '...':'S','-':'T','..-':'U','...-':'V','.--':'W','-..-':'X','-.--':'Y','--..':'Z',
      '-----':'0','.----':'1','..---':'2','...--':'3','....-':'4','.....':'5','-....':'6',
      '--...':'7','---..':'8','----.':'9'};
    return m;
  })();

  function morseDecode(text) {
    // Accept dots/dashes with spaces, or .-/- with / for word sep
    const normalized = text.trim().replace(/[|/\\]/g,' / ');
    const words = normalized.split(/\s*\/\s*/);
    let result = '';
    for (const word of words) {
      const letters = word.trim().split(/\s+/);
      for (const letter of letters) {
        if (!letter) continue;
        const decoded = MORSE_MAP[letter];
        if (!decoded) return null; // invalid morse
        result += decoded;
      }
      result += ' ';
    }
    return result.trim() || null;
  }

  function base64Decode(text) {
    try {
      const cleaned = text.trim().replace(/\s/g,'');
      if (!/^[A-Za-z0-9+/=]+$/.test(cleaned)) return null;
      const decoded = atob(cleaned);
      // Check if printable
      if (decoded.split('').every(c => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126)) {
        return decoded;
      }
      return null;
    } catch { return null; }
  }

  function hexDecode(text) {
    try {
      const cleaned = text.trim().replace(/\s/g,'').replace(/^0x/i,'');
      if (!/^[0-9a-fA-F]+$/.test(cleaned) || cleaned.length % 2 !== 0) return null;
      const bytes = cleaned.match(/.{2}/g).map(h => parseInt(h,16));
      const str = bytes.map(b => String.fromCharCode(b)).join('');
      if (str.split('').some(c => c.charCodeAt(0) < 32 && c.charCodeAt(0) !== 10 && c.charCodeAt(0) !== 13)) return null;
      return str;
    } catch { return null; }
  }

  function binaryDecode(text) {
    try {
      const cleaned = text.trim().replace(/\s/g,'');
      if (!/^[01]+$/.test(cleaned) || cleaned.length % 8 !== 0) return null;
      const bytes = cleaned.match(/.{8}/g).map(b => parseInt(b,2));
      const str = bytes.map(b => String.fromCharCode(b)).join('');
      if (str.split('').some(c => c.charCodeAt(0) < 32 && c.charCodeAt(0) !== 10)) return null;
      return str;
    } catch { return null; }
  }

  function rot47(text) {
    return text.split('').map(c => {
      const cc = c.charCodeAt(0);
      if (cc >= 33 && cc <= 126) return String.fromCharCode(33+((cc-33+47)%94));
      return c;
    }).join('');
  }

  // ── Main brute runner ─────────────────────────────────────────────────────────

  const AFFINE_A_VALS = [3,5,7,9,11,15,17,19,21,23,25]; // skip a=1 (identity = ROT0)

  const VIGENERE_KEYS = [
    'KEY','FLAG','CTF','SECRET','HIDDEN','CIPHER','DECODE','CRYPTO','PUZZLE',
    'SOLVE','ANSWER','PASS','CODE','MESSAGE','LEMON','MAGIC','ALPHA','BETA',
    'GAMMA','DELTA','OMEGA','SIGMA','CROWN','LIGHT','DARK','FIRE','WATER',
    'EARTH','WIND','SPACE','TIME','MIND','SOUL','LOVE','HATE','GOOD','EVIL',
    'TRUE','SAFE','OPEN','LOCK','DOOR','GATE','ROCK','STAR','MOON','SUN',
  ];

  function runAll(text, enabled) {
    const results = [];

    const add = (method, params, result) => {
      if (!result) return;
      const score = scoreEnglish(result);
      results.push({ method, params, result, score });
    };

    if (enabled.has('rot')) {
      for (let n = 1; n <= 25; n++) add('ROT', `shift=${n}`, caesarShift(text, n));
    }

    if (enabled.has('atbash')) {
      add('Atbash', '—', atbash(text));
    }

    if (enabled.has('reverse')) {
      add('Reverse', '—', text.split('').reverse().join(''));
      // Reverse words too
      add('Reverse words', '—', text.split(' ').reverse().join(' '));
    }

    if (enabled.has('a1z26')) {
      add('A1Z26', '—', a1z26decode(text));
    }

    if (enabled.has('railfence')) {
      for (let r = 2; r <= 8; r++) {
        add('Rail Fence', `rails=${r}`, railFenceDecode(text, r));
      }
    }

    if (enabled.has('affine')) {
      for (const a of AFFINE_A_VALS) {
        for (let b = 0; b < 26; b++) {
          add('Affine', `a=${a},b=${b}`, affineDecode(text, a, b));
        }
      }
    }

    if (enabled.has('vigenere')) {
      for (const key of VIGENERE_KEYS) {
        add('Vigenère', `key=${key}`, vigenereDecode(text, key));
      }
    }

    if (enabled.has('morse')) add('Morse', '—', morseDecode(text));
    if (enabled.has('base64')) add('Base64', '—', base64Decode(text));
    if (enabled.has('hex'))    add('Hex',    '—', hexDecode(text));
    if (enabled.has('binary')) add('Binary', '—', binaryDecode(text));
    if (enabled.has('rot47'))  add('ROT47',  '—', rot47(text));

    return results.sort((a, b) => b.score - a.score);
  }

  // ── Render results ────────────────────────────────────────────────────────────

  let allResults = [];
  let showAll    = false;

  function renderTable() {
    const SHOW_N   = 25;
    const toShow   = showAll ? allResults : allResults.slice(0, SHOW_N);
    const tableEl  = container.querySelector('#brute-table');
    const showBtn  = container.querySelector('#brute-show-all');
    const countEl  = container.querySelector('#brute-result-count');

    countEl.textContent = `${allResults.length} attempts`;
    showBtn.style.display = allResults.length > SHOW_N ? '' : 'none';
    showBtn.textContent   = showAll ? 'Show less' : `Show all ${allResults.length}`;

    if (!toShow.length) {
      tableEl.innerHTML = '<div class="text-muted" style="padding:16px">No readable results found.</div>';
      return;
    }

    tableEl.innerHTML = `
      <div class="brute-table-head">
        <span class="bt-score">Score</span>
        <span class="bt-method">Method</span>
        <span class="bt-params">Parameters</span>
        <span class="bt-result">Result</span>
        <span class="bt-action"></span>
      </div>
      ${toShow.map((r, i) => `
        <div class="brute-row${i === 0 ? ' brute-row-top' : ''}${r.score < 20 ? ' brute-row-dim' : ''}">
          <span class="bt-score">
            <span class="brute-score-bar" style="width:${Math.min(100,r.score)}%"></span>
            <span class="brute-score-num">${r.score.toFixed(0)}</span>
          </span>
          <span class="bt-method">${esc(r.method)}</span>
          <span class="bt-params">${esc(r.params)}</span>
          <span class="bt-result">${esc(r.result.slice(0, 120))}${r.result.length > 120 ? '…' : ''}</span>
          <span class="bt-action">
            <button class="btn btn-small brute-copy-btn" data-idx="${i}">Copy</button>
          </span>
        </div>
      `).join('')}
    `;

    tableEl.querySelectorAll('.brute-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(toShow[parseInt(btn.dataset.idx)].result);
        btn.textContent = 'OK!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1200);
      });
    });
  }

  function esc(s = '') {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Event listeners ───────────────────────────────────────────────────────────

  container.querySelector('#brute-run').addEventListener('click', () => {
    const text = container.querySelector('#brute-input').value;
    if (!text.trim()) return;

    const enabled = new Set(
      [...container.querySelectorAll('.brute-chip input:checked')].map(cb => cb.value)
    );

    const btn   = container.querySelector('#brute-run');
    const count = container.querySelector('#brute-count');
    btn.textContent = 'Running…';
    btn.disabled    = true;

    // Defer to allow repaint
    setTimeout(() => {
      allResults = runAll(text, enabled);
      showAll    = false;

      container.querySelector('#brute-results').style.display = '';
      renderTable();

      // Update top copy button
      container.querySelector('#brute-copy-top').onclick = () => {
        if (allResults.length) navigator.clipboard.writeText(allResults[0].result);
      };

      count.textContent = `${allResults.length} results`;
      btn.textContent   = '⚡ Run All Ciphers';
      btn.disabled      = false;
    }, 10);
  });

  container.querySelector('#brute-show-all').addEventListener('click', () => {
    showAll = !showAll;
    renderTable();
  });
}

Router.register('/toolkit/brute', 'brute', renderBrute);
