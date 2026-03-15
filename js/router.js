// === SPA Router — Landing + Toolkit ===
const Router = {
  routes: {},
  currentPage: null,

  register(path, pageName, renderFn) {
    this.routes[path] = { pageName, renderFn };
  },

  navigate(path, pushState = true) {
    const isToolkit = path.startsWith('/toolkit');
    const landing = document.getElementById('landing');
    const toolkit = document.getElementById('toolkit-app');

    if (!isToolkit) {
      // Show landing page
      landing.className = 'landing-visible';
      toolkit.className = 'toolkit-hidden';
      if (pushState) history.pushState({ path }, '', path);
      window.scrollTo(0, 0);
      initGridCanvas();
      return;
    }

    // Show toolkit
    landing.className = 'landing-hidden';
    toolkit.className = 'toolkit-visible';

    const route = this.routes[path] || this.routes['/toolkit'];
    if (!route) return;

    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-page') === route.pageName);
    });

    // Render page
    const content = document.getElementById('content');
    content.innerHTML = '';
    const page = document.createElement('div');
    page.className = 'page-enter';
    page.id = `page-${route.pageName}`;
    content.appendChild(page);
    route.renderFn(page);

    this.currentPage = route.pageName;

    if (pushState) history.pushState({ path }, '', path);

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');
    window.scrollTo(0, 0);
  },

  init() {
    // Handle nav clicks (toolkit sidebar)
    document.querySelectorAll('.nav-item').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(link.getAttribute('href'));
      });
    });

    // Landing page links to toolkit
    ['enter-toolkit', 'nav-toolkit'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', (e) => { e.preventDefault(); this.navigate('/toolkit'); });
    });

    // Home links
    ['home-link', 'back-home', 'sidebar-home'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', (e) => { e.preventDefault(); this.navigate('/'); });
    });

    // Handle back/forward
    window.addEventListener('popstate', (e) => {
      const path = e.state?.path || window.location.pathname;
      this.navigate(path, false);
    });

    // Sidebar toggle
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    // Initial route
    const path = window.location.pathname;
    this.navigate(path === '/' ? '/' : path, false);
  }
};

// Background grid canvas for landing page
function initGridCanvas() {
  const canvas = document.getElementById('grid-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  function resize() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gap = 50 * dpr;
    ctx.strokeStyle = 'rgba(45,255,194,0.04)';
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Accent dots at intersections
    ctx.fillStyle = 'rgba(45,255,194,0.06)';
    for (let x = 0; x < canvas.width; x += gap) {
      for (let y = 0; y < canvas.height; y += gap) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  resize();
  window.addEventListener('resize', resize);
}

// Helper to create elements
function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') e.className = v;
    else if (k === 'innerHTML') e.innerHTML = v;
    else if (k === 'textContent') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else e.setAttribute(k, v);
  }
  children.forEach(c => {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else if (c) e.appendChild(c);
  });
  return e;
}

function outputBox(id) {
  const box = el('div', { className: 'output-box', id });
  const copyBtn = el('button', {
    className: 'copy-btn', textContent: 'COPY',
    onClick: () => {
      navigator.clipboard.writeText(box.textContent.replace('COPY', '').trim());
      copyBtn.textContent = 'OK!';
      setTimeout(() => copyBtn.textContent = 'COPY', 1200);
    }
  });
  box.appendChild(copyBtn);
  return box;
}

// Storage helper
const Store = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem('cs_' + key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem('cs_' + key, JSON.stringify(value)); },
  delete(key) { localStorage.removeItem('cs_' + key); }
};
