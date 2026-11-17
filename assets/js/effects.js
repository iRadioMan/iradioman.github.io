(() => {
  const shots = Array.from(document.querySelectorAll('.shot'));
  if (!shots.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let lightbox = null;
  let lightboxImage = null;
  let lightboxCaption = null;

  const getCaption = (figure) => {
    const caption = figure.querySelector('figcaption');
    return caption ? caption.textContent.trim() : '';
  };

  const ensureLightbox = () => {
    if (lightbox) return lightbox;

    lightbox = document.createElement('dialog');
    lightbox.className = 'shot-lightbox';
    lightbox.setAttribute('aria-label', 'Увеличенное изображение');
    lightbox.innerHTML = `
      <button type="button" class="shot-lightbox__close" aria-label="Закрыть">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
      <figure class="shot-lightbox__figure">
        <img alt="" decoding="async">
        <figcaption></figcaption>
      </figure>`;

    lightboxImage = lightbox.querySelector('img');
    lightboxCaption = lightbox.querySelector('figcaption');

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox || event.target.closest('.shot-lightbox__close')) {
        lightbox.close();
      }
    });

    lightbox.addEventListener('close', () => {
      document.documentElement.classList.remove('shot-lightbox-open');
      lightboxImage.removeAttribute('src');
      lightboxImage.alt = '';
      lightboxCaption.textContent = '';
    });

    document.body.append(lightbox);
    return lightbox;
  };

  const openLightbox = (figure) => {
    const image = figure.querySelector('img');
    if (!image) return;

    const dialog = ensureLightbox();
    if (dialog.open) return;

    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || '';
    lightboxCaption.textContent = getCaption(figure);
    lightboxCaption.hidden = !lightboxCaption.textContent;

    dialog.showModal();
    document.documentElement.classList.add('shot-lightbox-open');
  };

  for (const figure of shots) {
    const caption = getCaption(figure);

    figure.classList.add('shot--interactive');
    figure.tabIndex = 0;
    figure.setAttribute('role', 'button');
    figure.setAttribute('aria-haspopup', 'dialog');
    figure.setAttribute('aria-label', caption ? `Увеличить изображение: ${caption}` : 'Увеличить изображение');

    figure.addEventListener('click', () => openLightbox(figure));
    figure.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(figure);
      }
    });

    if (reduceMotion.matches) continue;

    figure.addEventListener('pointerenter', () => {
      figure.classList.remove('is-returning');
    });

    figure.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      figure.classList.remove('is-returning');

      const rect = figure.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;

      figure.style.setProperty('--shot-rx', `${(-y * 7).toFixed(2)}deg`);
      figure.style.setProperty('--shot-ry', `${(x * 9).toFixed(2)}deg`);
    });

    figure.addEventListener('pointerleave', () => {
      figure.classList.add('is-returning');
      figure.style.setProperty('--shot-rx', '0deg');
      figure.style.setProperty('--shot-ry', '0deg');
    });

    figure.addEventListener('transitionend', (event) => {
      if (event.propertyName === 'transform') figure.classList.remove('is-returning');
    });
  }
})();
