(function () {
  'use strict';

  document.documentElement.classList.add('js-enabled');

  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  ready(() => {
    initMobileMenu();
    initScrollSystem();
    initRevealSystem();
    initHeroField();
    initSurfaceSpotlights();
  });

  function initMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!menuButton || !mobileMenu) return;

    const icons = menuButton.querySelectorAll('svg');
    const hamburgerIcon = icons[0];
    const closeIcon = icons[1];
    const screenReaderLabel = menuButton.querySelector('.sr-only');

    const setOpen = (open) => {
      const menuLabel = open ? 'Close main menu' : 'Open main menu';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', menuLabel);
      mobileMenu.classList.toggle('hidden', !open);
      if (hamburgerIcon) hamburgerIcon.classList.toggle('hidden', open);
      if (closeIcon) closeIcon.classList.toggle('hidden', !open);
      if (screenReaderLabel) screenReaderLabel.textContent = menuLabel;
    };

    menuButton.addEventListener('click', () => {
      setOpen(menuButton.getAttribute('aria-expanded') !== 'true');
    });

    mobileMenu.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || menuButton.getAttribute('aria-expanded') !== 'true') return;
      setOpen(false);
      menuButton.focus();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 960) setOpen(false);
    }, { passive: true });
  }

  function initScrollSystem() {
    const progressBar = document.getElementById('system-progress-bar');
    const header = document.querySelector('.future-header');
    let frame = null;

    const update = () => {
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
      if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
      frame = null;
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    update();
  }

  function initRevealSystem() {
    const targets = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!targets.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -9% 0px', threshold: 0.1 });

    targets.forEach((target, index) => {
      target.style.setProperty('--reveal-delay', `${Math.min((index % 4) * 70, 210)}ms`);
      observer.observe(target);
    });
  }

  function initHeroField() {
    const hero = document.querySelector('.secondary-hero');
    if (!hero) return;

    let frame = null;
    let point = { x: 76, y: 38 };

    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      point = {
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100
      };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        hero.style.setProperty('--hero-x', `${point.x.toFixed(2)}%`);
        hero.style.setProperty('--hero-y', `${point.y.toFixed(2)}%`);
        frame = null;
      });
    }, { passive: true });
  }

  function initSurfaceSpotlights() {
    const surfaces = document.querySelectorAll(
      '.research-principle, .publication-card, .team-profile__portrait'
    );

    surfaces.forEach((surface) => {
      surface.addEventListener('pointermove', (event) => {
        const rect = surface.getBoundingClientRect();
        surface.style.setProperty('--card-x', `${event.clientX - rect.left}px`);
        surface.style.setProperty('--card-y', `${event.clientY - rect.top}px`);
      }, { passive: true });
    });
  }
})();
