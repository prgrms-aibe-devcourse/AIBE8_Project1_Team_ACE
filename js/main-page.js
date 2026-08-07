/**
 * ======================================
 * main-page.js
 * --------------------------------------
 * 축제 목록 렌더링
 * ======================================
 */

let allFestivals = [];
let currentPage = 1;
const PAGE_SIZE = 4;

const getFestivalList = async () => {
  const container = $("#festival-grid");
  showLoading(container);

  allFestivals = await getFestivals();

  renderFestivalList();
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

const getCurrentPageFestivals = () => {
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  return allFestivals.slice(startIndex, endIndex);
};

const handleNextPageClick = () => {
  currentPage += 1;
  renderFestivalList();
};

const handlePrevPageClick = () => {
  currentPage -= 1;
  renderFestivalList();
};

const renderPagination = () => {
  const totalPages = Math.ceil(allFestivals.length / PAGE_SIZE);
  let pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  const container = $("#pagination");

  container.innerHTML = pageNumbers.map(createPageButtonHTML).join("");
};

const createPageButtonHTML = (pageNumber) => {
  return `<button class="${pageNumber === currentPage ? "page-num-btn active" : "page-num-btn"}" data-page="${pageNumber}">${pageNumber}</button>`;
};

const renderFestivalList = () => {
  const container = $("#festival-grid");
  if (!container) return;

  const festivals = getCurrentPageFestivals();

  if (festivals.length === 0) {
    showEmpty(container, "축제가 없습니다.");
    return;
  }
  container.innerHTML = festivals.map(createFestivalCardHTML).join("");
  registerCardClickHandlers();
};

const registerCardClickHandlers = () => {
  const cards = $$(".festival-card");

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
  renderPagination();
});
