/**
 * ======================================
 * main-page.js
 * --------------------------------------
 * 축제 목록 렌더링
 * ======================================
 */

const getFestivalList = async () => {
  const container = document.querySelector("#festival-grid");
  showLoading(container);

  const festivals = await getFestivals();

  renderFestivalList(festivals);
};

const createFestivalCardHTML = (festival) => {
  return `
    <div class="festival-card" data-festival-id="${escapeHtml(festival.id)}">
      <div class="festival-card-image-wrap">
        <img src="${escapeHtml(festival.image)}" />
      </div>
      <div class="festival-card-body">
        <p class="festival-card-title">${escapeHtml(festival.title)}</p>
        <p class="festival-card-period">${formatDate(festival.eventStartDate)} - ${formatDate(festival.eventEndDate)}</p>
        <p class="festival-card-location">${escapeHtml(festival.address)}</p>
      </div>
    </div>
  `;
};

const renderFestivalList = (festivals) => {
  const container = document.querySelector("#festival-grid");
  if (!container) return;

  if (festivals.length === 0) {
    showEmpty(container, "축제가 없습니다.");
    return;
  }
  container.innerHTML = festivals.map(createFestivalCardHTML).join("");
  registerCardClickHandlers();
};

const registerCardClickHandlers = () => {
  const cards = document.querySelectorAll(".festival-card");

  cards.forEach((card) => {
    card.addEventListener("click", handleCardClick);
  });
};

const handleCardClick = (event) => {
  const festivalId = event.currentTarget.dataset.festivalId;
  location.href = `detail.html?contentId=${festivalId}`;
};

document.addEventListener("DOMContentLoaded", () => {
  getFestivalList();
});
