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
    initDisclosureReview();
    initScrollSystem();
    initRevealSystem();
    initCardSpotlights();
    initHeroField();
    initActiveNavigation();
  });

  function initDisclosureReview() {
    const modal = document.getElementById('disclosure-modal');
    const copy = document.getElementById('disclosure-copy');
    const acceptButton = document.getElementById('accept-button');
    const main = document.getElementById('main-content');

    if (!modal || !copy || !acceptButton) return;

    const updateReviewState = () => {
      const hasOverflow = copy.scrollHeight > copy.clientHeight + 6;
      const hasReachedEnd = copy.scrollTop + copy.clientHeight >= copy.scrollHeight - 8;
      const canContinue = !hasOverflow || hasReachedEnd;

      acceptButton.disabled = !canContinue;
      acceptButton.setAttribute('aria-disabled', String(!canContinue));
      acceptButton.textContent = canContinue
        ? 'Accept and enter site'
        : 'Review disclosures to continue';
    };

    copy.addEventListener('scroll', updateReviewState, { passive: true });
    window.addEventListener('resize', updateReviewState, { passive: true });

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(updateReviewState);
      observer.observe(copy);
    }

    requestAnimationFrame(() => {
      updateReviewState();
      if (acceptButton.disabled) copy.focus({ preventScroll: true });
      else acceptButton.focus({ preventScroll: true });
    });

    acceptButton.addEventListener('click', () => {
      modal.setAttribute('aria-hidden', 'true');
      if (main) {
        main.tabIndex = -1;
        requestAnimationFrame(() => main.focus({ preventScroll: true }));
      }
    });
  }

  function initScrollSystem() {
    const progressBar = document.getElementById('system-progress-bar');
    const header = document.querySelector('.future-header');
    let ticking = false;

    const update = () => {
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);

      if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
      ticking = false;
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    update();
  }

  function initRevealSystem() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = Array.from(document.querySelectorAll('[data-reveal]'));

    if (!targets.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return;
    }

    targets.forEach((target, index) => {
      const cluster = target.parentElement ? Array.from(target.parentElement.children) : [];
      const position = Math.max(cluster.indexOf(target), 0);
      target.style.setProperty('--reveal-delay', `${Math.min(position * 80, 320)}ms`);
      target.dataset.revealIndex = String(index + 1).padStart(2, '0');
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.12
    });

    targets.forEach((target) => observer.observe(target));
  }

  function initCardSpotlights() {
    const cards = document.querySelectorAll('.strategy-module, .research-card, .tenet-card');

    cards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--card-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--card-y', `${event.clientY - rect.top}px`);
      }, { passive: true });
    });
  }

  function initHeroField() {
    const hero = document.getElementById('home');
    const strategy = document.getElementById('strategy');
    if (!hero) return;

    let frame = null;
    let point = { x: 74, y: 42 };

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

    if (strategy) {
      strategy.addEventListener('pointermove', (event) => {
        const rect = strategy.getBoundingClientRect();
        strategy.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
        strategy.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
      }, { passive: true });
    }
  }

  function initActiveNavigation() {
    const links = Array.from(document.querySelectorAll('.desktop-nav a[href^="#"]'));
    const sectionMap = new Map();

    links.forEach((link) => {
      const section = document.querySelector(link.getAttribute('href'));
      if (section) sectionMap.set(section, link);
    });

    if (!sectionMap.size || !('IntersectionObserver' in window)) return;

    const setActive = (activeLink) => {
      links.forEach((link) => {
        const isActive = link === activeLink;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    };

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(sectionMap.get(visible.target));
    }, {
      rootMargin: '-28% 0px -58% 0px',
      threshold: [0, 0.1, 0.35]
    });

    sectionMap.forEach((_link, section) => observer.observe(section));
    setActive(links[0]);
  }

})();
