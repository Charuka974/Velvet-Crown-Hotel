// rooms section - home
const scrollContainer = document.querySelector('.scroll-container');
  const cards = document.querySelectorAll('.room-card');
  const scrollLeft = document.getElementById('scroll-left');
  const scrollRight = document.getElementById('scroll-right');

  const scrollAmount = scrollContainer.offsetWidth * 0.6;

  scrollLeft.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  scrollRight.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  function updateFocusCard() {
    const center = scrollContainer.scrollLeft + scrollContainer.offsetWidth / 2;

    cards.forEach(card => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const isCenter = Math.abs(center - cardCenter) < card.offsetWidth / 2;
      card.classList.toggle('active', isCenter);
    });
  }

  scrollContainer.addEventListener('scroll', updateFocusCard);
  window.addEventListener('load', updateFocusCard);
