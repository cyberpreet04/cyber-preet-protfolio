/* ─────────────────────────────────────────────
   PREET PORTFOLIO – MAIN SCRIPT
───────────────────────────────────────────── */
'use strict';

/* ════════════════════════════════════════════
   0.  UTILITIES
═══════════════════════════════════════════ */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const lerp  = (a, b, t) => a + (b - a) * t;
const rand  = (lo, hi) => lo + Math.random() * (hi - lo);
const randInt = (lo, hi) => Math.floor(rand(lo, hi));

/* ════════════════════════════════════════════
   1.  CUSTOM CURSOR
═══════════════════════════════════════════ */
(function initCursor() {
  const cursor = $('#cursor');
  const trail  = $('#cursor-trail');
  if (!cursor || !trail) return;

  let mx = -200, my = -200;
  let tx = -200, ty = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'py';
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';

    // trail dots
    createTrailDot(mx, my);
  });

  // Smooth trail ring
  function animTrail() {
    tx = lerp(tx, mx, .12);
    ty = lerp(ty, my, .12);
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(animTrail);
  }
  animTrail();

  // Hover state
  document.querySelectorAll('a, button, .cert-card, .filter-btn, .tech-icon-chip, .project-card, .skill-chip, .nav-link').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  // Trail dots
  let lastDotTime = 0;
  function createTrailDot(x, y) {
    const now = Date.now();
    if (now - lastDotTime < 40) return;
    lastDotTime = now;
    const dot = document.createElement('div');
    dot.className = 'trail-dot';
    dot.style.left = x + 'px';
    dot.style.top  = y + 'px';
    document.getElementById('mouse-trail-container').appendChild(dot);
    setTimeout(() => dot.remove(), 600);
  }
})();

/* ════════════════════════════════════════════
   2.  LOADING SCREEN
═══════════════════════════════════════════ */
(function initLoader() {
  const loader  = $('#loader');
  const bar     = $('#loader-bar');
  const pct     = $('#loader-percent');
  const status  = $('#loader-status');
  const canvas  = $('#loader-canvas');
  if (!loader) return;

  // Particle canvas behind loader text
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const pts = Array.from({length:120}, () => ({
    x: rand(0, canvas.width), y: rand(0, canvas.height),
    r: rand(.5, 2.5), vx: rand(-0.3, 0.3), vy: rand(-0.3, 0.3),
    a: rand(.2, .7)
  }));

  function drawLoaderCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${p.a})`;
      ctx.fill();
    });
    if (!loader.classList.contains('hidden')) requestAnimationFrame(drawLoaderCanvas);
  }
  drawLoaderCanvas();

  const statuses = [
    'Loading systems...', 'Decrypting assets...',
    'Initializing modules...', 'Calibrating interface...',
    'Establishing connection...', 'PREET.EXE ready.'
  ];
  let progress = 0;
  let statusIdx = 0;
  const total = 1800;
  const start = Date.now();

  function tick() {
    const elapsed = Date.now() - start;
    progress = clamp(Math.floor((elapsed / total) * 100), 0, 100);

    bar.style.width = progress + '%';
    pct.textContent = progress + '%';

    const si = Math.floor((progress / 100) * (statuses.length - 1));
    if (si !== statusIdx) { statusIdx = si; status.textContent = statuses[statusIdx]; }

    if (progress >= 100) {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.classList.remove('no-overflow');
        startHeroAnimations();
      }, 400);
    } else {
      requestAnimationFrame(tick);
    }
  }

  document.body.classList.add('no-overflow');
  requestAnimationFrame(tick);
})();

/* ════════════════════════════════════════════
   3.  HERO CANVAS – PARTICLES + NETWORK
═══════════════════════════════════════════ */
(function initHeroCanvas() {
  const canvas = $('#hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const PARTICLE_COUNT = 120;
  const MAX_DIST = 140;
  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  const particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle());

  function createParticle() {
    return {
      x: rand(0, canvas.width),
      y: rand(0, canvas.height),
      vx: rand(-0.5, 0.5),
      vy: rand(-0.5, 0.5),
      r: rand(1, 3),
      a: rand(.3, .9),
      color: [
        `rgba(0,212,255,`,
        `rgba(168,85,247,`,
        `rgba(6,255,165,`
      ][randInt(0, 3)]
    };
  }

  function drawHero() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;

      // Bounce
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      // Mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 120) {
        const force = (120 - d) / 120 * 1.5;
        p.vx += (dx / d) * force * .05;
        p.vy += (dy / d) * force * .05;
      }

      // Speed limit
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 2) { p.vx /= speed; p.vy /= speed; }

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.a + ')';
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx2 = p.x - q.x;
        const dy2 = p.y - q.y;
        const d2  = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (d2 < MAX_DIST) {
          const alpha = (1 - d2 / MAX_DIST) * .35;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.lineWidth = .8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawHero);
  }
  drawHero();
})();

/* ════════════════════════════════════════════
   4.  MATRIX RAIN
═══════════════════════════════════════════ */
(function initMatrixRain() {
  const container = $('#matrix-rain');
  if (!container) return;
  const COLS = Math.floor(window.innerWidth / 22);
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニセキロン0123456789ABCDEF<>/{}[]!@#';

  for (let i = 0; i < COLS; i++) {
    const col = document.createElement('div');
    col.style.cssText = `
      position:absolute; top:0; left:${i * 22}px;
      font-family:'Share Tech Mono',monospace; font-size:13px;
      color: #00d4ff; writing-mode:vertical-lr;
      animation: matrix-fall ${rand(3,8).toFixed(1)}s linear ${rand(0,4).toFixed(1)}s infinite;
      white-space:nowrap; opacity:.3;
    `;
    col.textContent = Array.from({length: randInt(8, 24)}, () => chars[randInt(0,chars.length)]).join('');
    container.appendChild(col);
  }

  // CSS for matrix fall
  if (!document.getElementById('matrix-style')) {
    const s = document.createElement('style');
    s.id = 'matrix-style';
    s.textContent = `
      @keyframes matrix-fall {
        from { transform: translateY(-100%); opacity:.4; }
        to   { transform: translateY(110vh); opacity:0; }
      }
    `;
    document.head.appendChild(s);
  }
})();

/* ════════════════════════════════════════════
   5.  HERO ANIMATIONS (triggered after load)
═══════════════════════════════════════════ */
function startHeroAnimations() {
  // Typed roles
  const roles = [
    'Cybersecurity Enthusiast',
    'Web Developer',
    'Penetration Tester',
    'Bug Hunter',
    'Application Developer'
  ];
  let rIdx = 0, cIdx = 0, deleting = false;
  const el = $('#typed-role');

  function typeRole() {
    if (!el) return;
    const current = roles[rIdx];
    if (!deleting) {
      el.textContent = current.slice(0, ++cIdx);
      if (cIdx === current.length) {
        deleting = true;
        setTimeout(typeRole, 1800);
        return;
      }
      setTimeout(typeRole, 80);
    } else {
      el.textContent = current.slice(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        rIdx = (rIdx + 1) % roles.length;
        setTimeout(typeRole, 500);
        return;
      }
      setTimeout(typeRole, 40);
    }
  }
  typeRole();

  // Stat counters
  animateCounters();
}

/* ════════════════════════════════════════════
   6.  NAVBAR
═══════════════════════════════════════════ */
(function initNavbar() {
  const navbar = $('#navbar');
  const toggle = $('#nav-toggle');
  const links  = $('#nav-links');
  if (!navbar) return;

  // Scrolled class
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    updateActiveLink();
  }, { passive: true });

  // Mobile toggle
  toggle?.addEventListener('click', () => {
    links?.classList.toggle('open');
    $$('.nav-toggle span').forEach((s, i) => {
      s.style.transform = links?.classList.contains('open')
        ? i === 0 ? 'rotate(45deg) translate(5px,5px)'
          : i === 1 ? 'opacity: 0'
          : 'rotate(-45deg) translate(5px,-5px)'
        : '';
      if (i === 1) s.style.opacity = links?.classList.contains('open') ? '0' : '1';
    });
  });

  // Close on link click
  $$('.nav-link').forEach(a => {
    a.addEventListener('click', () => links?.classList.remove('open'));
  });

  // Active link
  function updateActiveLink() {
    const sections = $$('section[id]');
    const scrollY  = window.scrollY + window.innerHeight / 2;
    let current = 'hero';
    sections.forEach(s => {
      if (s.offsetTop <= scrollY) current = s.id;
    });
    $$('.nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.section === current);
    });
  }
})();

/* ════════════════════════════════════════════
   7.  SMOOTH SCROLL
═══════════════════════════════════════════ */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ════════════════════════════════════════════
   8.  SCROLL REVEAL (Intersection Observer)
═══════════════════════════════════════════ */
(function initScrollReveal() {
  const opts = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
  const obs  = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        // Stagger children
        const delay = el.dataset.delay || 0;
        setTimeout(() => el.classList.add('visible'), Number(delay));
        obs.unobserve(el);
      }
    });
  }, opts);

  $$('.reveal-up, .reveal-left, .reveal-right').forEach((el, i) => {
    el.dataset.delay = i % 4 * 120;
    obs.observe(el);
  });

  $$('.reveal-timeline').forEach((el, i) => {
    el.dataset.delay = i * 200;
    obs.observe(el);
  });
})();

/* ════════════════════════════════════════════
   9.  TIMELINE GLOW LINES
═══════════════════════════════════════════ */
(function initTimelineLines() {
  const lines = $$('.timeline-line');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('active');
    });
  }, { threshold: 0.1 });
  lines.forEach(l => obs.observe(l));
})();

/* ════════════════════════════════════════════
  10.  SKILL BAR ANIMATION
═══════════════════════════════════════════ */
(function initSkillBars() {
  const bars = $$('.skill-bar-fill');
  const obs  = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = e.target.dataset.width || 0;
        e.target.style.width = target + '%';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  bars.forEach(b => obs.observe(b));
})();

/* ════════════════════════════════════════════
  11.  COUNTER ANIMATIONS
═══════════════════════════════════════════ */
function animateCounters() {
  const counters = $$('[data-target]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        countUp(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

function countUp(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const start = Date.now();
  function update() {
    const elapsed = Date.now() - start;
    const progress = clamp(elapsed / duration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

animateCounters();

/* ════════════════════════════════════════════
  12.  INTRO TYPING EFFECT
═══════════════════════════════════════════ */
(function initIntroTyping() {
  const el = $('#intro-typed');
  if (!el) return;
  const text = "Hello, I'm Preet Shingala.";
  let i = 0;

  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      function type() {
        if (i <= text.length) {
          el.textContent = text.slice(0, i++);
          setTimeout(type, 75);
        }
      }
      type();
      obs.disconnect();
    }
  }, { threshold: 0.5 });

  const target = $('#intro');
  if (target) obs.observe(target);
})();

/* ════════════════════════════════════════════
  13.  3D TILT EFFECT ON CARDS
═══════════════════════════════════════════ */
(function initTiltCards() {
  $$('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const maxTilt = 12;
      card.style.transform = `
        perspective(800px)
        rotateY(${dx * maxTilt}deg)
        rotateX(${-dy * maxTilt}deg)
        translateZ(10px)
      `;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .5s ease';
      setTimeout(() => card.style.transition = '', 500);
    });
    card.addEventListener('mouseenter', () => { card.style.transition = 'none'; });
  });
})();

/* ════════════════════════════════════════════
  14.  PARALLAX HERO ON MOUSE MOVE
═══════════════════════════════════════════ */
(function initParallax() {
  const hero = $('#hero');
  if (!hero) return;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  hero.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    targetX = (e.clientX - cx) / cx * 20;
    targetY = (e.clientY - cy) / cy * 20;
  });

  const el = hero.querySelector('.hero-content');
  function animParallax() {
    currentX = lerp(currentX, targetX, .08);
    currentY = lerp(currentY, targetY, .08);
    if (el) el.style.transform = `translate(${currentX * .4}px, ${currentY * .4}px)`;
    requestAnimationFrame(animParallax);
  }
  animParallax();
})();

/* ════════════════════════════════════════════
  15.  PROJECTS FILTER
═══════════════════════════════════════════ */
(function initProjectFilter() {
  const buttons = $$('.filter-btn');
  const cards   = $$('.project-card');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const cat = card.dataset.cat;
        const visible = filter === 'all' || cat === filter;
        card.style.transition = 'all .4s cubic-bezier(.25,.8,.25,1)';
        if (visible) {
          card.style.opacity = '1';
          card.style.transform = '';
          card.style.pointerEvents = '';
          card.style.maxHeight = '';
          card.classList.remove('hidden-filter');
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(.85)';
          card.style.pointerEvents = 'none';
          card.classList.add('hidden-filter');
        }
      });
    });
  });
})();

/* ════════════════════════════════════════════
  16.  CERTIFICATE MODAL
═══════════════════════════════════════════ */
// ==========================================
// HOW TO ADD YOUR OWN CERTIFICATE PDFs:
// 1. Save your certificate PDF files inside the "certs" folder.
// 2. Change the 'file' property below to match your filename.
//    Example: file: 'certs/my-security-cert.pdf'
// ==========================================
const certData = [
  { icon:'🔐', name:'CEH – Certified Ethical Hacker', issuer:'EC-Council', year:'2024', file:'' },
  { icon:'💀', name:'OSCP – Offensive Security', issuer:'Offensive Security', year:'2023', file:'' },
  { icon:'☁',  name:'AWS Security Specialty', issuer:'Amazon Web Services', year:'2024', file:'' },
  { icon:'🛡',  name:'CompTIA Security+', issuer:'CompTIA', year:'2023', file:'' },
  { icon:'🕷',  name:'Web App Penetration Testing', issuer:'TCM Security', year:'2023', file:'' },
  { icon:'🐍', name:'Python for Cybersecurity', issuer:'Coursera / Google', year:'2022', file:'' },
];

function openCertModal(idx) {
  const modal   = $('#cert-modal');
  const d       = certData[idx];
  if (!modal || !d) return;
  
  $('#modal-icon').textContent   = d.icon;
  // If we are currently in DE, try to get the translated name from the clicked card
  const cards = document.querySelectorAll('.cert-card .cert-name');
  if (cards[idx]) {
    $('#modal-title').textContent = cards[idx].textContent;
  } else {
    $('#modal-title').textContent = d.name;
  }
  
  $('#modal-issuer').textContent = currentLang === 'en' ? `Issued by: ${d.issuer}` : `Ausgestellt von: ${d.issuer}`;
  $('#modal-year').textContent   = currentLang === 'en' ? `Year: ${d.year}` : `Jahr: ${d.year}`;

  const iframeEl = $('#modal-cert-iframe');
  const placeholder = $('#modal-cert-placeholder');
  
  if (d.file) {
    iframeEl.src = d.file;
    iframeEl.classList.remove('hidden');
    placeholder.style.display = 'none';
  } else {
    iframeEl.src = '';
    iframeEl.classList.add('hidden');
    placeholder.style.display = 'block';
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCertModal(e) {
  const modal = $('#cert-modal');
  if (!modal) return;
  if (e && e.target !== modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

window.openCertModal  = openCertModal;
window.closeCertModal = closeCertModal;

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeCertModal({ target: $('#cert-modal') });
});

/* ════════════════════════════════════════════
  17.  BACKGROUND PARTICLE SECTIONS
═══════════════════════════════════════════ */
function createSectionParticles(containerId, color = '#00d4ff', count = 30) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const style = document.createElement('style');
  const styleId = `${containerId}-style`;
  if (!document.getElementById(styleId)) {
    style.id = styleId;
    style.textContent = `
      @keyframes float-particle-${containerId} {
        0%   { transform: translateY(0)   rotate(0deg); opacity:.5; }
        50%  { transform: translateY(-60px) rotate(180deg); opacity:.2; }
        100% { transform: translateY(0)   rotate(360deg); opacity:.5; }
      }
    `;
    document.head.appendChild(style);
  }

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size = rand(2, 8);
    p.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      left:${rand(0, 100)}%; top:${rand(0, 100)}%;
      background:${color};
      border-radius:${Math.random() > .5 ? '50%' : '2px'};
      opacity:${rand(.05, .3)};
      animation: float-particle-${containerId} ${rand(4, 12).toFixed(1)}s ease ${rand(0,5).toFixed(1)}s infinite;
    `;
    container.appendChild(p);
  }
}

createSectionParticles('intro-particles', '#00d4ff', 25);
createSectionParticles('edu-particles',   '#a855f7', 20);
createSectionParticles('cert-particles',  '#06ffa5', 25);

/* ════════════════════════════════════════════
  18.  GLITCH HOVER ON SECTION TITLES
═══════════════════════════════════════════ */
$$('.section-title').forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.style.animation = 'glitch-title .3s ease';
    setTimeout(() => el.style.animation = '', 300);
  });
});

if (!document.getElementById('glitch-title-style')) {
  const s = document.createElement('style');
  s.id = 'glitch-title-style';
  s.textContent = `
    @keyframes glitch-title {
      0%  { text-shadow: none; }
      20% { text-shadow: 3px 0 #ff006e, -3px 0 #00d4ff; }
      40% { text-shadow: -3px 0 #ff006e, 3px 0 #00d4ff; filter:blur(1px); }
      60% { text-shadow: 3px 0 #06ffa5, -3px 0 #a855f7; }
      80% { text-shadow: -2px 0 #00d4ff; filter:blur(0); }
      100%{ text-shadow: none; }
    }
  `;
  document.head.appendChild(s);
}

/* ════════════════════════════════════════════
  19.  KONAMI CODE EASTER EGG
═══════════════════════════════════════════ */
(function initEasterEgg() {
  const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
                    'b','a'];
  let idx = 0;

  document.addEventListener('keydown', e => {
    if (e.key === sequence[idx]) {
      idx++;
      if (idx === sequence.length) {
        idx = 0;
        showEasterEgg();
      }
    } else {
      idx = 0;
    }
  });

  function showEasterEgg() {
    const egg = $('#easter-egg');
    if (!egg) return;
    egg.classList.remove('hidden');
    // Glitch flash
    document.body.style.animation = 'glitch-title .5s ease';
    setTimeout(() => document.body.style.animation = '', 500);
  }
})();

function closeEgg() {
  const egg = $('#easter-egg');
  if (egg) egg.classList.add('hidden');
}
window.closeEgg = closeEgg;

/* ════════════════════════════════════════════
  20.  NEON PULSE ANIMATION ON BUTTONS
═══════════════════════════════════════════ */
(function initButtonPulse() {
  $$('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute;
        width:10px; height:10px;
        border-radius:50%;
        background:rgba(0,212,255,.6);
        left:${e.offsetX}px; top:${e.offsetY}px;
        transform:translate(-50%,-50%) scale(0);
        animation:btn-ripple .6s ease forwards;
        pointer-events:none;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  if (!document.getElementById('btn-ripple-style')) {
    const s = document.createElement('style');
    s.id = 'btn-ripple-style';
    s.textContent = `
      @keyframes btn-ripple {
        to { transform:translate(-50%,-50%) scale(30); opacity:0; }
      }
    `;
    document.head.appendChild(s);
  }
})();

/* ════════════════════════════════════════════
  21.  DYNAMIC GLOWING FOOTER PARTICLES
═══════════════════════════════════════════ */
(function initFooterGlow() {
  const footer = $('.footer');
  if (!footer) return;
  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      footer.style.background = 'linear-gradient(0deg, #000308 0%, #020408 40%)';
      footer.style.boxShadow  = '0 -2px 60px rgba(0,212,255,.15)';
    }
  }, { threshold: .3 });
  obs.observe(footer);
})();

/* ════════════════════════════════════════════
  22.  ACTIVE SECTION HIGHLIGHT (SCAN LINE)
═══════════════════════════════════════════ */
(function initActiveSectionScan() {
  const sections = $$('section[id]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const section = e.target;
        section.style.setProperty('--section-active', '1');
      } else {
        e.target.style.setProperty('--section-active', '0');
      }
    });
  }, { threshold: .3 });
  sections.forEach(s => obs.observe(s));
})();

/* ════════════════════════════════════════════
  23.  HERO CORNER ANIMATED BRACKETS
═══════════════════════════════════════════ */
(function animateHeroCorners() {
  $$('.hero-corner').forEach((c, i) => {
    c.style.animation = `corner-${i % 2 === 0 ? 'pulse-a' : 'pulse-b'} 2s ease infinite`;
  });

  if (!document.getElementById('corner-style')) {
    const s = document.createElement('style');
    s.id = 'corner-style';
    s.textContent = `
      @keyframes corner-pulse-a {
        0%,100% { opacity:.4; width:20px; height:20px; }
        50%      { opacity:1;  width:28px; height:28px; box-shadow: 0 0 10px rgba(0,212,255,.8); }
      }
      @keyframes corner-pulse-b {
        0%,100% { opacity:.6; width:20px; height:20px; }
        50%      { opacity:1;  width:24px; height:24px; box-shadow: 0 0 10px rgba(0,212,255,.8); }
      }
    `;
    document.head.appendChild(s);
  }
})();

/* ════════════════════════════════════════════
  24.  AVATAR HOLO FLICKER
═══════════════════════════════════════════ */
(function avatarFlicker() {
  const icon = $('.avatar-placeholder');
  if (!icon) return;
  setInterval(() => {
    icon.style.filter = 'brightness(1.3) saturate(2)';
    setTimeout(() => icon.style.filter = '', 80);
  }, rand(3000, 6000));
})();

/* ════════════════════════════════════════════
  25.  PERFORMANCE: PAUSE ANIMATIONS WHEN TAB HIDDEN
═══════════════════════════════════════════ */
document.addEventListener('visibilitychange', () => {
  document.body.style.animationPlayState =
    document.hidden ? 'paused' : 'running';
});

/* ════════════════════════════════════════════
  26.  RESIZE HANDLER
═══════════════════════════════════════════ */
window.addEventListener('resize', () => {
  // re-init matrix on resize
  const rain = $('#matrix-rain');
  if (rain) {
    rain.innerHTML = '';
    const cols = Math.floor(window.innerWidth / 22);
    const chars = 'アイウエオ0123456789ABCDEF';
    for (let i = 0; i < cols; i++) {
      const col = document.createElement('div');
      col.style.cssText = `position:absolute;top:0;left:${i*22}px;font-family:'Share Tech Mono',monospace;font-size:13px;color:#00d4ff;writing-mode:vertical-lr;animation:matrix-fall ${rand(3,8).toFixed(1)}s linear ${rand(0,4).toFixed(1)}s infinite;white-space:nowrap;opacity:.3;`;
      col.textContent = Array.from({length: randInt(8,24)}, () => chars[randInt(0,chars.length)]).join('');
      rain.appendChild(col);
    }
  }
}, { passive: true });

console.log('%c PREET.EXE ', 'background:#00d4ff;color:#000;font-family:monospace;font-size:18px;font-weight:bold;padding:8px 20px;border-radius:4px;');
console.log('%c Cybersecurity Enthusiast | Web Dev | Pen Tester', 'color:#a855f7;font-size:12px;');
console.log('%c Type closeEgg() if you find the easter egg 😉', 'color:#06ffa5;font-size:11px;');

/* ════════════════════════════════════════════
  27.  LANGUAGE TOGGLE
═══════════════════════════════════════════ */
let currentLang = 'en';
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'de' : 'en';
  
  const flag = document.getElementById('lang-flag');
  const text = document.getElementById('lang-text');
  if (flag) flag.textContent = currentLang === 'en' ? '🇬🇧' : '🇩🇪';
  if (text) text.textContent = currentLang === 'en' ? 'EN' : 'DE';
  
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = el.getAttribute(`data-${currentLang}`);
  });
}
window.toggleLanguage = toggleLanguage;
