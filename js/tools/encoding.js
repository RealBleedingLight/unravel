// === ENCODING / HASHING ===
function renderEncoding(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title"><span class="title-accent">◇</span> Encoding / Hashing</h1>
      <p class="page-subtitle">Base64, Hex, Binary, URL, HTML entities, hashes, number bases</p>
    </div>

    <div class="panel">
      <div class="panel-header"><span class="panel-title">Input</span></div>
      <textarea id="enc-input" placeholder="Enter text to encode/decode..." rows="3"></textarea>
    </div>

    <div class="tab-bar">
      <button class="tab-btn active" data-tab="base">Base Encodings</button>
      <button class="tab-btn" data-tab="hex">Hex / Binary</button>
      <button class="tab-btn" data-tab="url">URL / HTML</button>
      <button class="tab-btn" data-tab="hash">Hashing</button>
      <button class="tab-btn" data-tab="numbers">Number Bases</button>
      <button class="tab-btn" data-tab="a1z26">A1Z26 / Numeric</button>
    </div>

    <!-- Base Encodings -->
    <div class="tab-content active" id="tab-base">
      <div class="panel">
        <div class="control-row">
          <button class="btn btn-accent" id="b64-encode">Base64 Encode</button>
          <button class="btn" id="b64-decode">Base64 Decode</button>
          <button class="btn" id="b32-encode">Base32 Encode</button>
          <button class="btn" id="b32-decode">Base32 Decode</button>
        </div>
        <div class="output-box mt-8" id="base-output"></div>
        <div class="mt-16">
          <div class="text-sm text-muted mb-12">Multi-decode (tries multiple encodings)</div>
          <button class="btn btn-accent btn-small" id="multi-decode">Auto-detect & Decode</button>
          <div class="output-box mt-8" id="multi-output" style="max-height:300px;overflow:auto"></div>
        </div>
      </div>
    </div>

    <!-- Hex / Binary -->
    <div class="tab-content" id="tab-hex">
      <div class="panel">
        <div class="control-row">
          <button class="btn" id="hex-to-text">Hex → Text</button>
          <button class="btn" id="text-to-hex">Text → Hex</button>
          <button class="btn" id="bin-to-text">Binary → Text</button>
          <button class="btn" id="text-to-bin">Text → Binary</button>
          <button class="btn" id="dec-to-text">Decimal → Text</button>
          <button class="btn" id="text-to-dec">Text → Decimal</button>
          <button class="btn" id="oct-to-text">Octal → Text</button>
          <button class="btn" id="text-to-oct">Text → Octal</button>
        </div>
        <div class="output-box mt-8" id="hex-output"></div>
      </div>
    </div>

    <!-- URL / HTML -->
    <div class="tab-content" id="tab-url">
      <div class="panel">
        <div class="control-row">
          <button class="btn" id="url-encode">URL Encode</button>
          <button class="btn" id="url-decode">URL Decode</button>
          <button class="btn" id="html-encode">HTML Entities Encode</button>
          <button class="btn" id="html-decode">HTML Entities Decode</button>
          <button class="btn" id="unicode-escape">Unicode Escape</button>
          <button class="btn" id="unicode-unescape">Unicode Unescape</button>
        </div>
        <div class="output-box mt-8" id="url-output"></div>
      </div>
    </div>

    <!-- Hashing -->
    <div class="tab-content" id="tab-hash">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Hash Functions</span>
          <button class="btn btn-accent btn-small" id="hash-all">Compute All</button>
        </div>
        <div id="hash-results" class="mt-8"></div>
      </div>
    </div>

    <!-- Number Bases -->
    <div class="tab-content" id="tab-numbers">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Number Base Converter</span></div>
        <div class="control-row">
          <span class="control-label">From Base</span>
          <input type="number" id="num-from-base" value="10" min="2" max="36" style="max-width:80px">
          <span class="control-label">To Base</span>
          <input type="number" id="num-to-base" value="16" min="2" max="36" style="max-width:80px">
          <button class="btn btn-accent" id="num-convert">Convert</button>
        </div>
        <div class="output-box mt-8" id="num-output"></div>
        <div class="mt-16">
          <div class="text-sm text-muted mb-12">Quick conversions of input</div>
          <button class="btn btn-small" id="num-all-bases">Show Common Bases</button>
          <div id="num-all-output" class="mt-8"></div>
        </div>
      </div>
    </div>

    <!-- A1Z26 -->
    <div class="tab-content" id="tab-a1z26">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">A1Z26 / Letter-Number Encoding</span></div>
        <div class="control-row">
          <button class="btn" id="a1z26-encode">Letters → Numbers</button>
          <button class="btn" id="a1z26-decode">Numbers → Letters</button>
          <span class="control-label">Separator</span>
          <select id="a1z26-sep" style="max-width:120px">
            <option value=" ">Space</option>
            <option value="-">Dash</option>
            <option value=",">Comma</option>
            <option value=".">Period</option>
          </select>
        </div>
        <div class="output-box mt-8" id="a1z26-output"></div>
        <div class="mt-16">
          <div class="text-sm text-muted mb-12">ASCII Values</div>
          <button class="btn btn-small" id="ascii-dump">Show ASCII Values</button>
          <div class="output-box mt-8" id="ascii-output" style="max-height:200px;overflow:auto"></div>
        </div>
      </div>
    </div>
  `;

  // Tabs
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      container.querySelector(`#tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  const getInput = () => container.querySelector('#enc-input').value;

  // === BASE64 ===
  container.querySelector('#b64-encode').addEventListener('click', () => {
    try { container.querySelector('#base-output').textContent = btoa(getInput()); }
    catch(e) { container.querySelector('#base-output').textContent = btoa(unescape(encodeURIComponent(getInput()))); }
  });
  container.querySelector('#b64-decode').addEventListener('click', () => {
    try { container.querySelector('#base-output').textContent = atob(getInput().trim()); }
    catch(e) { container.querySelector('#base-output').textContent = 'Invalid Base64: ' + e.message; }
  });

  // === BASE32 ===
  const b32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  function base32Encode(str) {
    const bytes = new TextEncoder().encode(str);
    let bits = '', result = '';
    for (const b of bytes) bits += b.toString(2).padStart(8, '0');
    while (bits.length % 5) bits += '0';
    for (let i = 0; i < bits.length; i += 5) result += b32Chars[parseInt(bits.slice(i, i+5), 2)];
    while (result.length % 8) result += '=';
    return result;
  }
  function base32Decode(str) {
    str = str.replace(/=/g, '').toUpperCase();
    let bits = '';
    for (const c of str) { const i = b32Chars.indexOf(c); if (i < 0) continue; bits += i.toString(2).padStart(5, '0'); }
    const bytes = [];
    for (let i = 0; i + 7 < bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i+8), 2));
    return new TextDecoder().decode(new Uint8Array(bytes));
  }

  container.querySelector('#b32-encode').addEventListener('click', () => {
    container.querySelector('#base-output').textContent = base32Encode(getInput());
  });
  container.querySelector('#b32-decode').addEventListener('click', () => {
    try { container.querySelector('#base-output').textContent = base32Decode(getInput()); }
    catch(e) { container.querySelector('#base-output').textContent = 'Invalid Base32'; }
  });

  // Multi-decode
  container.querySelector('#multi-decode').addEventListener('click', () => {
    const input = getInput().trim();
    const results = [];

    try { const d = atob(input); if (/^[\x20-\x7E\n\r\t]+$/.test(d)) results.push({ method: 'Base64', result: d }); } catch {}
    try { const d = base32Decode(input); if (d && /^[\x20-\x7E\n\r\t]+$/.test(d)) results.push({ method: 'Base32', result: d }); } catch {}
    try { const d = decodeURIComponent(input); if (d !== input) results.push({ method: 'URL Decode', result: d }); } catch {}

    // Hex
    const hexClean = input.replace(/[^0-9a-fA-F]/g, '');
    if (hexClean.length > 0 && hexClean.length % 2 === 0) {
      const hexResult = hexClean.match(/.{2}/g).map(h => String.fromCharCode(parseInt(h, 16))).join('');
      if (/^[\x20-\x7E\n\r\t]+$/.test(hexResult)) results.push({ method: 'Hex → ASCII', result: hexResult });
    }

    // Binary
    const binClean = input.replace(/[^01]/g, '');
    if (binClean.length >= 8 && binClean.length % 8 === 0) {
      const binResult = binClean.match(/.{8}/g).map(b => String.fromCharCode(parseInt(b, 2))).join('');
      if (/^[\x20-\x7E]+$/.test(binResult)) results.push({ method: 'Binary → ASCII', result: binResult });
    }

    // Decimal
    const nums = input.split(/[\s,]+/).filter(n => /^\d+$/.test(n) && parseInt(n) >= 32 && parseInt(n) <= 126);
    if (nums.length > 2) {
      results.push({ method: 'Decimal → ASCII', result: nums.map(n => String.fromCharCode(parseInt(n))).join('') });
    }

    // ROT13
    results.push({ method: 'ROT13', result: input.split('').map(c => {
      if (c >= 'A' && c <= 'Z') return String.fromCharCode(((c.charCodeAt(0) - 65 + 13) % 26) + 65);
      if (c >= 'a' && c <= 'z') return String.fromCharCode(((c.charCodeAt(0) - 97 + 13) % 26) + 97);
      return c;
    }).join('') });

    // Reverse
    results.push({ method: 'Reversed', result: input.split('').reverse().join('') });

    const el = container.querySelector('#multi-output');
    el.innerHTML = results.map(r => `
      <div style="padding:8px 0;border-bottom:1px solid var(--border)">
        <span class="badge badge-accent">${r.method}</span>
        <div class="font-mono mt-8" style="color:var(--accent)">${r.result}</div>
      </div>
    `).join('');
  });

  // === HEX / BINARY ===
  container.querySelector('#text-to-hex').addEventListener('click', () => {
    container.querySelector('#hex-output').textContent = getInput().split('').map(c => c.charCodeAt(0).toString(16).padStart(2,'0')).join(' ');
  });
  container.querySelector('#hex-to-text').addEventListener('click', () => {
    const hex = getInput().replace(/[^0-9a-fA-F]/g, '');
    container.querySelector('#hex-output').textContent = hex.match(/.{1,2}/g)?.map(h => String.fromCharCode(parseInt(h,16))).join('') || '';
  });
  container.querySelector('#text-to-bin').addEventListener('click', () => {
    container.querySelector('#hex-output').textContent = getInput().split('').map(c => c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ');
  });
  container.querySelector('#bin-to-text').addEventListener('click', () => {
    const bin = getInput().replace(/[^01]/g, '');
    container.querySelector('#hex-output').textContent = bin.match(/.{1,8}/g)?.map(b => String.fromCharCode(parseInt(b,2))).join('') || '';
  });
  container.querySelector('#text-to-dec').addEventListener('click', () => {
    container.querySelector('#hex-output').textContent = getInput().split('').map(c => c.charCodeAt(0)).join(' ');
  });
  container.querySelector('#dec-to-text').addEventListener('click', () => {
    container.querySelector('#hex-output').textContent = getInput().split(/[\s,]+/).map(n => String.fromCharCode(parseInt(n))).join('');
  });
  container.querySelector('#text-to-oct').addEventListener('click', () => {
    container.querySelector('#hex-output').textContent = getInput().split('').map(c => c.charCodeAt(0).toString(8).padStart(3,'0')).join(' ');
  });
  container.querySelector('#oct-to-text').addEventListener('click', () => {
    container.querySelector('#hex-output').textContent = getInput().split(/[\s,]+/).map(n => String.fromCharCode(parseInt(n,8))).join('');
  });

  // === URL / HTML ===
  container.querySelector('#url-encode').addEventListener('click', () => {
    container.querySelector('#url-output').textContent = encodeURIComponent(getInput());
  });
  container.querySelector('#url-decode').addEventListener('click', () => {
    try { container.querySelector('#url-output').textContent = decodeURIComponent(getInput()); }
    catch(e) { container.querySelector('#url-output').textContent = 'Invalid URL encoding'; }
  });
  container.querySelector('#html-encode').addEventListener('click', () => {
    container.querySelector('#url-output').textContent = getInput().split('').map(c => `&#${c.charCodeAt(0)};`).join('');
  });
  container.querySelector('#html-decode').addEventListener('click', () => {
    const tmp = document.createElement('textarea');
    tmp.innerHTML = getInput();
    container.querySelector('#url-output').textContent = tmp.value;
  });
  container.querySelector('#unicode-escape').addEventListener('click', () => {
    container.querySelector('#url-output').textContent = getInput().split('').map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4,'0')}`).join('');
  });
  container.querySelector('#unicode-unescape').addEventListener('click', () => {
    try {
      container.querySelector('#url-output').textContent = getInput().replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    } catch(e) { container.querySelector('#url-output').textContent = 'Invalid unicode escapes'; }
  });

  // === HASHING ===
  container.querySelector('#hash-all').addEventListener('click', async () => {
    const text = getInput();
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const results = {};

    for (const algo of ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']) {
      try {
        const hash = await crypto.subtle.digest(algo, data);
        results[algo] = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
      } catch { results[algo] = 'Not available'; }
    }

    // Simple MD5 (basic implementation)
    results['MD5 (basic)'] = simpleMD5(text);

    const el = container.querySelector('#hash-results');
    el.innerHTML = Object.entries(results).map(([algo, hash]) => `
      <div class="control-row" style="border-bottom:1px solid var(--border);padding:8px 0">
        <span class="control-label" style="min-width:100px;color:var(--accent2)">${algo}</span>
        <span class="font-mono text-sm" style="word-break:break-all;cursor:pointer" onclick="navigator.clipboard.writeText('${hash}')" title="Click to copy">${hash}</span>
      </div>
    `).join('');
  });

  function simpleMD5(str) {
    // Basic MD5 — for puzzle use, not security
    function md5cycle(x, k) {
      let a = x[0], b = x[1], c = x[2], d = x[3];
      a = ff(a,b,c,d,k[0],7,-680876936); d = ff(d,a,b,c,k[1],12,-389564586);
      c = ff(c,d,a,b,k[2],17,606105819); b = ff(b,c,d,a,k[3],22,-1044525330);
      a = ff(a,b,c,d,k[4],7,-176418897); d = ff(d,a,b,c,k[5],12,1200080426);
      c = ff(c,d,a,b,k[6],17,-1473231341); b = ff(b,c,d,a,k[7],22,-45705983);
      a = ff(a,b,c,d,k[8],7,1770035416); d = ff(d,a,b,c,k[9],12,-1958414417);
      c = ff(c,d,a,b,k[10],17,-42063); b = ff(b,c,d,a,k[11],22,-1990404162);
      a = ff(a,b,c,d,k[12],7,1804603682); d = ff(d,a,b,c,k[13],12,-40341101);
      c = ff(c,d,a,b,k[14],17,-1502002290); b = ff(b,c,d,a,k[15],22,1236535329);
      a = gg(a,b,c,d,k[1],5,-165796510); d = gg(d,a,b,c,k[6],9,-1069501632);
      c = gg(c,d,a,b,k[11],14,643717713); b = gg(b,c,d,a,k[0],20,-373897302);
      a = gg(a,b,c,d,k[5],5,-701558691); d = gg(d,a,b,c,k[10],9,38016083);
      c = gg(c,d,a,b,k[15],14,-660478335); b = gg(b,c,d,a,k[4],20,-405537848);
      a = gg(a,b,c,d,k[9],5,568446438); d = gg(d,a,b,c,k[14],9,-1019803690);
      c = gg(c,d,a,b,k[3],14,-187363961); b = gg(b,c,d,a,k[8],20,1163531501);
      a = gg(a,b,c,d,k[13],5,-1444681467); d = gg(d,a,b,c,k[2],9,-51403784);
      c = gg(c,d,a,b,k[7],14,1735328473); b = gg(b,c,d,a,k[12],20,-1926607734);
      a = hh(a,b,c,d,k[5],4,-378558); d = hh(d,a,b,c,k[8],11,-2022574463);
      c = hh(c,d,a,b,k[11],16,1839030562); b = hh(b,c,d,a,k[14],23,-35309556);
      a = hh(a,b,c,d,k[1],4,-1530992060); d = hh(d,a,b,c,k[4],11,1272893353);
      c = hh(c,d,a,b,k[7],16,-155497632); b = hh(b,c,d,a,k[10],23,-1094730640);
      a = hh(a,b,c,d,k[13],4,681279174); d = hh(d,a,b,c,k[0],11,-358537222);
      c = hh(c,d,a,b,k[3],16,-722521979); b = hh(b,c,d,a,k[6],23,76029189);
      a = hh(a,b,c,d,k[9],4,-640364487); d = hh(d,a,b,c,k[12],11,-421815835);
      c = hh(c,d,a,b,k[15],16,530742520); b = hh(b,c,d,a,k[2],23,-995338651);
      a = ii(a,b,c,d,k[0],6,-198630844); d = ii(d,a,b,c,k[7],10,1126891415);
      c = ii(c,d,a,b,k[14],15,-1416354905); b = ii(b,c,d,a,k[5],21,-57434055);
      a = ii(a,b,c,d,k[12],6,1700485571); d = ii(d,a,b,c,k[3],10,-1894986606);
      c = ii(c,d,a,b,k[10],15,-1051523); b = ii(b,c,d,a,k[1],21,-2054922799);
      a = ii(a,b,c,d,k[8],6,1873313359); d = ii(d,a,b,c,k[15],10,-30611744);
      c = ii(c,d,a,b,k[6],15,-1560198380); b = ii(b,c,d,a,k[13],21,1309151649);
      a = ii(a,b,c,d,k[4],6,-145523070); d = ii(d,a,b,c,k[11],10,-1120210379);
      c = ii(c,d,a,b,k[2],15,718787259); b = ii(b,c,d,a,k[9],21,-343485551);
      x[0] = add32(a,x[0]); x[1] = add32(b,x[1]); x[2] = add32(c,x[2]); x[3] = add32(d,x[3]);
    }
    function cmn(q,a,b,x,s,t) { a = add32(add32(a,q),add32(x,t)); return add32((a<<s)|(a>>>(32-s)),b); }
    function ff(a,b,c,d,x,s,t) { return cmn((b&c)|((~b)&d),a,b,x,s,t); }
    function gg(a,b,c,d,x,s,t) { return cmn((b&d)|(c&(~d)),a,b,x,s,t); }
    function hh(a,b,c,d,x,s,t) { return cmn(b^c^d,a,b,x,s,t); }
    function ii(a,b,c,d,x,s,t) { return cmn(c^(b|(~d)),a,b,x,s,t); }
    function add32(a,b) { return (a+b)&0xFFFFFFFF; }

    const n = str.length;
    let state = [1732584193,-271733879,-1732584194,271733878];
    let tail = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    for (let i = 0; i < 64; i++) {
      const blk = Math.floor(i/4);
      tail[blk] |= (i < n ? str.charCodeAt(i) : (i === n ? 0x80 : 0)) << ((i%4)*8);
    }
    if (n >= 56) { md5cycle(state, tail); tail = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; }
    tail[14] = n * 8;
    md5cycle(state, tail);

    return state.map(s => {
      let hex = '';
      for (let i = 0; i < 4; i++) hex += ((s >> (i*8)) & 0xFF).toString(16).padStart(2,'0');
      return hex;
    }).join('');
  }

  // === NUMBER BASES ===
  container.querySelector('#num-convert').addEventListener('click', () => {
    const fromBase = parseInt(container.querySelector('#num-from-base').value);
    const toBase = parseInt(container.querySelector('#num-to-base').value);
    try {
      const num = parseInt(getInput().trim(), fromBase);
      container.querySelector('#num-output').textContent = num.toString(toBase).toUpperCase();
    } catch(e) { container.querySelector('#num-output').textContent = 'Invalid number for base ' + fromBase; }
  });

  container.querySelector('#num-all-bases').addEventListener('click', () => {
    const input = getInput().trim();
    // Try to parse as decimal first
    let num;
    try { num = parseInt(input, 10); } catch { num = NaN; }
    if (isNaN(num)) { return; }
    const el = container.querySelector('#num-all-output');
    el.innerHTML = [
      { name: 'Binary (2)', val: num.toString(2) },
      { name: 'Octal (8)', val: num.toString(8) },
      { name: 'Decimal (10)', val: num.toString(10) },
      { name: 'Hex (16)', val: num.toString(16).toUpperCase() },
      { name: 'Base32', val: num.toString(32).toUpperCase() },
      { name: 'Base36', val: num.toString(36).toUpperCase() },
    ].map(r => `
      <div class="control-row" style="border-bottom:1px solid var(--border);padding:4px 0">
        <span class="control-label" style="min-width:100px">${r.name}</span>
        <span class="font-mono text-accent">${r.val}</span>
      </div>
    `).join('');
  });

  // === A1Z26 ===
  container.querySelector('#a1z26-encode').addEventListener('click', () => {
    const sep = container.querySelector('#a1z26-sep').value;
    container.querySelector('#a1z26-output').textContent = getInput().toUpperCase().split('').map(c => {
      if (c >= 'A' && c <= 'Z') return c.charCodeAt(0) - 64;
      if (c === ' ') return '/';
      return c;
    }).join(sep);
  });
  container.querySelector('#a1z26-decode').addEventListener('click', () => {
    const nums = getInput().split(/[\s,\-\.]+/);
    container.querySelector('#a1z26-output').textContent = nums.map(n => {
      if (n === '/' || n === '') return ' ';
      const num = parseInt(n);
      if (num >= 1 && num <= 26) return String.fromCharCode(64 + num);
      return '?';
    }).join('');
  });

  container.querySelector('#ascii-dump').addEventListener('click', () => {
    container.querySelector('#ascii-output').textContent = getInput().split('').map(c =>
      `'${c}' → ${c.charCodeAt(0)} (0x${c.charCodeAt(0).toString(16)}) (0b${c.charCodeAt(0).toString(2).padStart(8,'0')})`
    ).join('\n');
  });
}

Router.register('/toolkit/encoding', 'encoding', renderEncoding);
