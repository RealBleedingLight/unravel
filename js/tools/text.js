// === TEXT TOOLS ===
function renderText(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title"><span class="title-accent">◧</span> Text Tools</h1>
      <p class="page-subtitle">Reverse, regex, character analysis, transforms, anagram helper</p>
    </div>

    <div class="panel">
      <div class="panel-header"><span class="panel-title">Input</span></div>
      <textarea id="text-input" placeholder="Enter text..." rows="4"></textarea>
      <div class="flex gap-8 mt-8 flex-wrap">
        <span class="badge badge-accent" id="text-chars">0 chars</span>
        <span class="badge badge-purple" id="text-words">0 words</span>
        <span class="badge badge-warning" id="text-lines">0 lines</span>
      </div>
    </div>

    <div class="tab-bar">
      <button class="tab-btn active" data-tab="transform">Transforms</button>
      <button class="tab-btn" data-tab="regex">Regex Tester</button>
      <button class="tab-btn" data-tab="analysis">Analysis</button>
      <button class="tab-btn" data-tab="anagram">Anagram Helper</button>
      <button class="tab-btn" data-tab="extract">Extract / Filter</button>
      <button class="tab-btn" data-tab="diff">Compare / Diff</button>
    </div>

    <!-- Transforms -->
    <div class="tab-content active" id="tab-transform">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Text Transforms</span></div>
        <div class="flex gap-8 flex-wrap">
          <button class="btn" data-transform="reverse">Reverse</button>
          <button class="btn" data-transform="reverse-words">Reverse Words</button>
          <button class="btn" data-transform="upper">UPPERCASE</button>
          <button class="btn" data-transform="lower">lowercase</button>
          <button class="btn" data-transform="title">Title Case</button>
          <button class="btn" data-transform="swap">sWAP cASE</button>
          <button class="btn" data-transform="remove-spaces">Remove Spaces</button>
          <button class="btn" data-transform="remove-newlines">Remove Newlines</button>
          <button class="btn" data-transform="remove-dupes">Remove Duplicate Lines</button>
          <button class="btn" data-transform="sort-lines">Sort Lines</button>
          <button class="btn" data-transform="sort-alpha">Sort Characters</button>
          <button class="btn" data-transform="unique-chars">Unique Characters</button>
          <button class="btn" data-transform="every-nth">Every Nth Char</button>
          <button class="btn" data-transform="interleave">De-interleave</button>
          <button class="btn" data-transform="zigzag">Read Zigzag</button>
          <button class="btn" data-transform="spiral">Read Spiral</button>
          <button class="btn" data-transform="columns">Read by Columns</button>
        </div>
        <div id="transform-options" class="mt-8 hidden">
          <div class="control-row">
            <span class="control-label" id="opt-label"></span>
            <input type="number" id="opt-n" value="2" min="1" max="100" style="max-width:80px">
            <button class="btn btn-accent btn-small" id="opt-apply">Apply</button>
          </div>
        </div>
        <div class="output-box mt-8" id="transform-output"></div>
      </div>
    </div>

    <!-- Regex -->
    <div class="tab-content" id="tab-regex">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Regex Tester</span></div>
        <div class="control-row">
          <span class="control-label">Pattern</span>
          <input type="text" id="regex-pattern" placeholder="Regular expression..." style="flex:1">
          <span class="control-label">Flags</span>
          <input type="text" id="regex-flags" value="gi" style="max-width:60px">
          <button class="btn btn-accent" id="regex-test">Test</button>
          <button class="btn" id="regex-replace-btn">Replace</button>
        </div>
        <div class="control-row">
          <span class="control-label">Replace with</span>
          <input type="text" id="regex-replace" placeholder="Replacement string..." style="flex:1">
        </div>
        <div class="mt-8">
          <div class="text-sm text-muted mb-12">Matches</div>
          <div class="output-box" id="regex-matches" style="max-height:300px;overflow:auto"></div>
        </div>
        <div class="mt-8">
          <div class="text-sm text-muted mb-12">Result</div>
          <div class="output-box" id="regex-result"></div>
        </div>
      </div>
    </div>

    <!-- Analysis -->
    <div class="tab-content" id="tab-analysis">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Character Analysis</span>
          <button class="btn btn-accent btn-small" id="analysis-run">Analyze</button>
        </div>
        <div class="two-col" id="analysis-output">
          <div id="char-freq-table"></div>
          <div id="char-stats"></div>
        </div>
      </div>
    </div>

    <!-- Anagram -->
    <div class="tab-content" id="tab-anagram">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Anagram Helper</span></div>
        <div class="control-row">
          <button class="btn btn-accent" id="anagram-sort">Sort Letters</button>
          <button class="btn" id="anagram-scramble">Scramble</button>
          <button class="btn" id="anagram-subsets">Find Subsets</button>
        </div>
        <div class="output-box mt-8" id="anagram-output"></div>
        <div class="mt-16">
          <div class="text-sm text-muted mb-12">Letter inventory</div>
          <div id="anagram-inventory" class="flex gap-8 flex-wrap"></div>
        </div>
      </div>
    </div>

    <!-- Extract / Filter -->
    <div class="tab-content" id="tab-extract">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Extract & Filter</span></div>
        <div class="flex gap-8 flex-wrap">
          <button class="btn" id="ext-upper">Extract Uppercase</button>
          <button class="btn" id="ext-lower">Extract Lowercase</button>
          <button class="btn" id="ext-digits">Extract Digits</button>
          <button class="btn" id="ext-first">First Letter Each Word</button>
          <button class="btn" id="ext-last">Last Letter Each Word</button>
          <button class="btn" id="ext-nth-word">Nth Word</button>
          <button class="btn" id="ext-nth-char">Nth Character</button>
          <button class="btn" id="ext-urls">Extract URLs</button>
          <button class="btn" id="ext-emails">Extract Emails</button>
          <button class="btn" id="ext-between">Extract Between</button>
        </div>
        <div id="extract-options" class="mt-8 hidden">
          <div class="control-row">
            <span class="control-label" id="ext-opt-label"></span>
            <input type="text" id="ext-opt-val" style="max-width:200px">
            <button class="btn btn-accent btn-small" id="ext-opt-apply">Extract</button>
          </div>
        </div>
        <div class="output-box mt-8" id="extract-output"></div>
      </div>
    </div>

    <!-- Diff -->
    <div class="tab-content" id="tab-diff">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Text Comparison</span></div>
        <textarea id="diff-text2" placeholder="Paste second text here to compare..." rows="3" style="width:100%"></textarea>
        <button class="btn btn-accent mt-8" id="diff-run">Compare</button>
        <div class="output-box mt-8" id="diff-output" style="max-height:400px;overflow:auto"></div>
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

  const getInput = () => container.querySelector('#text-input').value;

  // Live stats
  container.querySelector('#text-input').addEventListener('input', () => {
    const text = getInput();
    container.querySelector('#text-chars').textContent = `${text.length} chars`;
    container.querySelector('#text-words').textContent = `${text.trim() ? text.trim().split(/\s+/).length : 0} words`;
    container.querySelector('#text-lines').textContent = `${text.split('\n').length} lines`;
  });

  // === TRANSFORMS ===
  let pendingTransform = null;
  container.querySelectorAll('[data-transform]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = getInput();
      const type = btn.dataset.transform;
      const opts = container.querySelector('#transform-options');
      const out = container.querySelector('#transform-output');

      if (['every-nth', 'interleave', 'columns'].includes(type)) {
        opts.classList.remove('hidden');
        container.querySelector('#opt-label').textContent = type === 'every-nth' ? 'N =' : type === 'columns' ? 'Columns =' : 'Streams =';
        pendingTransform = type;
        return;
      }
      opts.classList.add('hidden');

      switch (type) {
        case 'reverse': out.textContent = text.split('').reverse().join(''); break;
        case 'reverse-words': out.textContent = text.split(' ').reverse().join(' '); break;
        case 'upper': out.textContent = text.toUpperCase(); break;
        case 'lower': out.textContent = text.toLowerCase(); break;
        case 'title': out.textContent = text.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()); break;
        case 'swap': out.textContent = text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''); break;
        case 'remove-spaces': out.textContent = text.replace(/\s/g, ''); break;
        case 'remove-newlines': out.textContent = text.replace(/\n/g, ' '); break;
        case 'remove-dupes': out.textContent = [...new Set(text.split('\n'))].join('\n'); break;
        case 'sort-lines': out.textContent = text.split('\n').sort().join('\n'); break;
        case 'sort-alpha': out.textContent = text.split('').sort().join(''); break;
        case 'unique-chars': out.textContent = [...new Set(text)].join(''); break;
        case 'zigzag': {
          const lines = text.split('\n');
          let result = '';
          for (let i = 0; i < lines.length; i++) {
            result += i % 2 === 0 ? lines[i] : lines[i].split('').reverse().join('');
          }
          out.textContent = result;
          break;
        }
        case 'spiral': {
          const lines = text.split('\n').map(l => l.split(''));
          const result = [];
          while (lines.length && lines[0].length) {
            result.push(...lines.shift());
            lines.forEach(row => { if (row.length) result.push(row.pop()); });
            if (lines.length) result.push(...lines.pop().reverse());
            lines.reverse().forEach(row => { if (row.length) result.push(row.shift()); });
            lines.reverse();
          }
          out.textContent = result.join('');
          break;
        }
      }
    });
  });

  container.querySelector('#opt-apply').addEventListener('click', () => {
    const n = parseInt(container.querySelector('#opt-n').value);
    const text = getInput();
    const out = container.querySelector('#transform-output');
    switch (pendingTransform) {
      case 'every-nth': {
        let result = '';
        for (let i = n - 1; i < text.length; i += n) result += text[i];
        out.textContent = result;
        break;
      }
      case 'interleave': {
        const streams = Array.from({length: n}, () => '');
        for (let i = 0; i < text.length; i++) streams[i % n] += text[i];
        out.textContent = streams.map((s, i) => `Stream ${i+1}: ${s}`).join('\n');
        break;
      }
      case 'columns': {
        const cols = n;
        const rows = Math.ceil(text.length / cols);
        let result = '';
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            const idx = r * cols + c;
            if (idx < text.length) result += text[idx];
          }
        }
        out.textContent = result;
        break;
      }
    }
  });

  // === REGEX ===
  container.querySelector('#regex-test').addEventListener('click', () => {
    try {
      const pattern = container.querySelector('#regex-pattern').value;
      const flags = container.querySelector('#regex-flags').value;
      const regex = new RegExp(pattern, flags);
      const text = getInput();
      const matches = [...text.matchAll(regex)];
      container.querySelector('#regex-matches').textContent = matches.length > 0 ?
        matches.map((m, i) => `Match ${i+1}: "${m[0]}" at index ${m.index}${m.length > 1 ? '\n  Groups: ' + m.slice(1).join(', ') : ''}`).join('\n') :
        'No matches found';
    } catch(e) {
      container.querySelector('#regex-matches').textContent = 'Regex error: ' + e.message;
    }
  });

  container.querySelector('#regex-replace-btn').addEventListener('click', () => {
    try {
      const regex = new RegExp(container.querySelector('#regex-pattern').value, container.querySelector('#regex-flags').value);
      container.querySelector('#regex-result').textContent = getInput().replace(regex, container.querySelector('#regex-replace').value);
    } catch(e) { container.querySelector('#regex-result').textContent = 'Error: ' + e.message; }
  });

  // === ANALYSIS ===
  container.querySelector('#analysis-run').addEventListener('click', () => {
    const text = getInput();
    const freq = {};
    for (const c of text) freq[c] = (freq[c] || 0) + 1;
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);

    container.querySelector('#char-freq-table').innerHTML =
      '<div style="max-height:400px;overflow:auto">' +
      sorted.map(([c, n]) => {
        const display = c === ' ' ? '⎵' : c === '\n' ? '↵' : c === '\t' ? '→' : c;
        const pct = (n / text.length * 100).toFixed(1);
        return `<div class="control-row" style="padding:2px 0;border-bottom:1px solid var(--border)">
          <span class="font-mono text-accent" style="min-width:30px">${display}</span>
          <span style="min-width:40px">${n}</span>
          <span class="text-muted">${pct}%</span>
          <div style="background:var(--accent-dim);height:8px;border-radius:4px;width:${pct * 2}px"></div>
        </div>`;
      }).join('') + '</div>';

    const letters = text.replace(/[^a-zA-Z]/g, '');
    const digits = text.replace(/[^0-9]/g, '');
    const spaces = (text.match(/\s/g) || []).length;
    const special = text.length - letters.length - digits.length - spaces;

    container.querySelector('#char-stats').innerHTML = `
      <div class="output-box" style="font-size:0.78rem">
Total: ${text.length} characters
Letters: ${letters.length}
Digits: ${digits.length}
Spaces: ${spaces}
Special: ${special}
Unique: ${Object.keys(freq).length}

Entropy: ${calcEntropy(text).toFixed(4)} bits/char
      </div>
    `;
  });

  function calcEntropy(text) {
    const freq = {};
    for (const c of text) freq[c] = (freq[c] || 0) + 1;
    return -Object.values(freq).reduce((sum, n) => {
      const p = n / text.length;
      return sum + p * Math.log2(p);
    }, 0);
  }

  // === ANAGRAM ===
  container.querySelector('#anagram-sort').addEventListener('click', () => {
    const letters = getInput().toUpperCase().replace(/[^A-Z]/g, '').split('').sort().join('');
    container.querySelector('#anagram-output').textContent = letters;
    showInventory(letters);
  });

  container.querySelector('#anagram-scramble').addEventListener('click', () => {
    const arr = getInput().split('');
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]] = [arr[j],arr[i]]; }
    container.querySelector('#anagram-output').textContent = arr.join('');
  });

  container.querySelector('#anagram-subsets').addEventListener('click', () => {
    const letters = getInput().toUpperCase().replace(/[^A-Z]/g, '');
    // Show all possible 2-3-4-5 letter combinations (limited)
    const results = new Set();
    const arr = letters.split('');
    for (let len = 2; len <= Math.min(5, arr.length); len++) {
      permute(arr, len, results, 500);
    }
    container.querySelector('#anagram-output').textContent =
      `${results.size} combinations (up to 5 letters):\n${[...results].join(', ')}`;
  });

  function permute(arr, len, results, limit) {
    function helper(current, remaining) {
      if (results.size >= limit) return;
      if (current.length === len) { results.add(current.join('')); return; }
      for (let i = 0; i < remaining.length; i++) {
        helper([...current, remaining[i]], [...remaining.slice(0,i), ...remaining.slice(i+1)]);
      }
    }
    helper([], arr);
  }

  function showInventory(text) {
    const inv = container.querySelector('#anagram-inventory');
    const freq = {};
    for (const c of text.toUpperCase()) if (c >= 'A' && c <= 'Z') freq[c] = (freq[c] || 0) + 1;
    inv.innerHTML = Object.entries(freq).sort().map(([c, n]) =>
      `<div class="badge badge-accent">${c}×${n}</div>`
    ).join('');
  }

  // === EXTRACT ===
  let pendingExtract = null;
  const extractButtons = {
    'ext-upper': () => getInput().replace(/[^A-Z]/g, ''),
    'ext-lower': () => getInput().replace(/[^a-z]/g, ''),
    'ext-digits': () => getInput().replace(/[^0-9]/g, ''),
    'ext-first': () => getInput().split(/\s+/).map(w => w[0] || '').join(''),
    'ext-last': () => getInput().split(/\s+/).map(w => w[w.length-1] || '').join(''),
    'ext-urls': () => (getInput().match(/https?:\/\/[^\s]+/g) || []).join('\n'),
    'ext-emails': () => (getInput().match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || []).join('\n'),
  };

  Object.entries(extractButtons).forEach(([id, fn]) => {
    container.querySelector(`#${id}`).addEventListener('click', () => {
      container.querySelector('#extract-options').classList.add('hidden');
      container.querySelector('#extract-output').textContent = fn() || '(nothing extracted)';
    });
  });

  container.querySelector('#ext-nth-word').addEventListener('click', () => {
    const opts = container.querySelector('#extract-options');
    opts.classList.remove('hidden');
    container.querySelector('#ext-opt-label').textContent = 'Word position (1-based):';
    pendingExtract = 'nth-word';
  });

  container.querySelector('#ext-nth-char').addEventListener('click', () => {
    const opts = container.querySelector('#extract-options');
    opts.classList.remove('hidden');
    container.querySelector('#ext-opt-label').textContent = 'Char positions (comma-separated):';
    pendingExtract = 'nth-char';
  });

  container.querySelector('#ext-between').addEventListener('click', () => {
    const opts = container.querySelector('#extract-options');
    opts.classList.remove('hidden');
    container.querySelector('#ext-opt-label').textContent = 'Between (start...end):';
    pendingExtract = 'between';
  });

  container.querySelector('#ext-opt-apply').addEventListener('click', () => {
    const val = container.querySelector('#ext-opt-val').value;
    const text = getInput();
    const out = container.querySelector('#extract-output');
    switch (pendingExtract) {
      case 'nth-word': {
        const n = parseInt(val);
        const words = text.split(/\s+/);
        out.textContent = words.filter((_, i) => (i + 1) % n === 0).join(' ');
        break;
      }
      case 'nth-char': {
        const positions = val.split(',').map(n => parseInt(n.trim()) - 1);
        out.textContent = positions.map(p => text[p] || '').join('');
        break;
      }
      case 'between': {
        const [start, end] = val.split('...');
        const regex = new RegExp(`${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(.*?)${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gs');
        const matches = [...text.matchAll(regex)].map(m => m[1]);
        out.textContent = matches.join('\n') || 'Nothing found';
        break;
      }
    }
  });

  // === DIFF ===
  container.querySelector('#diff-run').addEventListener('click', () => {
    const text1 = getInput();
    const text2 = container.querySelector('#diff-text2').value;
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLen = Math.max(lines1.length, lines2.length);
    let result = '';
    let diffs = 0;

    for (let i = 0; i < maxLen; i++) {
      const l1 = lines1[i] || '';
      const l2 = lines2[i] || '';
      if (l1 === l2) {
        result += `  ${l1}\n`;
      } else {
        if (l1) result += `- ${l1}\n`;
        if (l2) result += `+ ${l2}\n`;
        diffs++;
      }
    }

    // Character diff
    let charDiff = '';
    const shorter = Math.min(text1.length, text2.length);
    for (let i = 0; i < shorter; i++) {
      if (text1[i] !== text2[i]) charDiff += `Position ${i}: '${text1[i]}' vs '${text2[i]}'\n`;
    }

    container.querySelector('#diff-output').textContent =
      `${diffs} line differences found\n\n--- Line diff ---\n${result}\n--- Character diff (first text vs second) ---\n${charDiff || 'Identical up to shorter text length'}`;
  });
}

Router.register('/toolkit/text', 'text', renderText);
