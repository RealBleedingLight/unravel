// === PUZZLE NOTEBOOK ===
function renderNotebook(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title"><span class="title-accent">◳</span> Puzzle Notebook</h1>
      <p class="page-subtitle">Organise puzzles by series and level — syncs to the cloud when signed in</p>
    </div>
    <div class="nb-layout">

      <div class="nb-sidebar" id="nb-sidebar">

        <div class="nb-auth" id="nb-auth">
          <div id="nb-auth-inner"><span style="font-size:0.7rem;color:var(--text-muted)">Checking sync…</span></div>
        </div>

        <div class="nb-filters">
          <input type="text" id="nb-search" class="nb-search-input" placeholder="Search…">
          <select id="nb-status-filter" class="nb-filter-select">
            <option value="all">All status</option>
            <option value="unsolved">Unsolved</option>
            <option value="in-progress">In Progress</option>
            <option value="solved">Solved</option>
            <option value="stuck">Stuck</option>
          </select>
        </div>

        <div id="nb-chapter-list"></div>

        <div class="nb-sidebar-footer">
          <button class="btn btn-accent btn-small w-full" id="nb-new-chapter">+ New Chapter</button>
          <div style="display:flex;gap:4px;margin-top:6px">
            <button class="btn btn-small" style="flex:1" id="nb-export">Export</button>
            <button class="btn btn-small" style="flex:1" id="nb-import">Import</button>
            <input type="file" id="nb-import-file" accept=".json" style="display:none">
          </div>
        </div>

      </div>

      <div class="nb-main" id="nb-main">
        <div class="nb-empty-state">
          <div class="nb-empty-icon">◳</div>
          <div>Select a chapter or level, or create a new one</div>
        </div>
      </div>

    </div>
  `;

  let chapters = Store.get('chapters', []);
  let levels   = Store.get('levels',   []);
  let activeChapterId = null;
  let activeLevelId   = null;
  let expandedChapters = new Set(Store.get('nb_expanded', []));

  // ── Persistence ────────────────────────────────────────────────────────────

  function saveChapters() { Store.set('chapters', chapters); }
  function saveLevels()   { Store.set('levels',   levels);   }
  function saveExpanded() { Store.set('nb_expanded', [...expandedChapters]); }

  // ── Auth UI ────────────────────────────────────────────────────────────────

  function renderAuth() {
    const wrap = container.querySelector('#nb-auth-inner');
    if (!wrap) return;

    if (Sync.isLoggedIn) {
      wrap.innerHTML = `
        <div class="nb-auth-row">
          <span class="nb-sync-dot"></span>
          <span class="nb-auth-email">${esc(Sync.userEmail)}</span>
          <button class="btn btn-small" id="nb-signout">Sign out</button>
        </div>
      `;
      wrap.querySelector('#nb-signout').addEventListener('click', async () => {
        await Sync.signOut();
        renderAuth();
      });

    } else {
      wrap.innerHTML = `
        <button class="btn btn-small w-full nb-signin-btn" id="nb-show-form">☁ Sign in to sync</button>
      `;
      wrap.querySelector('#nb-show-form').addEventListener('click', () => showLoginForm());
    }
  }

  function showLoginForm() {
    const wrap = container.querySelector('#nb-auth-inner');
    wrap.innerHTML = `
      <div class="nb-auth-form">
        <input type="email" id="nb-email" placeholder="your@email.com" autocomplete="email">
        <div style="display:flex;gap:4px;margin-top:4px">
          <button class="btn btn-accent btn-small" style="flex:1" id="nb-send">Send magic link</button>
          <button class="btn btn-small" id="nb-cancel">✕</button>
        </div>
        <div id="nb-auth-msg"></div>
      </div>
    `;

    const emailInput = wrap.querySelector('#nb-email');
    const sendBtn    = wrap.querySelector('#nb-send');
    const msg        = wrap.querySelector('#nb-auth-msg');

    emailInput.focus();

    const submit = async () => {
      const email = emailInput.value.trim();
      if (!email) { msg.textContent = 'Enter your email.'; return; }
      sendBtn.textContent = 'Sending…';
      sendBtn.disabled = true;
      const error = await Sync.sendMagicLink(email);
      if (error) {
        msg.style.color = 'var(--danger)';
        msg.textContent = error.message;
        sendBtn.textContent = 'Send magic link';
        sendBtn.disabled = false;
      } else {
        wrap.innerHTML = `<div class="nb-auth-sent">✓ Check your email for the sign-in link</div>`;
      }
    };

    sendBtn.addEventListener('click', submit);
    emailInput.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    wrap.querySelector('#nb-cancel').addEventListener('click', renderAuth);
  }

  // ── Status helpers ─────────────────────────────────────────────────────────

  const STATUS_COLOR = {
    'unsolved':    'var(--text-muted)',
    'in-progress': 'var(--warning)',
    'solved':      'var(--accent)',
    'stuck':       'var(--danger)'
  };

  function statusColor(s) { return STATUS_COLOR[s] || 'var(--text-muted)'; }

  // ── Sidebar ────────────────────────────────────────────────────────────────

  function renderSidebar() {
    const search   = (container.querySelector('#nb-search')?.value || '').toLowerCase();
    const sfilt    = container.querySelector('#nb-status-filter')?.value || 'all';
    const listEl   = container.querySelector('#nb-chapter-list');
    if (!listEl) return;

    if (chapters.length === 0) {
      listEl.innerHTML = `<div class="nb-chapters-empty">No chapters yet.<br>Create one below.</div>`;
      return;
    }

    listEl.innerHTML = '';

    const sorted = [...chapters].sort((a, b) => new Date(b.updated) - new Date(a.updated));

    sorted.forEach(chapter => {
      const allLevels = levels.filter(l => l.chapterId === chapter.id);
      const solvedCount = allLevels.filter(l => l.status === 'solved').length;
      const isExpanded  = expandedChapters.has(chapter.id);
      const isActive    = activeChapterId === chapter.id && !activeLevelId;

      // Filter levels for search/status
      const visibleLevels = allLevels
        .filter(l => {
          if (sfilt !== 'all' && l.status !== sfilt) return false;
          if (search) {
            const haystack = (l.title + l.levelNumber + l.notes + chapter.name).toLowerCase();
            if (!haystack.includes(search)) return false;
          }
          return true;
        })
        .sort((a, b) => {
          const na = parseInt(a.levelNumber) || 0;
          const nb = parseInt(b.levelNumber) || 0;
          return na !== nb ? na - nb : (a.title || '').localeCompare(b.title || '');
        });

      // Show all levels if no filter active
      const showLevels = (search || sfilt !== 'all') ? visibleLevels : allLevels.sort((a, b) => {
        const na = parseInt(a.levelNumber) || 0;
        const nb = parseInt(b.levelNumber) || 0;
        return na !== nb ? na - nb : (a.title || '').localeCompare(b.title || '');
      });

      const chEl = document.createElement('div');
      chEl.className = 'nb-chapter';
      chEl.innerHTML = `
        <div class="nb-chapter-header${isActive ? ' active' : ''}" data-id="${chapter.id}">
          <button class="nb-chevron${isExpanded ? ' open' : ''}" data-toggle="${chapter.id}" aria-label="Expand">▶</button>
          <span class="nb-chapter-dot" style="background:${chapter.color}"></span>
          <span class="nb-chapter-name">${esc(chapter.name || 'Untitled')}</span>
          <span class="nb-chapter-count">${solvedCount}/${allLevels.length}</span>
          <button class="nb-add-level-icon" data-chapter="${chapter.id}" title="Add level">+</button>
        </div>
        ${isExpanded ? `
          <div class="nb-level-list">
            ${showLevels.map(l => `
              <div class="nb-level-row${l.id === activeLevelId ? ' active' : ''}" data-lid="${l.id}">
                <span class="nb-level-dot" style="background:${statusColor(l.status)}"></span>
                <span class="nb-level-num">${l.levelNumber ? esc(l.levelNumber) + '. ' : ''}</span>
                <span class="nb-level-title">${esc(l.title || 'Untitled')}</span>
              </div>
            `).join('')}
            <div class="nb-add-level-row">
              <button class="nb-add-level-btn" data-chapter="${chapter.id}">+ Add level</button>
            </div>
          </div>
        ` : ''}
      `;
      listEl.appendChild(chEl);
    });

    // Chapter header → open chapter editor (not on chevron or + button)
    listEl.querySelectorAll('.nb-chapter-header').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.closest('.nb-chevron') || e.target.closest('.nb-add-level-icon')) return;
        openChapter(el.dataset.id);
      });
    });

    // Chevron toggle
    listEl.querySelectorAll('.nb-chevron').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.toggle;
        expandedChapters.has(id) ? expandedChapters.delete(id) : expandedChapters.add(id);
        saveExpanded();
        renderSidebar();
      });
    });

    // + Level buttons
    listEl.querySelectorAll('[data-chapter]').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); newLevel(btn.dataset.chapter); });
    });

    // Level row click
    listEl.querySelectorAll('.nb-level-row').forEach(el => {
      el.addEventListener('click', () => openLevel(el.dataset.lid));
    });
  }

  // ── Chapter editor ─────────────────────────────────────────────────────────

  const PALETTE = ['#2dffc2','#8b7aff','#ff4d6a','#ffb84d','#4da6ff','#ff7eb3','#a8ff78','#e0b0ff'];

  function openChapter(id) {
    activeChapterId = id;
    activeLevelId   = null;
    renderSidebar();

    const chapter = chapters.find(c => c.id === id);
    if (!chapter) return;

    const chLevels    = levels.filter(l => l.chapterId === id);
    const solvedCount = chLevels.filter(l => l.status === 'solved').length;
    const ipCount     = chLevels.filter(l => l.status === 'in-progress').length;
    const stuckCount  = chLevels.filter(l => l.status === 'stuck').length;

    const main = container.querySelector('#nb-main');
    main.innerHTML = `
      <div class="nb-editor">
        <div class="nb-editor-top">
          <div class="nb-chapter-badge" id="nb-ch-badge" style="background:${chapter.color}22;color:${chapter.color}">◳</div>
          <div style="flex:1;min-width:0">
            <input type="text" id="ch-name" class="nb-title-input" value="${esc(chapter.name)}" placeholder="Chapter name…">
            <input type="text" id="ch-desc" class="nb-desc-input" value="${esc(chapter.description)}" placeholder="Short description…">
          </div>
          <button class="btn btn-small btn-danger" id="ch-delete">Delete</button>
        </div>

        <div class="nb-field-row">
          <label class="nb-label">Base URL</label>
          <input type="url" id="ch-url" class="nb-field-input" value="${esc(chapter.url)}" placeholder="Homepage for this puzzle series…">
        </div>

        <div class="nb-field-row">
          <label class="nb-label">Colour</label>
          <div class="nb-palette">
            ${PALETTE.map(c => `<button class="nb-swatch${chapter.color === c ? ' selected' : ''}" data-color="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}
          </div>
        </div>

        <div class="nb-stats">
          <div class="nb-stat"><span class="nb-stat-n">${chLevels.length}</span><span class="nb-stat-l">Levels</span></div>
          <div class="nb-stat"><span class="nb-stat-n" style="color:var(--accent)">${solvedCount}</span><span class="nb-stat-l">Solved</span></div>
          <div class="nb-stat"><span class="nb-stat-n" style="color:var(--warning)">${ipCount}</span><span class="nb-stat-l">In Progress</span></div>
          <div class="nb-stat"><span class="nb-stat-n" style="color:var(--danger)">${stuckCount}</span><span class="nb-stat-l">Stuck</span></div>
        </div>

        <button class="btn btn-accent" id="ch-add-level" style="align-self:flex-start">+ Add Level</button>
      </div>
    `;

    // Auto-save text fields
    ['ch-name','ch-url','ch-desc'].forEach(fid => {
      main.querySelector(`#${fid}`).addEventListener('input', () => {
        chapter.name        = main.querySelector('#ch-name').value;
        chapter.url         = main.querySelector('#ch-url').value;
        chapter.description = main.querySelector('#ch-desc').value;
        chapter.updated     = new Date().toISOString();
        saveChapters();
        Sync.saveChapter(chapter);
        renderSidebar();
      });
    });

    // Colour swatches
    main.querySelectorAll('.nb-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        chapter.color   = sw.dataset.color;
        chapter.updated = new Date().toISOString();
        saveChapters();
        Sync.saveChapter(chapter);
        main.querySelectorAll('.nb-swatch').forEach(s => s.classList.toggle('selected', s.dataset.color === chapter.color));
        const badge = main.querySelector('#nb-ch-badge');
        badge.style.background = chapter.color + '22';
        badge.style.color      = chapter.color;
        renderSidebar();
      });
    });

    main.querySelector('#ch-add-level').addEventListener('click', () => newLevel(id));

    main.querySelector('#ch-delete').addEventListener('click', () => {
      const n = levels.filter(l => l.chapterId === id).length;
      const msg = n > 0
        ? `Delete "${chapter.name || 'this chapter'}" and all ${n} levels? This cannot be undone.`
        : `Delete "${chapter.name || 'this chapter'}"?`;
      if (!confirm(msg)) return;

      levels.filter(l => l.chapterId === id).forEach(l => Sync.deleteLevel(l.id));
      Sync.deleteChapter(id);

      chapters = chapters.filter(c => c.id !== id);
      levels   = levels.filter(l => l.chapterId !== id);
      saveChapters();
      saveLevels();
      expandedChapters.delete(id);
      activeChapterId = null;
      renderSidebar();
      main.innerHTML = `<div class="nb-empty-state"><div class="nb-empty-icon">◳</div><div>Chapter deleted</div></div>`;
    });
  }

  // ── Level editor ───────────────────────────────────────────────────────────

  function openLevel(id) {
    activeLevelId   = id;
    const level = levels.find(l => l.id === id);
    if (!level) return;

    activeChapterId = level.chapterId;
    expandedChapters.add(level.chapterId);
    saveExpanded();
    renderSidebar();

    const main = container.querySelector('#nb-main');
    main.innerHTML = `
      <div class="nb-editor">
        <div class="nb-editor-top">
          <input type="text" id="lv-num" class="nb-lv-num-input" value="${esc(level.levelNumber)}" placeholder="#">
          <div style="flex:1;min-width:0">
            <input type="text" id="lv-title" class="nb-title-input" value="${esc(level.title)}" placeholder="Level title…">
          </div>
          <select id="lv-status" class="nb-status-select">
            <option value="unsolved"    ${level.status==='unsolved'   ?'selected':''}>Unsolved</option>
            <option value="in-progress" ${level.status==='in-progress'?'selected':''}>In Progress</option>
            <option value="solved"      ${level.status==='solved'     ?'selected':''}>Solved</option>
            <option value="stuck"       ${level.status==='stuck'      ?'selected':''}>Stuck</option>
          </select>
          <button class="btn btn-small btn-danger" id="lv-delete">Delete</button>
        </div>

        <div class="nb-field-row">
          <label class="nb-label">URL</label>
          <div style="display:flex;gap:6px;flex:1">
            <input type="url" id="lv-url" class="nb-field-input" style="flex:1" value="${esc(level.url)}" placeholder="Direct link to this level…">
            ${level.url ? `<a href="${esc(level.url)}" target="_blank" rel="noopener" class="btn btn-small">Open ↗</a>` : ''}
          </div>
        </div>

        <div class="nb-field-row">
          <label class="nb-label">Solution</label>
          <input type="text" id="lv-solution" class="nb-field-input nb-solution" value="${esc(level.solution)}" placeholder="Answer / password…">
        </div>

        <div class="nb-notes-wrap">
          <div class="nb-notes-bar">
            <span class="nb-label">Notes</span>
            <div style="display:flex;gap:4px">
              <button class="btn btn-small nb-tab active" data-tab="edit">Edit</button>
              <button class="btn btn-small nb-tab" data-tab="preview">Preview</button>
            </div>
          </div>
          <textarea class="note-editor" id="lv-notes" placeholder="# Research Notes&#10;&#10;## Clues&#10;- …&#10;&#10;## Attempts&#10;- …">${esc(level.notes)}</textarea>
          <div id="lv-preview" class="note-preview" style="display:none"></div>
        </div>
      </div>
    `;

    // Set initial status colour
    updateStatusColor(main.querySelector('#lv-status'), level.status);

    // Auto-save
    const doSave = () => {
      level.title       = main.querySelector('#lv-title').value;
      level.levelNumber = main.querySelector('#lv-num').value;
      level.url         = main.querySelector('#lv-url').value;
      level.solution    = main.querySelector('#lv-solution').value;
      level.notes       = main.querySelector('#lv-notes').value;
      level.status      = main.querySelector('#lv-status').value;
      level.updated     = new Date().toISOString();
      saveLevels();
      Sync.saveLevel(level);
      renderSidebar();
    };

    ['lv-title','lv-num','lv-url','lv-solution','lv-notes'].forEach(fid => {
      main.querySelector(`#${fid}`).addEventListener('input', doSave);
    });

    main.querySelector('#lv-status').addEventListener('change', e => {
      updateStatusColor(e.target, e.target.value);
      doSave();
    });

    // Edit / Preview tabs
    main.querySelectorAll('.nb-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        main.querySelectorAll('.nb-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const editor  = main.querySelector('#lv-notes');
        const preview = main.querySelector('#lv-preview');
        if (btn.dataset.tab === 'preview') {
          preview.innerHTML = renderMarkdown(level.notes);
          preview.style.display = 'block';
          editor.style.display  = 'none';
        } else {
          preview.style.display = 'none';
          editor.style.display  = 'block';
        }
      });
    });

    // Delete level
    main.querySelector('#lv-delete').addEventListener('click', () => {
      if (!confirm(`Delete "${level.title || 'this level'}"?`)) return;
      Sync.deleteLevel(id);
      levels = levels.filter(l => l.id !== id);
      saveLevels();
      activeLevelId = null;
      openChapter(level.chapterId);
    });
  }

  function updateStatusColor(select, status) {
    select.style.color = statusColor(status);
  }

  // ── New chapter ────────────────────────────────────────────────────────────

  function newChapter() {
    const chapter = {
      id:          'ch_' + Date.now(),
      name:        '',
      description: '',
      url:         '',
      color:       '#2dffc2',
      created:     new Date().toISOString(),
      updated:     new Date().toISOString()
    };
    chapters.unshift(chapter);
    saveChapters();
    expandedChapters.add(chapter.id);
    saveExpanded();
    renderSidebar();
    openChapter(chapter.id);
    setTimeout(() => container.querySelector('#ch-name')?.focus(), 50);
  }

  // ── New level ──────────────────────────────────────────────────────────────

  function newLevel(chapterId) {
    const existing = levels.filter(l => l.chapterId === chapterId);
    const nextNum  = existing.length
      ? String(Math.max(...existing.map(l => parseInt(l.levelNumber) || 0)) + 1)
      : '1';

    const level = {
      id:          'lv_' + Date.now(),
      chapterId,
      title:       '',
      levelNumber: nextNum,
      url:         '',
      status:      'unsolved',
      solution:    '',
      notes:       '',
      created:     new Date().toISOString(),
      updated:     new Date().toISOString()
    };
    levels.push(level);
    saveLevels();
    expandedChapters.add(chapterId);
    saveExpanded();
    openLevel(level.id);
    setTimeout(() => container.querySelector('#lv-title')?.focus(), 50);
  }

  // ── Markdown ───────────────────────────────────────────────────────────────

  function renderMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
      .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>')
      .replace(/`(.+?)`/g,       '<code>$1</code>')
      .replace(/^[-*] (.+)$/gm,  '<li>$1</li>')
      .replace(/^> (.+)$/gm,     '<blockquote>$1</blockquote>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\n\n/g, '<br><br>');
  }

  function esc(s = '') {
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  // ── Sync events ────────────────────────────────────────────────────────────

  const isMounted = () => !!container.querySelector('#nb-sidebar');

  window.addEventListener('sync:updated', () => {
    if (!isMounted()) return;
    chapters = Store.get('chapters', []);
    levels   = Store.get('levels',   []);
    renderSidebar();
    renderAuth();
  });

  window.addEventListener('sync:signout', () => {
    if (!isMounted()) return;
    renderAuth();
  });

  // ── Export / Import ────────────────────────────────────────────────────────

  container.querySelector('#nb-export').addEventListener('click', () => {
    const data = { version: 2, chapters, levels, exported: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'cipher-signal-notebook.json'; a.click();
    URL.revokeObjectURL(url);
  });

  container.querySelector('#nb-import').addEventListener('click', () => {
    container.querySelector('#nb-import-file').click();
  });

  container.querySelector('#nb-import-file').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.version === 2 && data.chapters && data.levels) {
          // New format: merge by id
          const existingChIds = new Set(chapters.map(c => c.id));
          const existingLvIds = new Set(levels.map(l => l.id));
          chapters = [...chapters, ...data.chapters.filter(c => !existingChIds.has(c.id))];
          levels   = [...levels,   ...data.levels.filter(l   => !existingLvIds.has(l.id))];
        } else if (Array.isArray(data)) {
          // Old flat format: wrap in an "Imported" chapter
          const imp = {
            id: 'ch_import_' + Date.now(), name: 'Imported',
            description: 'Migrated from old format', url: '',
            color: '#8b7aff', created: new Date().toISOString(), updated: new Date().toISOString()
          };
          chapters.unshift(imp);
          levels = [
            ...data.map(p => ({
              id:          'lv_imp_' + p.id,
              chapterId:   imp.id,
              title:       p.title || '',
              levelNumber: p.level || '',
              url:         p.url   || '',
              status:      p.status || 'unsolved',
              solution:    p.solution || '',
              notes:       p.notes   || '',
              created:     p.created,
              updated:     p.updated
            })),
            ...levels
          ];
        }
        saveChapters();
        saveLevels();
        renderSidebar();
      } catch { alert('Invalid JSON file.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // ── Filters ────────────────────────────────────────────────────────────────

  container.querySelector('#nb-search').addEventListener('input', renderSidebar);
  container.querySelector('#nb-status-filter').addEventListener('change', renderSidebar);
  container.querySelector('#nb-new-chapter').addEventListener('click', newChapter);

  // ── Boot ───────────────────────────────────────────────────────────────────

  Sync.init().then(() => renderAuth());
  renderSidebar();
}

Router.register('/toolkit/notebook', 'notebook', renderNotebook);
