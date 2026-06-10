/* Kemi Cakes — UI behaviors */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function setTheme(theme) {
  if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else document.documentElement.removeAttribute('data-theme');
  localStorage.setItem('kemi-theme', theme);
}

function initThemeToggle() {
  const btn = $('#themeToggle');
  if (!btn) return;

  const saved = localStorage.getItem('kemi-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(saved ? saved : (prefersDark ? 'dark' : 'light'));

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
}

function initNavToggle() {
  const toggle = $('#navToggle');
  const nav = $('#primaryNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('show');
  });

  // close when clicking a link
  $$('#primaryNav a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function initScrollAnimations() {
  const nodes = $$('[data-animate]');
  if (!nodes.length || !('IntersectionObserver' in window)) {
    nodes.forEach(n => n.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });

  nodes.forEach(n => io.observe(n));
}

function initAccordion() {
  const acc = $('[data-accordion]');
  if (!acc) return;

  const items = $$('.acc-item', acc);
  items.forEach(item => {
    const btn = $('.acc-btn', item);
    const panel = $('.acc-panel', item);
    if (!btn || !panel) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      // Close others
      items.forEach(i => i.classList.remove('is-open'));
      if (!isOpen) item.classList.add('is-open');
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

function initTestimonialsSlider() {
  const slider = $('[data-slider]');
  if (!slider) return;

  const track = $('#sliderTrack');
  const slides = $$('[data-slide]', slider);
  const prev = $('[data-prev]', slider);
  const next = $('[data-next]', slider);
  const dotsWrap = $('[data-dots]', slider);
  if (!track || !slides.length || !prev || !next || !dotsWrap) return;

  let index = 0;
  const dots = [];

  // Ensure each slide is positioned by translating track
  track.style.willChange = 'transform';

  function buildDots() {
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dot';
      b.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      b.addEventListener('click', () => go(i, true));
      dotsWrap.appendChild(b);
      dots.push(b);
    });
  }

  function go(i, user = false) {
    index = (i + slides.length) % slides.length;
    const x = -index * 100;
    track.style.transform = `translateX(${x}%)`;
    dots.forEach(d => d.classList.remove('is-active'));
    if (dots[index]) dots[index].classList.add('is-active');

    if (user) pause();
  }

  let timer = null;
  function pause() { if (timer) clearInterval(timer); timer = null; }
  function play() {
    pause();
    timer = setInterval(() => go(index + 1), 5200);
  }

  prev.addEventListener('click', () => go(index - 1, true));
  next.addEventListener('click', () => go(index + 1, true));

  buildDots();
  go(0);
  play();
}

function initLightbox() {
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxCaption = $('#lightboxCaption');
  const closeBtn = $('#lightboxClose');
  if (!lightbox || !lightboxImg || !lightboxCaption || !closeBtn) return;

  function open(href, caption) {
    lightboxImg.src = href;
    lightboxImg.alt = caption || 'Gallery image';
    lightboxCaption.textContent = caption || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  // open links
  $$('[data-lightbox]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const href = a.getAttribute('href');
      const cap = a.querySelector('.gallery-cap')?.textContent || a.getAttribute('aria-label') || '';
      open(href, cap.trim());
    });
  });

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
  });
}

function initForms() {
  // Newsletter
  const nf = $('#newsletterForm');
  if (nf) {
    nf.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Subscribed! Thank you for joining Kemi Cakes updates.');
      nf.reset();
    });
  }

  // Mini order
  const mini = $('#miniOrderForm');
  if (mini) {
    mini.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = mini.querySelector('input[name="phone"]').value;
      alert('Order request sent! We will contact you shortly.');
      // Optional: could redirect to order.html with prefill. Keeping simple.
      mini.reset();
      // set a WhatsApp prefill if desired
      // window.location.href = buildWhatsAppLink(phone);
    });
  }

  // Simple order page forms
  const order = $('#orderForm');
  if (order) {
    order.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Order submitted! We will confirm your details shortly.');
      order.reset();
    });
  }

  const contact = $('#contactForm');
  if (contact) {
    contact.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = contact.querySelector('input[name="name"]').value.trim();
      const phone = contact.querySelector('input[name="phone"]').value.trim();
      const email = contact.querySelector('input[name="email"]').value.trim();
      const message = contact.querySelector('textarea[name="message"]').value.trim();

      // Keep behavior as requested: open WhatsApp with prefilled message (no alert)
      // and reset the form afterwards.
      const bizPhone = '+256791711855';
      const waNumber = bizPhone.replace(/\D/g, '');

      const parts = [
        'Hello Kemi Cakes!',
        '',
        'New contact request:',
        `Name: ${name || '—'}`,
        `Phone: ${phone || '—'}`,
        `Email: ${email || '—'}`,
        '',
        'Message:',
        message || '—'
      ];

      const text = encodeURIComponent(parts.join('\n'));
      window.location.href = `https://wa.me/${waNumber}?text=${text}`;

      contact.reset();
    });
  }
}

function initWhatsApp() {
  // Fill WhatsApp buttons with a message.
  const phone = '+256791711855';
  const prefills = [
    'Hello Kemi Cakes! I would like to order a cake. Can you confirm availability?'
  ];

  const whatsappLinks = {
    primary: phone,
    secondary: '+256791700923'
  };

  const setHref = (el, message) => {
    if (!el) return;
    const href = `https://wa.me/${phone.replace(/\D/g,'')}?text=${encodeURIComponent(message)}`;
    el.setAttribute('href', href);
  };

  // If user updates placeholders, they get a working link.
  setHref($('#whatsappFab'), prefills[0]);
  setHref($('#whatsappFloat'), prefills[0]);
}

function initAll() {
  initThemeToggle();
  initNavToggle();
  initScrollAnimations();
  initAccordion();
  initTestimonialsSlider();
  initLightbox();
  initForms();
  initWhatsApp();

  // Year
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

