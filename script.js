// script.js — handles scroll effects, reveals, header shrink, nav active state, and progress
(function () {
  const header = document.getElementById('site-header');
  const nav = document.getElementById('primary-nav');
  const navLinks = Array.from(nav.querySelectorAll('a'));
  const projectCards = Array.from(document.querySelectorAll('.project-card'));
  const timelineCards = Array.from(document.querySelectorAll('.timeline-card'));
  const scrollTopBtn = document.getElementById('scroll-top');
  const progressBar = document.getElementById('scroll-progress-bar');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // set year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // HEADER shrink on scroll + reveal scroll-top + progress bar update
  function onScroll() {
    const y = window.scrollY || window.pageYOffset;

    // shrink header after threshold
    if (y > 60) header.classList.add('scrolled');
    else header.classList.remove('scrolled');

    // show scroll-top
    if (y > 400) scrollTopBtn.classList.add('show');
    else scrollTopBtn.classList.remove('show');

    // progress
    const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const winHeight = window.innerHeight;
    const scrollable = docHeight - winHeight;
    const pct = scrollable > 0 ? (y / scrollable) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // scroll-to-top button
  scrollTopBtn.addEventListener('click', () => {
    if (prefersReduced) window.scrollTo(0, 0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // IntersectionObserver for project cards and timeline cards
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const revealOptions = { root: null, rootMargin: '0px 0px -80px 0px', threshold: 0.08 };

    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      });
    }, revealOptions);

    projectCards.forEach((card, i) => {
      // stagger via inline style (helps when many cards enter)
      card.style.transitionDelay = `${i * 70}ms`;
      revealObserver.observe(card);
    });

    // timeline cards: add in-view to light up dot
    timelineCards.forEach(card => revealObserver.observe(card));
  } else {
    // reduced motion or no IO: reveal all immediately
    projectCards.forEach(c => c.classList.add('in-view'));
    timelineCards.forEach(c => c.classList.add('in-view'));
  }

  // Active nav link highlighting using IntersectionObserver on sections
  if ('IntersectionObserver' in window) {
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = nav.querySelector(`a[href="#${id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { root: null, threshold: 0.5 });

    sections.forEach(s => sectionObserver.observe(s));
  }

  // Smooth fallback for click on nav links (respect reduced motion)
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // allow default hash behavior for anchor + smooth handled by CSS,
      // but ensure reduced-motion users get instant jump
      if (prefersReduced) {
        // let it jump
        return;
      }
      // close micro-jump in some browsers: prevent default then scroll smoothly
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // update hash without instant jump
        history.pushState(null, '', `#${targetId}`);
      }
    });
  });

  // keyboard accessibility: allow Esc to hide scroll-top when focused accidentally
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') scrollTopBtn.blur();
  });
})();