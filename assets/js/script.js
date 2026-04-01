const slides = Array.from(document.querySelectorAll('.slide'));
const dotsContainer = document.querySelector('.dots');
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

let currentSlide = 0;
let autoPlay;

/* =========================
   SLIDER
========================= */
function renderDots() {
  if (!dotsContainer || slides.length === 0) return;

  dotsContainer.innerHTML = '';

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ir para slide ${index + 1}`);

    dot.addEventListener('click', () => {
      goToSlide(index);
      restartAutoPlay();
    });

    dotsContainer.appendChild(dot);
  });
}

function updateSlider() {
  if (slides.length === 0) return;

  const dots = dotsContainer ? Array.from(dotsContainer.children) : [];

  slides.forEach((slide, index) => {
    const isActive = index === currentSlide;

    slide.classList.toggle('active', isActive);
    slide.setAttribute('aria-hidden', String(!isActive));
  });

  dots.forEach((dot, index) => {
    const isActive = index === currentSlide;

    dot.classList.toggle('active', isActive);
    dot.setAttribute('aria-current', isActive ? 'true' : 'false');
  });
}

function goToSlide(index) {
  if (slides.length === 0) return;

  currentSlide = (index + slides.length) % slides.length;
  updateSlider();
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  goToSlide(currentSlide - 1);
}

function startAutoPlay() {
  if (slides.length <= 1) return;
  autoPlay = setInterval(nextSlide, 4000);
}

function restartAutoPlay() {
  clearInterval(autoPlay);
  startAutoPlay();
}

/* INIT SLIDER */
if (slides.length > 0) {
  renderDots();
  updateSlider();
  startAutoPlay();

  nextButton?.addEventListener('click', () => {
    nextSlide();
    restartAutoPlay();
  });

  prevButton?.addEventListener('click', () => {
    prevSlide();
    restartAutoPlay();
  });
}

/* =========================
   MENU MOBILE
========================= */
if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

/* =========================
   CONTADORES
========================= */
const counters = document.querySelectorAll('.counter');

const formatNumber = (value) => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

if (counters.length > 0) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const element = entry.target;
      const target = Number(element.dataset.target || '0');
      const duration = 1400;
      const start = performance.now();

      function animate(now) {
        const progress = Math.min((now - start) / duration, 1);
        const value = Math.floor(progress * target);
        element.textContent = formatNumber(value);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.textContent = formatNumber(target);
        }
      }

      requestAnimationFrame(animate);
      counterObserver.unobserve(element);
    });
  }, { threshold: 0.4 });

  counters.forEach((counter) => counterObserver.observe(counter));
}
