// === PUZZLE NOTEBOOK ===
function renderNotebook(container) {
  const platforms = [
    { id: 'ctf', name: 'CTF', color: '#ff4d6a' },
    { id: 'notpron', name: 'Notpron / Web Riddles', color: '#00d4aa' },
    { id: 'arg', name: 'ARG', color: '#7c6aff' },
    { id: 'geocache', name: 'Geocaching', color: '#ffb84d' },
    { id: 'puzzlehunt', name: 'Puzzle Hunts', color: '#4da6ff' },
    { id: 'other', name: 'Other', color: '#8b90b0' },
  ];

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title"><span class="title-accent">◳</span> Puzzle Notebook</h1>
      <p class="page-subtitle">Track puzzles, solutions, and research notes across platforms</p>
    </div>
    <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;height:calc(100vh - 140px)">
      <div class="notebook-sidebar" id="nb-sidebar">
        <div class="flex justify-between items-center mb-12">
          <span class="text-sm text-muted" style="text-transform:uppercase;letter-spacing:1.5px">Puzzles</span>
          <button class="btn btn-accent btn-small" id="nb-new">+ New</button>
        </div>
        <div class="mb-12">
          <input type="text" id="nb-search" placeholder="Search puzzles..." style="font-size:0.78rem;padding:6px 10px">
        </div>
        <div class="mb-12">
          <select id="nb-filter" style="font-size:0.75rem;padding:4px 8px;width:100%">
            <option value="all">All Platforms</option>
            ${platforms.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </div>
        <div class="mb-12">
          <select id="nb-status-filter" style="font-size:0.75rem;padding:4px 8px;width:100%">
            <option value="all">All Status</option>
            <option value="unsolved">Unsolved</option>
            <option value="in-progress">In Progress</option>
            <option value="solved">Solved</option>
            <option value="stuck">Stuck</option>
          </select>
        </div>
        <div id="nb-list"></div>
        <div class="mt-16" style="border-top:1px solid var(--border);padding-top:12px">
          <button class="btn btn-small w-full" id="nb-export" style="margin-bottom:6px">Export All (JSON)</button>
          <button class="btn btn-small w-full" id="nb-import">Import</button>
          <input type="file" id="nb-import-file" accept=".json" style="display:none">
        </div>
      </div>
      <div class="notebook-main" id="nb-main">
        <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted)">
          <div style="text-align:center">
            <div style="font-size:2rem;margin-bottom:8px">◳</div>
            <div>Select a puzzle or create a new one</div>
          </div>
        </div>
      </div>
    </div>
  `;

  let puzzles = Store.get('puzzles', []);
  let activeId = null;

  function savePuzzles() {
    Store.set('puzzles', puzzles);
  }

  function renderList() {
    const search = container.querySelector('#nb-search').value.toLowerCase();
    const platformFilter = container.querySelector('#nb-filter').value;
    const statusFilter = container.querySelector('#nb-status-filter').value;

    const filtered = puzzles.filter(p => {
      if (search && !p.title.toLowerCase().includes(search) && !p.notes.toLowerCase().includes(search)) return false;
      if (platformFilter !== 'all' && p.platform !== platformFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      return true;
    });

    filtered.sort((a, b) => new Date(b.updated) - new Date(a.updated));

    const list = container.querySelector('#nb-list');
    list.innerHTML = filtered.map(p => {
      const platform = platforms.find(pl => pl.id === p.platform) || platforms[5];
      const statusColors = { unsolved: 'var(--text-muted)', 'in-progress': 'var(--warning)', solved: 'var(--accent)', stuck: 'var(--danger)' };
      return `<div class="puzzle-entry ${p.id === activeId ? 'active' : ''}" data-id="${p.id}">
        <div class="puzzle-entry-platform" style="color:${platform.color}">${platform.name}</div>
        <div class="puzzle-entry-title">${p.title || 'Untitled'}</div>
        <div class="puzzle-entry-meta">
          <span style="color:${statusColors[p.status] || 'var(--text-muted)'}">${p.status}</span>
          · ${p.level ? 'Level ' + p.level + ' · ' : ''}${timeAgo(p.updated)}
        </div>
      </div>`;
    }).join('') || '<div class="text-sm text-muted" style="padding:12px">No puzzles found</div>';

    list.querySelectorAll('.puzzle-entry').forEach(entry => {
      entry.addEventListener('click', () => openPuzzle(entry.dataset.id));
    });
  }

  function openPuzzle(id) {
    activeId = id;
    const puzzle = puzzles.find(p => p.id === id);
    if (!puzzle) return;
    renderList();

    const main = container.querySelector('#nb-main');
    const platform = platforms.find(p => p.id === puzzle.platform) || platforms[5];

    main.innerHTML = `
      <div class="flex justify-between items-center mb-12">
        <div class="flex gap-8 items-center">
          <span class="badge" style="background:${platform.color}22;color:${platform.color}">${platform.name}</span>
          <select id="puzzle-status" style="font-size:0.72rem;padding:3px 8px;max-width:120px">
            <option value="unsolved" ${puzzle.status==='unsolved'?'selected':''}>Unsolved</option>
            <option value="in-progress" ${puzzle.status==='in-progress'?'selected':''}>In Progress</option>
            <option value="solved" ${puzzle.status==='solved'?'selected':''}>Solved</option>
            <option value="stuck" ${puzzle.status==='stuck'?'selected':''}>Stuck</option>
          </select>
        </div>
        <div class="flex gap-8">
          <button class="btn btn-small" id="puzzle-preview-toggle">Preview</button>
          <button class="btn btn-small btn-danger" id="puzzle-delete">Delete</button>
        </div>
      </div>

      <div class="mb-12">
        <input type="text" id="puzzle-title" value="${escapeHtml(puzzle.title)}" placeholder="Puzzle title..."
          style="font-size:1.1rem;font-weight:600;background:transparent;border:none;border-bottom:1px solid var(--border);border-radius:0;padding:8px 0">
      </div>

      <div class="flex gap-8 mb-12 flex-wrap">
        <div class="flex items-center gap-8" style="flex:1;min-width:200px">
          <span class="control-label">Platform</span>
          <select id="puzzle-platform" style="font-size:0.78rem;max-width:180px">
            ${platforms.map(p => `<option value="${p.id}" ${puzzle.platform===p.id?'selected':''}>${p.name}</option>`).join('')}
          </select>
        </div>
        <div class="flex items-center gap-8" style="flex:1;min-width:150px">
          <span class="control-label">Level</span>
          <input type="text" id="puzzle-level" value="${escapeHtml(puzzle.level || '')}" placeholder="e.g. 42" style="max-width:100px">
        </div>
        <div class="flex items-center gap-8" style="flex:1;min-width:200px">
          <span class="control-label">URL</span>
          <input type="url" id="puzzle-url" value="${escapeHtml(puzzle.url || '')}" placeholder="Puzzle link...">
        </div>
      </div>

      <div class="mb-12">
        <div class="flex justify-between items-center mb-8">
          <span class="control-label">Solution / Answer</span>
        </div>
        <input type="text" id="puzzle-solution" value="${escapeHtml(puzzle.solution || '')}" placeholder="Solution..."
          style="font-family:var(--font-mono);color:var(--accent)">
      </div>

      <div>
        <div class="flex justify-between items-center mb-8">
          <span class="control-label">Notes (Markdown supported)</span>
          <span class="text-sm text-muted">${puzzle.notes.length} chars</span>
        </div>
        <textarea class="note-editor" id="puzzle-notes" placeholder="# Research Notes&#10;&#10;Write your notes here...&#10;&#10;## Clues&#10;- ...&#10;&#10;## Attempts&#10;- ...">${escapeHtml(puzzle.notes)}</textarea>
        <div id="puzzle-preview" class="note-preview hidden"></div>
      </div>
    `;

    // Auto-save on changes
    const saveFields = ['puzzle-title', 'puzzle-level', 'puzzle-url', 'puzzle-solution', 'puzzle-notes', 'puzzle-platform', 'puzzle-status'];
    saveFields.forEach(fieldId => {
      const el = main.querySelector(`#${fieldId}`);
      if (!el) return;
      el.addEventListener('input', () => {
        puzzle.title = main.querySelector('#puzzle-title').value;
        puzzle.level = main.querySelector('#puzzle-level').value;
        puzzle.url = main.querySelector('#puzzle-url').value;
        puzzle.solution = main.querySelector('#puzzle-solution').value;
        puzzle.notes = main.querySelector('#puzzle-notes').value;
        puzzle.platform = main.querySelector('#puzzle-platform').value;
        puzzle.status = main.querySelector('#puzzle-status').value;
        puzzle.updated = new Date().toISOString();
        savePuzzles();
        renderList();
      });
      el.addEventListener('change', () => el.dispatchEvent(new Event('input')));
    });

    // Preview toggle
    main.querySelector('#puzzle-preview-toggle').addEventListener('click', () => {
      const editor = main.querySelector('#puzzle-notes');
      const preview = main.querySelector('#puzzle-preview');
      if (preview.classList.contains('hidden')) {
        preview.innerHTML = renderMarkdown(puzzle.notes);
        preview.classList.remove('hidden');
        editor.classList.add('hidden');
      } else {
        preview.classList.add('hidden');
        editor.classList.remove('hidden');
      }
    });

    // Delete
    main.querySelector('#puzzle-delete').addEventListener('click', () => {
      if (confirm('Delete this puzzle entry?')) {
        puzzles = puzzles.filter(p => p.id !== id);
        savePuzzles();
        activeId = null;
        renderList();
        main.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted)">Puzzle deleted</div>';
      }
    });
  }

  function renderMarkdown(text) {
    // Simple markdown renderer
    return text
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^- (.+)$/gm, '• $1<br>')
      .replace(/^\d+\. (.+)$/gm, (_, text) => `${text}<br>`)
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  // New puzzle
  container.querySelector('#nb-new').addEventListener('click', () => {
    const puzzle = {
      id: 'p_' + Date.now(),
      title: '',
      platform: 'other',
      level: '',
      url: '',
      status: 'unsolved',
      solution: '',
      notes: '',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    puzzles.unshift(puzzle);
    savePuzzles();
    openPuzzle(puzzle.id);
  });

  // Search & filter
  container.querySelector('#nb-search').addEventListener('input', renderList);
  container.querySelector('#nb-filter').addEventListener('change', renderList);
  container.querySelector('#nb-status-filter').addEventListener('change', renderList);

  // Export
  container.querySelector('#nb-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(puzzles, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'puzzle-notebook.json'; a.click();
  });

  // Import
  container.querySelector('#nb-import').addEventListener('click', () => {
    container.querySelector('#nb-import-file').click();
  });
  container.querySelector('#nb-import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          puzzles = [...imported, ...puzzles];
          savePuzzles();
          renderList();
        }
      } catch(err) { alert('Invalid JSON file'); }
    };
    reader.readAsText(file);
  });

  renderList();
}

Router.register('/toolkit/notebook', 'notebook', renderNotebook);
