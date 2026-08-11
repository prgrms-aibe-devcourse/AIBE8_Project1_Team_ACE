/**
 * ======================================
 * detail-page.js
 * --------------------------------------
 * 축제 상세 페이지
 * ======================================
 */

let festivalDetail = [];

//------------------ 목록으로 버튼 ------------------//
const backBtn = $("#back-btn");
backBtn.addEventListener("click", () => {
  location.href = "index.html";
});

//------------------ 이 축제로 코스짜기 버튼 ------------------//
const ctaBtn = $("#cta-btn");

const handleCtaBtnClick = () => {
  const festivalId = festivalDetail.id;
  const festivalLongitude = festivalDetail.longitude;
  const festivalLatitude = festivalDetail.latitude;
  location.href = `nearby.html?contentId=${festivalId}&longitude=${festivalLongitude}&latitude=${festivalLatitude}`;
};

ctaBtn.addEventListener("click", handleCtaBtnClick);

//------------------ 상세페이지 ------------------//
const getFestival = async () => {
  const container = $("#festival-detail");
  showLoading(container);
  const currentFestivalId = getCurrentFestival();
  festivalDetail = await getFestivalDetail(currentFestivalId);

  renderFestivalDetails();
};

const createFestivalDetailHTML = (f) => {
  return `
    <div class="hero-image-wrap">
        <img id="hero-img" alt="" src="${escapeHtml(f.image)}" />
      </div>

      <div class="detail-info">
        <div class="detail-title-row">
          <h1 id="festival-title">${escapeHtml(f.title)}</h1>
          <span id="status-badge-container"></span>
        </div>
        <div class="detail-meta">
          <div class="detail-meta-row" id="meta-period">${formatDate(f.eventStartDate)} - ${formatDate(f.eventEndDate)}</div>
          <div class="detail-meta-row" id="meta-location">${escapeHtml(f.address)}</div>
        </div>
        <p class="detail-description" id="festival-description">${escapeHtml(f.overview)}</p>
      </div>
  `;
};

const renderFestivalDetails = () => {
  const container = $("#festival-detail");
  if (!container) return;
  else if (festivalDetail === null)
    return showEmpty(container, "페이지를 찾을 수 없습니다.");

  container.innerHTML = createFestivalDetailHTML(festivalDetail);
};

const getCurrentFestival = () => {
  const festivalId = getQueryParam("contentId");
  return festivalId;
};

document.addEventListener("DOMContentLoaded", async () => {
  await getFestival();
  //renderFestivalDetails();
});
