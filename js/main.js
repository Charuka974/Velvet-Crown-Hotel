/**
 * VELVET CROWN HOTEL — main.js
 * Three.js scene • GSAP ScrollTrigger • Lenis Smooth Scroll
 * Vanilla-Tilt • Custom Cursor • Search • Booking Drawer
 */

/* ================================================================
   1. LIBRARY IMPORTS (via CDN — loaded as module shims below)
   ================================================================ */

// All libraries are loaded via <script> tags in HTML.
// This file runs after DOMContentLoaded.

document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initCursor();
  initNavBar();
  initThreeBackground();
  initHeroAnimation();
  initScrollReveal();
  initTilt();
  initBookingDrawer();
  initSearch();
  initSoundToggle();
  initCountUp();
  initRatingBars();
  initGallery();
  initHorizontalScroll();
  initCapacityCalc();
  initFilterTabs();
});

/* ================================================================
   2. LENIS SMOOTH SCROLL
   ================================================================ */
let lenis;

function initLenis() {
  if (typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Connect with GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && gsap.ScrollTrigger) {
    lenis.on('scroll', gsap.ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
}

/* ================================================================
   3. CUSTOM CURSOR
   ================================================================ */
function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let speed  = 0.12;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Smooth ring follow
  (function animateRing() {
    ringX += (mouseX - ringX) * speed;
    ringY += (mouseY - ringY) * speed;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();

  // Hover expand
  const interactives = document.querySelectorAll('a, button, [data-cursor-hover]');
  interactives.forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });
}

/* ================================================================
   4. NAVIGATION BAR
   ================================================================ */
function initNavBar() {
  const nav = document.querySelector('.nav-bar');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  // Mobile hamburger
  const hamburger = document.querySelector('.nav-hamburger');
  const overlay   = document.querySelector('.nav-mobile-overlay');
  const closeBtn  = document.querySelector('.nav-mobile-close');

  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      overlay.classList.toggle('open');
    });
    if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
    overlay.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => overlay.classList.remove('open'));
    });
  }
}

/* ================================================================
   5. THREE.JS BACKGROUND CANVAS
   ================================================================ */
let threeScene, threeCamera, threeRenderer;
let torusKnot, particles;
let mouseVelX = 0, mouseVelY = 0, lastMX = 0, lastMY = 0;
let scrollProgress = 0;
const isMobile = () => window.innerWidth < 768;

function initThreeBackground() {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  // Scene
  threeScene = new THREE.Scene();

  // Camera
  threeCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  threeCamera.position.z = 6;

  // Renderer
  threeRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  threeRenderer.setSize(window.innerWidth, window.innerHeight);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile() ? 1 : 1.5));
  threeRenderer.setClearColor(0x000000, 0);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
  threeScene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0xB29800, 3, 18);
  pointLight1.position.set(4, 4, 4);
  threeScene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x3a1245, 2, 14);
  pointLight2.position.set(-5, -3, 2);
  threeScene.add(pointLight2);

  // Velvet Crown TorusKnot
  createTorusKnot();

  // Particle System
  createParticles();

  // Mouse tracking for particle reactivity
  document.addEventListener('mousemove', (e) => {
    mouseVelX = e.clientX - lastMX;
    mouseVelY = e.clientY - lastMY;
    lastMX = e.clientX;
    lastMY = e.clientY;
  });

  // Scroll progress
  window.addEventListener('scroll', () => {
    scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  });

  // Resize
  window.addEventListener('resize', () => {
    threeCamera.aspect = window.innerWidth / window.innerHeight;
    threeCamera.updateProjectionMatrix();
    threeRenderer.setSize(window.innerWidth, window.innerHeight);
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile() ? 1 : 1.5));
  });

  // Animate
  animateThree();
}

function createTorusKnot() {
  const geometry = new THREE.TorusKnotGeometry(1.2, 0.38, 180, 24, 3, 5);

  // Glass material
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a0d20,
    metalness: 0.05,
    roughness: 0.06,
    transmission: 0.92,
    thickness: 1.2,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
  });

  torusKnot = new THREE.Mesh(geometry, glassMat);
  threeScene.add(torusKnot);

  // Gold wireframe overlay
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xB29800,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  const wireKnot = new THREE.Mesh(geometry.clone(), wireMat);
  threeScene.add(wireKnot);
  torusKnot.userData.wire = wireKnot;

  torusKnot.position.set(3.5, 0, -2);
  wireKnot.position.copy(torusKnot.position);
}

function createParticles() {
  const count = isMobile() ? 600 : 1600;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    velocities[i * 3]     = (Math.random() - 0.5) * 0.002;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
    velocities[i * 3 + 2] = 0;
    sizes[i] = Math.random() * 2.5 + 0.8;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));
  geometry.userData.velocities = velocities;

  const material = new THREE.PointsMaterial({
    color: 0xE5C158,
    size: 0.045,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  particles = new THREE.Points(geometry, material);
  threeScene.add(particles);
}

function animateThree() {
  requestAnimationFrame(animateThree);
  const t = performance.now() * 0.001;

  if (torusKnot) {
    torusKnot.rotation.x = t * 0.18 + scrollProgress * 1.5;
    torusKnot.rotation.y = t * 0.28;
    torusKnot.position.y = Math.sin(t * 0.4) * 0.3;

    const wire = torusKnot.userData.wire;
    if (wire) {
      wire.rotation.copy(torusKnot.rotation);
      wire.position.copy(torusKnot.position);
    }
  }

  if (particles) {
    const positions = particles.geometry.attributes.position.array;
    const velocities = particles.geometry.userData.velocities;
    const count = positions.length / 3;
    const velScale = Math.min(Math.sqrt(mouseVelX ** 2 + mouseVelY ** 2) * 0.0008, 0.012);

    for (let i = 0; i < count; i++) {
      positions[i * 3]     += velocities[i * 3]     + (mouseVelX * 0.00015) + Math.sin(t * 0.3 + i * 0.1) * 0.0008;
      positions[i * 3 + 1] += velocities[i * 3 + 1] - (mouseVelY * 0.00015) + Math.cos(t * 0.2 + i * 0.15) * 0.0008;

      // Wrap around
      if (positions[i * 3]     >  10) positions[i * 3]     = -10;
      if (positions[i * 3]     < -10) positions[i * 3]     =  10;
      if (positions[i * 3 + 1] >   7) positions[i * 3 + 1] =  -7;
      if (positions[i * 3 + 1] <  -7) positions[i * 3 + 1] =   7;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.rotation.y = t * 0.02;

    // Dampen mouse velocity
    mouseVelX *= 0.92;
    mouseVelY *= 0.92;
  }

  // Camera subtle sway
  threeCamera.position.x = Math.sin(t * 0.12) * 0.3;
  threeCamera.position.y = Math.cos(t * 0.09) * 0.2;
  threeCamera.lookAt(0, 0, 0);

  threeRenderer.render(threeScene, threeCamera);
}

/* ================================================================
   6. HERO ENTRANCE ANIMATION (GSAP)
   ================================================================ */
function initHeroAnimation() {
  if (typeof gsap === 'undefined') return;

  const tl = gsap.timeline({ delay: 0.3 });

  tl.to('.hero-eyebrow',  { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
    .to('.hero-title',    { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, '-=0.5')
    .to('.hero-subtitle', { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.4')
    .to('.hero-desc',     { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.3')
    .to('.hero-actions',  { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.3');

  // ScrollTrigger pin hero text
  if (gsap.ScrollTrigger && document.querySelector('.hero')) {
    gsap.to('.hero-content', {
      scale: 0.88,
      opacity: 0,
      z: -120,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }
}

/* ================================================================
   7. SCROLL REVEAL (IntersectionObserver + GSAP stagger)
   ================================================================ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => observer.observe(el));

  // GSAP stagger for groups
  if (typeof gsap !== 'undefined' && gsap.ScrollTrigger) {
    document.querySelectorAll('.stagger-group').forEach((group) => {
      const children = group.querySelectorAll('.stagger-item');
      gsap.fromTo(
        children,
        { opacity: 0, y: 50, rotateX: -15 },
        {
          opacity: 1, y: 0, rotateX: 0, stagger: 0.14, duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: { trigger: group, start: 'top 80%', toggleActions: 'play none none none' },
        }
      );
    });

    // Parallax backgrounds
    document.querySelectorAll('.parallax-img').forEach((img) => {
      gsap.to(img, {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }
}

/* ================================================================
   8. VANILLA-TILT 3D CARD EFFECTS
   ================================================================ */
function initTilt() {
  if (typeof VanillaTilt === 'undefined') return;

  const tiltEls = document.querySelectorAll('[data-tilt]');
  VanillaTilt.init(tiltEls, {
    max:       12,
    speed:     600,
    glare:     true,
    'max-glare': 0.22,
    scale:     1.04,
    perspective: 900,
    transition: true,
    easing:    'cubic-bezier(.03,.98,.52,.99)',
  });
}

/* ================================================================
   9. BOOKING DRAWER
   ================================================================ */
const ROOM_PRICES = {
  deluxe:       240,
  ocean_view:   320,
  family:       380,
  executive:    410,
  penthouse:    560,
  presidential: 890,
};

function initBookingDrawer() {
  const drawer  = document.getElementById('booking-drawer');
  const overlay = document.getElementById('booking-drawer-overlay');
  const closeBtns = document.querySelectorAll('.drawer-close, #booking-drawer-overlay');

  if (!drawer) return;

  // Open triggers
  document.querySelectorAll('[data-open-booking]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const room = btn.dataset.openBooking;
      if (room) {
        const sel = drawer.querySelector('#booking-room');
        if (sel) sel.value = room;
      }
      openDrawer();
    });
  });

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    updatePrice();
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtns.forEach((el) => el.addEventListener('click', closeDrawer));

  // Dynamic price calculator
  const inputs = drawer.querySelectorAll('#booking-room, #booking-checkin, #booking-checkout, #booking-guests');
  inputs.forEach((inp) => inp.addEventListener('change', updatePrice));

  function updatePrice() {
    const roomSel = drawer.querySelector('#booking-room');
    const checkin = drawer.querySelector('#booking-checkin');
    const checkout = drawer.querySelector('#booking-checkout');
    const totalEl = drawer.querySelector('#price-total');
    const nightsEl = drawer.querySelector('#price-nights');

    if (!roomSel || !checkin || !checkout || !totalEl) return;

    const pricePerNight = ROOM_PRICES[roomSel.value] || 0;
    let nights = 1;

    if (checkin.value && checkout.value) {
      const msPerDay = 86400000;
      nights = Math.max(1, Math.round((new Date(checkout.value) - new Date(checkin.value)) / msPerDay));
    }

    const total = pricePerNight * nights;
    if (nightsEl) nightsEl.textContent = `${nights} night${nights !== 1 ? 's' : ''}`;
    totalEl.textContent = `$${total.toLocaleString()}`;
  }

  // Set default dates
  const checkinEl = drawer.querySelector('#booking-checkin');
  const checkoutEl = drawer.querySelector('#booking-checkout');
  if (checkinEl && checkoutEl) {
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    checkinEl.value = today.toISOString().split('T')[0];
    checkoutEl.value = tomorrow.toISOString().split('T')[0];
    updatePrice();
  }
}

/* ================================================================
   10. SITE-WIDE SEARCH
   ================================================================ */
const SEARCH_INDEX = [
  { title: 'Deluxe Room', category: 'Rooms & Suites', url: '/pages/rooms-page.html#deluxeRoomCard' },
  { title: 'Ocean View Room', category: 'Rooms & Suites', url: '/pages/rooms-page.html#oceanViewRoomCard' },
  { title: 'Family Room', category: 'Rooms & Suites', url: '/pages/rooms-page.html#familyRoomCard' },
  { title: 'Executive Suite', category: 'Rooms & Suites', url: '/pages/rooms-page.html#executiveSuiteCard' },
  { title: 'Penthouse Suite', category: 'Rooms & Suites', url: '/pages/rooms-page.html#pentRoomCard' },
  { title: 'Presidential Suite', category: 'Rooms & Suites', url: '/pages/rooms-page.html#presidentialSuiteCard' },
  { title: 'Velvet Spa & Wellness', category: 'Experiences', url: '/pages/experiences-page.html#spaCard' },
  { title: 'Underground Bar & Lounge', category: 'Experiences', url: '/pages/experiences-page.html#barCard' },
  { title: 'Infinity Pool & Poolside', category: 'Experiences', url: '/pages/experiences-page.html#poolCard' },
  { title: 'Woodland Adventure Zone', category: 'Experiences', url: '/pages/experiences-page.html#adventureCard' },
  { title: 'Weddings & Celebrations', category: 'Events', url: '/pages/events-page.html#weddingCard' },
  { title: 'Corporate Meetings', category: 'Events', url: '/pages/events-page.html#corporateCard' },
  { title: 'Social Gatherings', category: 'Events', url: '/pages/events-page.html#socialCard' },
  { title: 'Romantic Escape Package', category: 'Offers', url: '/pages/offers-page.html#diningOffer' },
  { title: 'Luxury Spa Retreat', category: 'Offers', url: '/pages/offers-page.html#wellnessOffer' },
  { title: 'Direct Booking Savings', category: 'Offers', url: '/pages/offers-page.html#stayOffer' },
  { title: 'Gallery', category: 'Gallery', url: '/pages/gallery-page.html' },
  { title: 'About Velvet Crown', category: 'About', url: '/#about-section' },
  { title: 'Map & Directions', category: 'About', url: '/#map-section' },
];

function initSearch() {
  const overlay  = document.getElementById('search-overlay');
  const input    = document.getElementById('search-input');
  const results  = document.getElementById('search-results');
  const closeBtns = document.querySelectorAll('#search-overlay .search-close, .search-close');

  if (!overlay) return;

  // Open
  document.querySelectorAll('[data-open-search], .btn-search-nav').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      overlay.classList.add('open');
      setTimeout(() => input && input.focus(), 100);
    });
  });

  // Close
  closeBtns.forEach((btn) => btn.addEventListener('click', () => overlay.classList.remove('open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay.classList.remove('open');
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      overlay.classList.toggle('open');
      if (overlay.classList.contains('open')) setTimeout(() => input && input.focus(), 100);
    }
  });

  // Search
  if (input && results) {
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      results.innerHTML = '';

      if (!q) return;

      const matched = SEARCH_INDEX.filter(
        (item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
      ).slice(0, 8);

      matched.forEach((item) => {
        const a = document.createElement('a');
        a.className = 'search-result-item';
        a.href = item.url;
        a.innerHTML = `<div class="search-result-category">${item.category}</div><div class="search-result-title">${item.title}</div>`;
        a.addEventListener('click', () => overlay.classList.remove('open'));
        results.appendChild(a);
      });

      if (!matched.length) {
        results.innerHTML = '<div class="search-result-item"><div class="search-result-title muted-txt">No results found</div></div>';
      }
    });
  }
}

/* ================================================================
   11. AMBIENT SOUND TOGGLE
   ================================================================ */
function initSoundToggle() {
  const btn = document.getElementById('sound-toggle');
  if (!btn) return;

  let audio = null;
  let playing = false;

  btn.addEventListener('click', () => {
    if (!audio) {
      // Tone.js or Web Audio API ambient tone
      audio = new Audio();
      audio.loop = true;
      audio.volume = 0.18;
      // Using a data-URI sine wave if no file exists (graceful fallback)
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(55, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        audio = { pause: () => gainNode.gain.setValueAtTime(0, ctx.currentTime), play: () => gainNode.gain.setValueAtTime(0.04, ctx.currentTime) };
      } catch (e) { /* Silently fail if audio context unavailable */ }
    }

    if (playing) {
      if (audio && audio.pause) audio.pause();
      btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      playing = false;
    } else {
      if (audio && audio.play) audio.play();
      btn.innerHTML = '<i class="fa-solid fa-volume-low"></i>';
      playing = true;
    }
  });
}

/* ================================================================
   12. COUNT-UP ANIMATION
   ================================================================ */
function initCountUp() {
  const counters = document.querySelectorAll('[data-count-up]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseFloat(el.dataset.countUp);
        const suffix = el.dataset.countSuffix || '';
        const duration = 1800;
        const start  = performance.now();
        const isFloat = target % 1 !== 0;

        const step = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = target * eased;
          el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => observer.observe(el));
}

/* ================================================================
   13. RATING BARS ANIMATION
   ================================================================ */
function initRatingBars() {
  const bars = document.querySelectorAll('.rating-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const pct  = fill.dataset.width || '0';
        fill.style.width = pct + '%';
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach((bar) => observer.observe(bar));
}

/* ================================================================
   14. GALLERY LIGHTBOX
   ================================================================ */
function initGallery() {
  const lightbox  = document.getElementById('lightbox');
  const lightImg  = document.getElementById('lightbox-img');
  const closeBtn  = document.getElementById('lightbox-close');

  if (!lightbox) return;

  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', () => {
      const src = item.querySelector('img')?.src;
      if (src && lightImg) lightImg.src = src;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}

/* ================================================================
   15. HORIZONTAL SCROLL SECTION
   ================================================================ */
function initHorizontalScroll() {
  const track = document.querySelector('.h-scroll-track');
  if (!track) return;

  // Arrow buttons
  const prevBtn = document.querySelector('[data-h-prev]');
  const nextBtn = document.querySelector('[data-h-next]');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -380, behavior: 'smooth' });
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: 380, behavior: 'smooth' });
    });
  }

  // GSAP horizontal scroll (desktop)
  if (typeof gsap !== 'undefined' && gsap.ScrollTrigger && window.innerWidth > 768) {
    const section = document.querySelector('#rooms-section');
    if (!section) return;

    const totalScroll = track.scrollWidth - track.clientWidth;

    gsap.to(track, {
      x: () => -totalScroll,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + totalScroll,
        scrub: 1.2,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  }
}

/* ================================================================
   16. CAPACITY CALCULATOR (Events page)
   ================================================================ */
function initCapacityCalc() {
  const slider = document.getElementById('capacity-slider');
  const output = document.getElementById('capacity-output');
  const recommendation = document.getElementById('capacity-recommendation');

  if (!slider) return;

  const VENUE_CONFIGS = [
    { name: 'The Amber Ballroom', min: 1,   max: 150,  style: 'Banquet / Theatre / Reception' },
    { name: 'The Crown Boardroom', min: 1,  max: 30,   style: 'Boardroom / U-Shape' },
    { name: 'The Velvet Garden', min: 1,    max: 400,  style: 'Open Reception / Cocktail' },
    { name: 'The Ivory Gallery', min: 1,    max: 80,   style: 'Exhibition / Cocktail / Theatre' },
    { name: 'The Grand Terrace', min: 1,    max: 250,  style: 'Outdoor Reception / Dinner' },
  ];

  slider.addEventListener('input', () => {
    const guests = parseInt(slider.value);
    if (output) output.textContent = guests;
    if (recommendation) {
      const suitable = VENUE_CONFIGS.filter((v) => guests <= v.max);
      recommendation.innerHTML = suitable.map((v) =>
        `<div class="capacity-venue-item reveal">
          <span class="gold-txt" style="font-family:var(--font-serif)">${v.name}</span>
          <span style="color:var(--muted);font-size:0.8rem">— ${v.style}</span>
         </div>`
      ).join('') || '<div class="muted-txt">No single venue accommodates this capacity. Please contact us for custom arrangements.</div>';
    }
  });

  slider.dispatchEvent(new Event('input'));
}

/* ================================================================
   17. FILTER TABS
   ================================================================ */
function initFilterTabs() {
  document.querySelectorAll('.filter-tabs').forEach((tabGroup) => {
    const tabs = tabGroup.querySelectorAll('.filter-tab');
    const targetContainer = document.querySelector(tabGroup.dataset.target);

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;
        if (!targetContainer) return;

        targetContainer.querySelectorAll('[data-category]').forEach((item) => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  });
}

/* ================================================================
   18. GSAP HORIZONTAL PARALLAX SECTIONS
   ================================================================ */
if (typeof gsap !== 'undefined' && gsap.ScrollTrigger) {
  gsap.registerPlugin(gsap.ScrollTrigger);

  // Reveal stagger for cards
  gsap.utils.toArray('.gsap-stagger').forEach((container) => {
    const items = container.querySelectorAll('.gsap-item');
    gsap.fromTo(
      items,
      { opacity: 0, y: 60, rotateX: -18 },
      {
        opacity: 1, y: 0, rotateX: 0, stagger: 0.15, duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: container, start: 'top 78%' },
      }
    );
  });
}
