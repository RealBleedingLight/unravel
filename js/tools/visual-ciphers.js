// === VISUAL CIPHERS ===
function renderVisualCiphers(container) {
  const morseMap = {'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','.'  :'.-.-.-',','  :'--..--','?'  :'..--..','!':'-.-.--'};
  const morseReverse = {};
  Object.entries(morseMap).forEach(([k,v]) => morseReverse[v] = k);

  const brailleMap = {'A':'⠁','B':'⠃','C':'⠉','D':'⠙','E':'⠑','F':'⠋','G':'⠛','H':'⠓','I':'⠊','J':'⠚','K':'⠅','L':'⠇','M':'⠍','N':'⠝','O':'⠕','P':'⠏','Q':'⠟','R':'⠗','S':'⠎','T':'⠞','U':'⠥','V':'⠧','W':'⠺','X':'⠭','Y':'⠽','Z':'⠵','1':'⠁','2':'⠃','3':'⠉','4':'⠙','5':'⠑','6':'⠋','7':'⠛','8':'⠓','9':'⠊','0':'⠚'};
  const brailleReverse = {};
  Object.entries(brailleMap).forEach(([k,v]) => { if (k.length === 1 && k >= 'A') brailleReverse[v] = k; });

  const natoMap = {'A':'Alpha','B':'Bravo','C':'Charlie','D':'Delta','E':'Echo','F':'Foxtrot','G':'Golf','H':'Hotel','I':'India','J':'Juliet','K':'Kilo','L':'Lima','M':'Mike','N':'November','O':'Oscar','P':'Papa','Q':'Quebec','R':'Romeo','S':'Sierra','T':'Tango','U':'Uniform','V':'Victor','W':'Whiskey','X':'X-ray','Y':'Yankee','Z':'Zulu','0':'Zero','1':'One','2':'Two','3':'Three','4':'Four','5':'Five','6':'Six','7':'Seven','8':'Eight','9':'Niner'};
  const natoReverse = {};
  Object.entries(natoMap).forEach(([k,v]) => natoReverse[v.toLowerCase()] = k);

  const tapCodeGrid = [['A','B','C','K','D'],['E','F','G','H','I'],['L','M','N','O','P'],['Q','R','S','T','U'],['V','W','X','Y','Z']]; // K replaces C in standard, but keeping both

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title"><span class="title-accent">◫</span> Visual Ciphers</h1>
      <p class="page-subtitle">Morse, Braille, Semaphore, Pigpen, NATO phonetic, Tap code</p>
    </div>

    <div class="panel">
      <div class="panel-header"><span class="panel-title">Input</span></div>
      <textarea id="vis-input" placeholder="Enter text to encode/decode..." rows="2"></textarea>
    </div>

    <div class="tab-bar">
      <button class="tab-btn active" data-tab="morse">Morse Code</button>
      <button class="tab-btn" data-tab="braille">Braille</button>
      <button class="tab-btn" data-tab="nato">NATO Phonetic</button>
      <button class="tab-btn" data-tab="pigpen">Pigpen</button>
      <button class="tab-btn" data-tab="tap">Tap Code</button>
      <button class="tab-btn" data-tab="semaphore">Semaphore</button>
      <button class="tab-btn" data-tab="bacon">Bacon's Cipher</button>
    </div>

    <!-- Morse -->
    <div class="tab-content active" id="tab-morse">
      <div class="panel">
        <div class="control-row">
          <button class="btn btn-accent" id="morse-encode">Text → Morse</button>
          <button class="btn" id="morse-decode">Morse → Text</button>
        </div>
        <div class="output-box mt-8" id="morse-output" style="font-size:1.1rem;letter-spacing:2px"></div>
        <div class="mt-16">
          <div class="text-sm text-muted mb-12">Reference</div>
          <div class="morse-ref" id="morse-ref"></div>
        </div>
      </div>
    </div>

    <!-- Braille -->
    <div class="tab-content" id="tab-braille">
      <div class="panel">
        <div class="control-row">
          <button class="btn btn-accent" id="braille-encode">Text → Braille</button>
          <button class="btn" id="braille-decode">Braille → Text</button>
        </div>
        <div class="output-box mt-8" id="braille-output" style="font-size:1.8rem;letter-spacing:4px"></div>
        <div class="mt-16">
          <div class="text-sm text-muted mb-12">Reference</div>
          <div class="braille-ref" id="braille-ref"></div>
        </div>
      </div>
    </div>

    <!-- NATO -->
    <div class="tab-content" id="tab-nato">
      <div class="panel">
        <div class="control-row">
          <button class="btn btn-accent" id="nato-encode">Text → NATO</button>
          <button class="btn" id="nato-decode">NATO → Text</button>
        </div>
        <div class="output-box mt-8" id="nato-output"></div>
      </div>
    </div>

    <!-- Pigpen -->
    <div class="tab-content" id="tab-pigpen">
      <div class="panel">
        <div class="control-row">
          <button class="btn btn-accent" id="pigpen-encode">Text → Pigpen</button>
        </div>
        <div id="pigpen-output" class="mt-8" style="display:flex;gap:4px;flex-wrap:wrap;min-height:60px"></div>
        <div class="mt-16">
          <div class="text-sm text-muted mb-12">Pigpen Reference</div>
          <div id="pigpen-ref" style="display:flex;gap:8px;flex-wrap:wrap"></div>
        </div>
      </div>
    </div>

    <!-- Tap Code -->
    <div class="tab-content" id="tab-tap">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Tap Code (Polybius)</span>
          <span class="badge badge-purple">K=C in standard grid</span>
        </div>
        <div class="control-row">
          <button class="btn btn-accent" id="tap-encode">Text → Taps</button>
          <button class="btn" id="tap-decode">Taps → Text</button>
        </div>
        <div class="output-box mt-8" id="tap-output"></div>
        <div class="mt-16">
          <div class="text-sm text-muted mb-12">Tap Code Grid</div>
          <div id="tap-grid" style="font-family:var(--font-mono)"></div>
        </div>
      </div>
    </div>

    <!-- Semaphore -->
    <div class="tab-content" id="tab-semaphore">
      <div class="panel">
        <div class="control-row">
          <button class="btn btn-accent" id="sema-encode">Text → Semaphore</button>
        </div>
        <div id="sema-output" class="mt-8" style="display:flex;gap:8px;flex-wrap:wrap;min-height:80px"></div>
      </div>
    </div>

    <!-- Bacon's Cipher -->
    <div class="tab-content" id="tab-bacon">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Bacon's Cipher</span>
          <span class="badge badge-accent">A=aaaaa B=aaaab ...</span>
        </div>
        <div class="control-row">
          <button class="btn btn-accent" id="bacon-encode">Text → Bacon</button>
          <button class="btn" id="bacon-decode">Bacon → Text</button>
          <span class="control-label">Format</span>
          <select id="bacon-format" style="max-width:120px">
            <option value="ab">a/b</option>
            <option value="01">0/1</option>
            <option value="AB">A/B</option>
          </select>
        </div>
        <div class="output-box mt-8" id="bacon-output"></div>
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

  const getInput = () => container.querySelector('#vis-input').value;

  // === MORSE ===
  container.querySelector('#morse-encode').addEventListener('click', () => {
    container.querySelector('#morse-output').textContent = getInput().toUpperCase().split('').map(c => {
      if (c === ' ') return '  /  ';
      return morseMap[c] || c;
    }).join('  ');
  });
  container.querySelector('#morse-decode').addEventListener('click', () => {
    const words = getInput().trim().split(/\s*\/\s*/);
    container.querySelector('#morse-output').textContent = words.map(w =>
      w.trim().split(/\s{2,}|\s+/).map(code => morseReverse[code] || '?').join('')
    ).join(' ');
  });

  // Morse reference
  const morseRef = container.querySelector('#morse-ref');
  morseRef.innerHTML = Object.entries(morseMap).map(([c, m]) =>
    `<div class="ref-cell"><div class="ref-cell-letter">${c}</div><div class="ref-cell-value">${m}</div></div>`
  ).join('');

  // === BRAILLE ===
  container.querySelector('#braille-encode').addEventListener('click', () => {
    container.querySelector('#braille-output').textContent = getInput().toUpperCase().split('').map(c =>
      brailleMap[c] || c
    ).join('');
  });
  container.querySelector('#braille-decode').addEventListener('click', () => {
    container.querySelector('#braille-output').textContent = getInput().split('').map(c =>
      brailleReverse[c] || c
    ).join('');
  });

  const brailleRef = container.querySelector('#braille-ref');
  brailleRef.innerHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c =>
    `<div class="ref-cell"><div class="ref-cell-value" style="font-size:1.2rem">${brailleMap[c]}</div><div class="ref-cell-letter">${c}</div></div>`
  ).join('');

  // === NATO ===
  container.querySelector('#nato-encode').addEventListener('click', () => {
    container.querySelector('#nato-output').textContent = getInput().toUpperCase().split('').map(c => {
      if (c === ' ') return '  [space]  ';
      return natoMap[c] || c;
    }).join(' ');
  });
  container.querySelector('#nato-decode').addEventListener('click', () => {
    const words = getInput().trim().split(/\s+/);
    container.querySelector('#nato-output').textContent = words.map(w =>
      natoReverse[w.toLowerCase()] || w
    ).join('');
  });

  // === PIGPEN ===
  function drawPigpen(letter) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 30 30');
    svg.setAttribute('width', '32');
    svg.setAttribute('height', '32');
    svg.style.fill = 'none';
    svg.style.stroke = '#00d4aa';
    svg.style.strokeWidth = '2';

    const pigpenShapes = {
      'A': 'M0,30 L30,30 L30,0', 'B': 'M0,30 L0,0 M0,30 L30,30 M30,30 L30,0',
      'C': 'M0,0 L0,30 L30,30', 'D': 'M30,0 L0,0 L0,30 L30,30', 'E': 'M0,0 L30,0 M0,0 L0,30 M0,30 L30,30 M30,0 L30,30',
      'F': 'M0,0 L30,0 L30,30 L0,30', 'G': 'M0,0 L30,0 L30,30', 'H': 'M0,0 L30,0 M30,0 L30,30 M0,30 L30,30',
      'I': 'M0,0 L30,0 L30,30 L0,30 L0,0',
      'J': 'M15,0 L30,15 L15,30', 'K': 'M0,15 L15,0 L30,15 L15,30',
      'L': 'M15,0 L0,15 L15,30', 'M': 'M0,15 L15,30 L30,15',
      'N': 'M0,15 L15,0 L30,15 L15,30 L0,15', 'O': 'M15,0 L0,15 L15,30 L30,15 L15,0',
      'P': 'M0,15 L15,0 L30,15', 'Q': 'M15,0 L30,15 L15,30 L0,15',
      'R': 'M15,0 L0,15 L15,30 L30,15',
      'S': 'M0,30 L30,30 L30,0 M15,15 L15,15', 'T': 'M0,30 L0,0 M0,30 L30,30 M30,30 L30,0 M15,15 L15,15',
      'U': 'M0,0 L0,30 L30,30 M15,15 L15,15', 'V': 'M30,0 L0,0 L0,30 L30,30 M15,15 L15,15',
      'W': 'M15,15 L15,15 M0,0 L30,0 M0,0 L0,30 M0,30 L30,30 M30,0 L30,30',
      'X': 'M0,0 L30,0 L30,30 L0,30 M15,15 L15,15', 'Y': 'M0,0 L30,0 L30,30 M15,15 L15,15',
      'Z': 'M0,0 L30,0 M30,0 L30,30 M0,30 L30,30 M15,15 L15,15'
    };

    const pathData = pigpenShapes[letter] || '';
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    svg.appendChild(path);

    // Add dot for S-Z
    if (letter >= 'S' && letter <= 'Z') {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '15');
      circle.setAttribute('cy', '15');
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', '#00d4aa');
      circle.setAttribute('stroke', 'none');
      svg.appendChild(circle);
    }

    return svg;
  }

  container.querySelector('#pigpen-encode').addEventListener('click', () => {
    const output = container.querySelector('#pigpen-output');
    output.innerHTML = '';
    getInput().toUpperCase().split('').forEach(c => {
      if (c >= 'A' && c <= 'Z') {
        output.appendChild(drawPigpen(c));
      } else if (c === ' ') {
        const spacer = document.createElement('div');
        spacer.style.width = '16px';
        output.appendChild(spacer);
      }
    });
  });

  // Pigpen reference
  const pigpenRefEl = container.querySelector('#pigpen-ref');
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(c => {
    const wrap = document.createElement('div');
    wrap.style.textAlign = 'center';
    wrap.appendChild(drawPigpen(c));
    const label = document.createElement('div');
    label.textContent = c;
    label.style.fontSize = '0.65rem';
    label.style.color = 'var(--text-muted)';
    label.style.marginTop = '2px';
    wrap.appendChild(label);
    pigpenRefEl.appendChild(wrap);
  });

  // === TAP CODE ===
  const tapGrid = [['A','B','C/K','D','E'],['F','G','H','I','J'],['L','M','N','O','P'],['Q','R','S','T','U'],['V','W','X','Y','Z']];

  container.querySelector('#tap-encode').addEventListener('click', () => {
    container.querySelector('#tap-output').textContent = getInput().toUpperCase().split('').map(c => {
      if (c === 'K') c = 'C';
      if (c === ' ') return '  ';
      for (let r = 0; r < 5; r++) {
        for (let col = 0; col < 5; col++) {
          if (tapGrid[r][col].includes(c)) return `${'·'.repeat(r+1)} ${'·'.repeat(col+1)}`;
        }
      }
      return c;
    }).join('  ');
  });

  container.querySelector('#tap-decode').addEventListener('click', () => {
    const pairs = getInput().trim().split(/\s{2,}/);
    container.querySelector('#tap-output').textContent = pairs.map(p => {
      const parts = p.trim().split(/\s+/);
      if (parts.length === 2) {
        const r = (parts[0].match(/·/g) || []).length - 1;
        const c = (parts[1].match(/·/g) || []).length - 1;
        if (r >= 0 && r < 5 && c >= 0 && c < 5) return tapGrid[r][c].replace('/K', '');
      }
      return '?';
    }).join('');
  });

  const tapGridEl = container.querySelector('#tap-grid');
  tapGridEl.innerHTML = '<table style="border-collapse:collapse">' +
    '<tr><th style="padding:4px 8px;color:var(--text-muted)"></th>' +
    [1,2,3,4,5].map(i => `<th style="padding:4px 8px;color:var(--accent)">${i}</th>`).join('') + '</tr>' +
    tapGrid.map((row, r) =>
      `<tr><td style="padding:4px 8px;color:var(--accent);font-weight:600">${r+1}</td>` +
      row.map(c => `<td style="padding:4px 8px;border:1px solid var(--border);text-align:center">${c}</td>`).join('') +
      '</tr>'
    ).join('') + '</table>';

  // === SEMAPHORE ===
  const semaphorePositions = {
    'A':[225,0],'B':[270,0],'C':[315,0],'D':[0,0],'E':[0,135],'F':[0,90],'G':[0,45],
    'H':[270,225],'I':[315,225],'J':[0,90],'K':[225,45],'L':[225,90],'M':[225,135],
    'N':[225,0],'O':[270,315],'P':[270,45],'Q':[270,90],'R':[270,135],'S':[315,45],
    'T':[315,90],'U':[315,135],'V':[0,225],'W':[45,90],'X':[45,135],'Y':[315,0],'Z':[45,0]
  };

  function drawSemaphore(letter) {
    const pos = semaphorePositions[letter];
    if (!pos) return null;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '-40 -40 80 80');
    svg.setAttribute('width', '60');
    svg.setAttribute('height', '60');

    // Body
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    body.setAttribute('cx', '0'); body.setAttribute('cy', '0'); body.setAttribute('r', '6');
    body.setAttribute('fill', '#7c6aff');
    svg.appendChild(body);

    // Arms
    pos.forEach((angle, i) => {
      const rad = angle * Math.PI / 180;
      const x = Math.cos(rad) * 28;
      const y = -Math.sin(rad) * 28;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0'); line.setAttribute('y1', '0');
      line.setAttribute('x2', x.toString()); line.setAttribute('y2', y.toString());
      line.setAttribute('stroke', '#00d4aa'); line.setAttribute('stroke-width', '3');
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);

      // Flag
      const flag = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      flag.setAttribute('cx', x.toString()); flag.setAttribute('cy', y.toString());
      flag.setAttribute('r', '5'); flag.setAttribute('fill', i === 0 ? '#ff4d6a' : '#ffb84d');
      svg.appendChild(flag);
    });

    // Label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '0'); text.setAttribute('y', '38');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#565b7a');
    text.setAttribute('font-size', '10');
    text.setAttribute('font-family', 'monospace');
    text.textContent = letter;
    svg.appendChild(text);

    return svg;
  }

  container.querySelector('#sema-encode').addEventListener('click', () => {
    const output = container.querySelector('#sema-output');
    output.innerHTML = '';
    getInput().toUpperCase().split('').forEach(c => {
      if (c >= 'A' && c <= 'Z') {
        const svg = drawSemaphore(c);
        if (svg) output.appendChild(svg);
      } else if (c === ' ') {
        const spacer = document.createElement('div');
        spacer.style.width = '20px';
        output.appendChild(spacer);
      }
    });
  });

  // === BACON'S CIPHER ===
  const baconMap = {};
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((c, i) => {
    baconMap[c] = i.toString(2).padStart(5, '0');
  });
  const baconReverse = {};
  Object.entries(baconMap).forEach(([k,v]) => baconReverse[v] = k);

  container.querySelector('#bacon-encode').addEventListener('click', () => {
    const fmt = container.querySelector('#bacon-format').value;
    const [zero, one] = fmt === 'ab' ? ['a','b'] : fmt === '01' ? ['0','1'] : ['A','B'];
    container.querySelector('#bacon-output').textContent = getInput().toUpperCase().split('').map(c => {
      if (baconMap[c]) return baconMap[c].replace(/0/g, zero).replace(/1/g, one);
      return c;
    }).join(' ');
  });

  container.querySelector('#bacon-decode').addEventListener('click', () => {
    const input = getInput().toLowerCase().replace(/[^ab01]/g, '');
    const normalized = input.replace(/a/g, '0').replace(/b/g, '1');
    let result = '';
    for (let i = 0; i + 4 < normalized.length; i += 5) {
      const chunk = normalized.slice(i, i + 5);
      result += baconReverse[chunk] || '?';
    }
    container.querySelector('#bacon-output').textContent = result;
  });
}

Router.register('/toolkit/visual-ciphers', 'visual-ciphers', renderVisualCiphers);
