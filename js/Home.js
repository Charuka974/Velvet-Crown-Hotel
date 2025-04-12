// rooms section - home -----------------------------------------------------
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


// ------Search function home----------------------------------------------------------------

  const searchMap = [
    { keywords: ["about"], target: "#about-section" },
    { keywords: ["map", "maps"], target: "#map-section" },
    { keywords: ["offers", "offer", "deals"], target: "#offers-section" },
    { keywords: ["rooms", "room"], target: "#deluxeRoomHome" },
    { keywords: ["suites", "suite"], target: "#executiveSuiteHome" },
    { keywords: ["gallery", "photos", "images", "photo", "image"], target: "/pages/gallery-page.html" },
    { keywords: ["events", "event"], target: "/pages/events-page.html" },
    { keywords: ["wedding", "weddings"], target: "#weddingsCelebrationsHome" },
    { keywords: ["meeting", "meetings", "business"], target: "#meetingsEventsHome" },
    { keywords: ["experience", "experiences"], target: "#kidsExperienceCard" },
    { keywords: ["spa", "wellness", "massage"], target: "#spaExperienceCard" },
    { keywords: ["bar", "bars"], target: "#barExperienceCard" },
    { keywords: ["adventure", "fun", "leasure"], target: "#adventureExperienceCard" },
    { keywords: ["pool", "pools", "swim"], target: "#poolsideEleganceExperienceCard" }
  ];

  const searchForm = document.getElementById("nav-search-form");
  const searchInput = document.getElementById("siteSearchInput");

  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const query = searchInput.value.toLowerCase().trim();
    let found = false;

    for (const entry of searchMap) {
      for (const keyword of entry.keywords) {
        if (query.includes(keyword)) {
          const target = entry.target;
          if (target.startsWith("#")) {
            const el = document.querySelector(target);
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            } else {
              alert("Section found, but not on this page.");
            }
          } else {
            window.location.href = target;
          }
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      alert("No matching section found. Try terms like ‘events’, ‘spa’, ‘suites’, etc.");
    }
  });

