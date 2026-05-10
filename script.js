// ── Hamburger / Mobile Nav ────────────────────────────────────────
(function () {
  const btn     = document.getElementById('hamburgerBtn');
  const nav     = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');

  if (!btn || !nav || !overlay) return;

  function openMobileNav() {
    btn.classList.add('is-open');
    nav.classList.add('is-open');
    overlay.classList.add('is-visible');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  window.closeMobileNav = function () {
    btn.classList.remove('is-open');
    nav.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

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
    }
  });
})();

// ── Loader (only runs if loader HTML is active) ────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const textWrapper = document.querySelector(".ml16");
  const counterEl   = document.querySelector(".count p");

  if (textWrapper && counterEl) {
    // Split text
    textWrapper.innerHTML = textWrapper.textContent.replace(
      /\S/g, "<span class='letter'>$&</span>"
    );

    // Counter
    let v = 0;
    (function tick() {
      if (v < 100) {
        v = Math.min(v + Math.floor(Math.random() * 10) + 1, 100);
        counterEl.textContent = v;
        setTimeout(tick, Math.floor(Math.random() * 200) + 25);
      }
    })();

    // Anime text
    anime.timeline({ loop: false })
      .add({ targets: ".ml16 .letter", translateY: [-100, 0], easing: "easeOutExpo", duration: 1500, delay: (el, i) => 30 * i })
      .add({ targets: ".ml16 .letter", translateY: [0, 100],  easing: "easeOutExpo", duration: 2000, delay: (el, i) => 2000 + 30 * i });

    // GSAP fade-out
    gsap.to(".count",      { opacity: 0,     delay: 3.5,  duration: 0.5 });
    gsap.to(".pre-loader", { scale: 0.5,     delay: 3,    duration: 2, ease: "power4.inOut" });
    gsap.to(".loader",     { height: "0%",   delay: 3.75, duration: 1.5, ease: "power4.inOut" });
    gsap.to(".loader-bg",  { height: "0%",   delay: 4,    duration: 1.5, ease: "power4.inOut",
      onComplete: () => {
        const pl = document.querySelector(".pre-loader");
        if (pl) pl.style.display = "none";
      }
    });
    gsap.to(".loader-2", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      delay: 3.5, duration: 1.5, ease: "power4.inOut"
    });
  }
});


// ── Services: Scroll-Hijack Horizontal Scroll ─────────────────────
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
    
    // Explicitly enforce touch overlay visibility on mobile without JS setProperty
    // (We will manage card styles via pure CSS media queries, keeping the JS clean)

    const trackW  = track.scrollWidth;
    const viewW   = section.clientWidth;
    const travelX = trackW - viewW;

    if (travelX <= 0) return;

    wrapper.style.height = (window.innerHeight + travelX) + 'px';

    if (scrollHandler) window.removeEventListener('scroll', scrollHandler);

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
