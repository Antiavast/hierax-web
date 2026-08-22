const navToggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const slider = document.getElementById('videoSlider');
if (slider) {
  const track = slider.querySelector('.slider-track');
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const dotsWrap = slider.querySelector('.slider-dots');
  const prevBtn = slider.querySelector('.slider-prev');
  const nextBtn = slider.querySelector('.slider-next');
  let current = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.querySelectorAll('.dot'));

  function goTo(index) {
    slides[current].querySelectorAll('video').forEach((v) => v.pause());
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
}

/* Botón flotante de navegación que aparece en todas las secciones */
const scrollCue = document.querySelector('.scroll-cue');
if (scrollCue) {
  const sections = Array.from(document.querySelectorAll('section, footer'));

  function updateScrollCue() {
    const scrollPos = window.scrollY + window.innerHeight / 2;
    const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;

    if (isAtBottom) {
      scrollCue.classList.add('up-arrow');
      scrollCue.setAttribute('href', '#top');
      scrollCue.setAttribute('aria-label', 'Volver al inicio');
      return;
    }

    scrollCue.classList.remove('up-arrow');
    scrollCue.setAttribute('aria-label', 'Siguiente sección');

    // Busca la siguiente sección
    let nextSec = sections.find((sec) => sec.offsetTop > scrollPos + 50);
    if (nextSec && nextSec.id) {
      scrollCue.setAttribute('href', '#' + nextSec.id);
    } else {
      scrollCue.setAttribute('href', '#top');
      scrollCue.classList.add('up-arrow');
    }
  }

  window.addEventListener('scroll', updateScrollCue);
  updateScrollCue();
}

/* Galería dinámica SIN duplicación artificial */
const galleryTrack = document.getElementById('galleryTrack');
if (galleryTrack) {
  const galleryTemplate = document.getElementById('galleryTemplate');
  const galleryScroller = document.getElementById('galleryScroller');
  const filterButtons = document.querySelectorAll('#galleryFilters .filter-btn');
  const emptyMsg = document.getElementById('galleryEmpty');
  const PX_PER_SECOND = 40;

  const masterCards = Array.from(galleryTemplate.content.querySelectorAll('.gallery-card'));
  const photos = masterCards.map((card) => {
    const img = card.querySelector('img');
    const captionEl = card.querySelector('figcaption span');
    const creditLink = card.querySelector('figcaption a');
    return {
      src: img ? img.getAttribute('src') : '',
      alt: img ? img.getAttribute('alt') : '',
      caption: captionEl ? captionEl.textContent : '',
      creditText: creditLink ? creditLink.textContent : '',
      creditHref: creditLink ? creditLink.getAttribute('href') : '#',
      category: card.dataset.category,
    };
  });

  let currentIndices = [];

  function buildTrack(filter) {
    currentIndices = photos
      .map((p, i) => i)
      .filter((i) => filter === 'all' || photos[i].category === filter);

    galleryTrack.innerHTML = '';
    galleryTrack.style.animation = 'none';

    if (currentIndices.length === 0) {
      if (emptyMsg) emptyMsg.hidden = false;
      if (galleryScroller) galleryScroller.hidden = true;
      return;
    }
    if (emptyMsg) emptyMsg.hidden = true;
    if (galleryScroller) galleryScroller.hidden = false;

    // Insertamos solo las tarjetas reales sin duplicación
    currentIndices.forEach((photoIndex) => {
      const node = masterCards[photoIndex].cloneNode(true);
      const thumbBtn = node.querySelector('.gallery-thumb-btn');
      if (thumbBtn) thumbBtn.dataset.index = String(photoIndex);
      galleryTrack.appendChild(node);
    });

    if (filter === 'all' && currentIndices.length > 3) {
      galleryTrack.style.justifyContent = 'flex-start';
      requestAnimationFrame(() => {
        const fullWidth = galleryTrack.scrollWidth;
        const duration = Math.max(fullWidth / PX_PER_SECOND, 8);
        galleryTrack.style.animation = `gallery-scroll ${duration}s linear infinite`;
      });
    } else {
      galleryTrack.style.justifyContent = 'center';
    }
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      buildTrack(btn.dataset.filter);
    });
  });

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCredit = document.getElementById('lightboxCredit');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let lightboxPhotoIndex = 0;

  function showPhoto(photoIndex) {
    const photo = photos[photoIndex];
    lightboxPhotoIndex = photoIndex;
    if (lightboxImg) {
      lightboxImg.src = photo.src;
      lightboxImg.alt = photo.alt;
    }
    if (lightboxCaption) lightboxCaption.textContent = photo.caption;
    if (lightboxCredit) {
      lightboxCredit.textContent = photo.creditText;
      lightboxCredit.href = photo.creditHref;
    }
  }

  function openLightbox(photoIndex) {
    showPhoto(photoIndex);
    if (lightbox) lightbox.hidden = false;
    galleryTrack.classList.add('paused');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (lightbox) lightbox.hidden = true;
    galleryTrack.classList.remove('paused');
    document.body.style.overflow = '';
  }

  function step(direction) {
    if (currentIndices.length === 0) return;
    const pos = currentIndices.indexOf(lightboxPhotoIndex);
    const nextPos = (pos + direction + currentIndices.length) % currentIndices.length;
    showPhoto(currentIndices[nextPos]);
  }

  galleryTrack.addEventListener('click', (e) => {
    const btn = e.target.closest('.gallery-thumb-btn');
    if (!btn) return;
    openLightbox(Number(btn.dataset.index));
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => step(-1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => step(1));
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  buildTrack('all');
}

/* Formulario de contacto: envío sin recargar la página */
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  const statusEl = document.getElementById('cfStatus');
  const isEnglish = document.documentElement.lang === 'en';
  const texts = {
    sending: isEnglish ? 'Sending…' : 'Enviando…',
    ok: isEnglish ? 'Message sent. We will get back to you soon.' : 'Mensaje enviado. Te responderemos en breve.',
    error: isEnglish
      ? 'Something went wrong. Please write to us directly by email.'
      : 'Algo ha fallado. Escríbenos directamente por email.',
    notConfigured: isEnglish
      ? 'Contact form not configured yet — please write to us by email.'
      : 'El formulario aún no está configurado — escríbenos por email mientras tanto.',
  };

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const action = contactForm.getAttribute('action') || '';
    if (action.includes('TU_ID_DE_FORMSPREE')) {
      statusEl.textContent = texts.notConfigured;
      statusEl.className = 'form-status error';
      return;
    }
    statusEl.textContent = texts.sending;
    statusEl.className = 'form-status';
    try {
      const response = await fetch(action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        statusEl.textContent = texts.ok;
        statusEl.className = 'form-status ok';
        contactForm.reset();
      } else {
        statusEl.textContent = texts.error;
        statusEl.className = 'form-status error';
      }
    } catch (err) {
      statusEl.textContent = texts.error;
      statusEl.className = 'form-status error';
    }
  });
}