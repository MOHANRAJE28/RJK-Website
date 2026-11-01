// ── Hamburger / Mobile Nav ────────────────────────────────────────
(function () {
  const btn     = document.getElementById('hamburgerBtn');
  const nav     = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');

  if (!btn || !nav || !overlay) return;

  function updateNavAccessibility() {
    const mobile = window.innerWidth <= 768;
    nav.inert = mobile && !nav.classList.contains('is-open');
    nav.setAttribute('aria-hidden', String(nav.inert));
  }

  function openMobileNav() {
    btn.classList.add('is-open');
    nav.classList.add('is-open');
    overlay.classList.add('is-visible');
    btn.setAttribute('aria-expanded', 'true');
    updateNavAccessibility();
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  window.closeMobileNav = function () {
    btn.classList.remove('is-open');
    nav.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    btn.setAttribute('aria-expanded', 'false');
    updateNavAccessibility();
    document.body.style.overflow = '';
  };

  updateNavAccessibility();

  btn.addEventListener('click', function () {
    if (nav.classList.contains('is-open')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMobileNav();
    }
  });

  // Close nav when resizing back to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768 && nav.classList.contains('is-open')) {
      closeMobileNav();
    } else {
      updateNavAccessibility();
    }
  });
})();

// ── Branded site loader ───────────────────────────────────────────
(function () {
  const loader = document.getElementById('siteLoader');
  if (!loader) return;

  let dismissed = false;
  const startedAt = performance.now();
  function dismissLoader() {
    if (dismissed) return;
    dismissed = true;
    loader.classList.add('is-hidden');
    window.setTimeout(() => loader.remove(), 400);
  }

  if (document.readyState === 'complete') {
    window.setTimeout(dismissLoader, Math.max(0, 1300 - (performance.now() - startedAt)));
  } else {
    window.addEventListener('load', () => window.setTimeout(dismissLoader, Math.max(0, 1300 - (performance.now() - startedAt))), { once: true });
  }
  window.setTimeout(dismissLoader, 8000);
})();

// ── Services: desktop scroll and mobile swipe ─────────────────────
// Run after full page load so image sizes are correct
window.addEventListener('load', function () {
  const wrapper  = document.querySelector('.services-wrapper');
  const section  = document.querySelector('.services-section');
  const track    = document.querySelector('#servicesTrack');
  const fill     = document.querySelector('#svcProgress');

  if (!wrapper || !section || !track) return;

  let scrollHandler = null;

  function init() {
    // Clear any previous inline styles that might interfere
    [wrapper, section, track].forEach(el => el && el.removeAttribute('style'));

    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
      scrollHandler = null;
    }

    if (window.matchMedia('(max-width: 1024px)').matches) {
      wrapper.style.height = 'auto';
      track.style.transform = 'none';
      if (fill) fill.style.width = '0%';
      return;
    }
    
    // Explicitly enforce touch overlay visibility on mobile without JS setProperty
    // (We will manage card styles via pure CSS media queries, keeping the JS clean)

    const trackW  = track.scrollWidth;
    const viewW   = section.clientWidth;
    const travelX = trackW - viewW;

    if (travelX <= 0) return;

    wrapper.style.height = (window.innerHeight + travelX) + 'px';

    scrollHandler = function () {
      const rect     = wrapper.getBoundingClientRect();
      const scrolled = -rect.top;
      if (scrolled < 0 || scrolled > travelX) return;
      track.style.transform = `translateX(-${scrolled}px)`;
      if (fill) fill.style.width = (scrolled / travelX * 100) + '%';
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    scrollHandler();
  }

  init();
  window.addEventListener('resize', init);
});




// ── Projects Filter ───────────────────────────────────────────────
(function () {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterBtns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const match = (filter === 'all' || card.dataset.status === filter);
        if (match) {
          card.classList.remove('hidden');
          card.style.opacity   = '0';
          card.style.transform = 'translateY(12px)';
          requestAnimationFrame(() => requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            card.style.opacity    = '1';
            card.style.transform  = 'translateY(0)';
          }));
        } else {
          card.classList.add('hidden');
          card.style.transition = '';
          card.style.opacity    = '';
          card.style.transform  = '';
        }
      });
    });
  });
})();


// ── Enquiry form and optional GA4 events ──────────────────────────
(function () {
  const form = document.getElementById('enquiryForm');
  const status = document.getElementById('enquiryStatus');
  const measurementId = ''; // Add the site's GA4 measurement ID to enable analytics.

  if (/^G-[A-Z0-9]+$/.test(measurementId)) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
    const analyticsScript = document.createElement('script');
    analyticsScript.async = true;
    analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(analyticsScript);

    document.addEventListener('click', event => {
      const link = event.target.closest('a[href^="tel:"], a[href*="wa.me/"]');
      if (link) window.gtag('event', 'contact_click', { method: link.href.startsWith('tel:') ? 'phone' : 'whatsapp' });
    });
  }

  if (!form || !status) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const values = new FormData(form);
    const message = [
      'Hello, I would like to enquire about a project.',
      `Name: ${values.get('name')}`,
      `Phone: ${values.get('phone') || 'Not provided'}`,
      `Email: ${values.get('email')}`,
      `Service: ${values.get('service')}`,
      `Project details: ${values.get('message')}`
    ].join('\n');
    const method = event.submitter?.value || 'whatsapp';
    if (method === 'email') {
      const subject = encodeURIComponent(`Project enquiry: ${values.get('service')}`);
      const mailtoUrl = `mailto:rjkconstruction19@gmail.com?subject=${subject}&body=${encodeURIComponent(message)}`;
      if (window.gtag) window.gtag('event', 'generate_lead', { method: 'email_draft' });
      window.location.href = mailtoUrl;
      status.textContent = 'Your email app should open with the enquiry ready. Press Send in your email app to submit it. ';
      const emailFallback = document.createElement('a');
      emailFallback.href = mailtoUrl;
      emailFallback.textContent = 'Open the email draft';
      status.appendChild(emailFallback);
      return;
    }

    const whatsappUrl = `https://wa.me/919629634417?text=${encodeURIComponent(message)}`;
    if (window.gtag) window.gtag('event', 'generate_lead', { method: 'whatsapp_form' });
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    status.textContent = 'WhatsApp should open with your enquiry ready. If it did not open, ';
    const fallback = document.createElement('a');
    fallback.href = whatsappUrl;
    fallback.target = '_blank';
    fallback.rel = 'noopener noreferrer';
    fallback.textContent = 'open your enquiry in WhatsApp';
    status.appendChild(fallback);
  });
})();


// ── GSAP entrance and scroll reveals ──────────────────────────────
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);
  const context = gsap.context(() => {
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    intro.from('.hero-left h1', { y: 34, autoAlpha: 0, duration: 0.8, delay: 0.2 })
      .from('.hero-left > p', { y: 20, autoAlpha: 0, duration: 0.65 }, '-=0.48')
      .from('.hero-buttons > *', { y: 16, duration: 0.55, stagger: 0.1 }, '-=0.34')
      .from('.hero-stats-row .stat-item', { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.08 }, '-=0.28')
      .from('.hero-right img', { scale: 0.96, autoAlpha: 0, duration: 0.9 }, '-=0.7');

    const reveals = document.querySelectorAll('.about-content, .services-head, .projects-header, .local-info-container, .contact-container, .case-hero, .case-facts, .case-next-step, .portfolio-hero, .portfolio-list-head');
    reveals.forEach(element => {
      gsap.from(element, {
        y: 28,
        autoAlpha: 0,
        duration: 0.75,
        ease: 'power2.out',
        scrollTrigger: { trigger: element, start: 'top 86%', once: true }
      });
    });

    if (document.querySelector('.project-card')) {
      gsap.from('.project-card', {
        y: 24, autoAlpha: 0, duration: 0.65, stagger: 0.09, ease: 'power2.out',
        scrollTrigger: { trigger: '.projects-grid', start: 'top 84%', once: true }
      });
    }
    if (document.querySelector('.case-card')) {
      gsap.from('.case-card', {
        y: 24, autoAlpha: 0, duration: 0.65, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: '.case-grid', start: 'top 84%', once: true }
      });
    }
  });

  window.addEventListener('pagehide', () => context.revert(), { once: true });
})();


// ── Scroll-to-Top FAB visibility ──────────────────────────────────
(function () {
  const scrollTopBtn = document.getElementById('fab-scroll-top');
  if (!scrollTopBtn) return;

  const SHOW_AFTER = 300; // px scrolled before button appears

  function onScroll() {
    if (window.scrollY > SHOW_AFTER) {
      scrollTopBtn.classList.add('is-visible');
    } else {
      scrollTopBtn.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load in case page is already scrolled
})();

