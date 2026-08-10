/**
 * ======================================
 * nearby-page.js
 * --------------------------------------
 * 근처 편의시설(맛집/카페/숙소) 페이지
 * ======================================
 */

// ========== 1. 데이터 분류 ==========
const CATEGORY_GROUPS = [
  { key: "food", label: "맛집" },
  { key: "cafe", label: "카페" },
  { key: "lodging", label: "숙소" },
];

// ========== 2. 현재 페이지 상태 ==========
const festivalId = getQueryParam("contentId"); // URL의 ?contentId= 값
let currentFestival = null; // 축제 상세 정보 (이름/주소/좌표)
let currentCategory = "food"; // 현재 선택된 탭
let currentPlaces = []; // 현재 탭에서 불러온 장소 목록
const selectedPlaces = new Map(); // 체크된 장소들 (id -> place)

// ========== 3. 뒤로가기 ==========
const initBackButton = () => {
  const $backBtn = $("#back-btn");
  if (!$backBtn) return;

  $backBtn.addEventListener("click", () => {
    if (festivalId) {
      location.href = `detail.html?contentId=${festivalId}`;
    } else {
      history.back();
    }
  });
};

// ========== 4. 상단 축제 정보(이름/위치) 렌더링 ==========
const renderFestivalSummary = () => {
  if (!currentFestival) return;

  const $name = $("#festival-name");
  const $location = $("#festival-location");

  if ($name) $name.textContent = currentFestival.title;
  if ($location) $location.textContent = currentFestival.address;
};

// ========== 5. 탭 바 렌더링 ==========
const renderTabs = () => {
  const $tabBar = $("#tab-bar");
  if (!$tabBar) return;

  // 1. 탭 버튼 HTML 문자열 생성
  const tabsHTML = CATEGORY_GROUPS.map((group) => {
    const isActive = group.key === currentCategory ? "active" : "";
    return `<button class="tab-btn ${isActive}" data-category="${group.key}">${group.label}</button>`;
  }).join("");

  // 2. 컨테이너에 HTML 삽입
  $tabBar.innerHTML = tabsHTML;

  // 3. 렌더링 후 생성된 모든 버튼에 클릭 이벤트 리스너 연결
  const $tabBtns = $$(".tab-btn");
  $tabBtns.forEach(($btn) => {
    $btn.addEventListener("click", (e) => {
      const category = e.currentTarget.dataset.category;
      handleTabClick(category);
    });
  });
};

// ========== 6. 탭 클릭 처리 ==========
const handleTabClick = (category) => {
  // 이미 클릭된 탭이라면 동작하지 않음
  if (category === currentCategory) return;

  currentCategory = category;
  renderTabs();
  loadPlaces();
};

// ========== 7. 거리 표시 포맷 (도보/차량) ==========
const WALK_DISTANCE_LIMIT = 1500; // 1.5km 이하는 도보로 표시

const formatDistance = (meters) => {
  if (meters === null || meters === undefined || Number.isNaN(meters)) return "";

  const label = meters <= WALK_DISTANCE_LIMIT ? "도보" : "차량";
  const value =
    meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;

  return `${label} ${value}`;
};

// ========== 8. 장소 목록 불러오기 ==========
const loadPlaces = async () => {
  const $placeList = $("#place-list");
  if (!$placeList || !currentFestival) return;

  showLoading($placeList);

  try {
    const { longitude, latitude } = currentFestival;

    const places = await getNearbyPlaces({
      longitude,
      latitude,
      category: currentCategory,
      radius: 5000,
    });

    currentPlaces = places;

    if (places.length === 0) {
      showEmpty($placeList, "근처에 장소가 없습니다.");
      return;
    }

    // 장소 목록 렌더링
    $placeList.innerHTML = places.map(createPlaceRowHTML).join("");
    registerPlaceRowHandlers();
  } catch (err) {
    console.error("장소를 찾지 못했습니다.", err);
    showError($placeList, "장소 목록을 불러오지 못했습니다.");
  }
};

// ========== 9. 장소 행(카드) 렌더링 ==========
const createPlaceRowHTML = (place) => {
  const isChecked = selectedPlaces.has(String(place.id));

  return `
    <div class="place-row ${isChecked ? "checked" : ""}" data-id="${escapeHtml(place.id)}">
      <span class="place-checkbox"></span>
      <div class="place-info">
        <p class="place-name">${escapeHtml(place.name)}</p>
        <p class="place-category">${escapeHtml(place.categoryName)}</p>
      </div>
      <span class="place-distance">${formatDistance(place.distance)}</span>
    </div>
  `;
};

// ========== 10. 장소 선택(체크) 처리 ==========
const registerPlaceRowHandlers = () => {
  const $rows = $$(".place-row");

  $rows.forEach(($row) => {
    $row.addEventListener("click", () => {
      handlePlaceRowClick($row);
    });
  });
};

const handlePlaceRowClick = ($row) => {
  const placeId = $row.dataset.id;
  const place = currentPlaces.find((p) => String(p.id) === placeId);
  if (!place) return;

  if (selectedPlaces.has(placeId)) {
    selectedPlaces.delete(placeId);
    $row.classList.remove("checked");
  } else {
    selectedPlaces.set(placeId, place);
    $row.classList.add("checked");
  }

  renderSelectionState();
};

// ========== 11. 선택 개수 / 일정 만들기 버튼 상태 렌더링 ==========
const renderSelectionState = () => {
  const $count = $("#selection-count");
  const $scheduleBtn = $("#make-schedule-btn");
  const count = selectedPlaces.size;

  if ($count) {
    $count.innerHTML = count > 0 ? `선택 <strong>${count}</strong>곳` : "";
  }

  if ($scheduleBtn) {
    $scheduleBtn.disabled = count === 0;
    $scheduleBtn.classList.toggle("enabled", count > 0);
  }
};

// ========== 12. 날짜 포맷 변환 ==========
const toIsoDate = (dateString) => {
  if (!dateString || dateString.length !== 8) return null;
  return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
};

// ========== 13. 일정 만들기 ==========
const handleMakeScheduleClick = async () => {
  if (!currentFestival || selectedPlaces.size === 0) return;

  const eventStartDate = toIsoDate(currentFestival.eventStartDate);
  if (!eventStartDate) {
    window.alert("축제 시작일 정보가 없어 일정을 만들 수 없습니다.");
    return;
  }

  // 로그인한 사용자만 일정을 저장할 수 있음
  const currentUserResult = await window.Auth.getCurrentUser();
  const isLoggedIn = currentUserResult.ok && Boolean(currentUserResult.data?.user);

  if (!isLoggedIn) {
    window.alert("로그인이 필요해요");
    location.href = "login.html";
    return;
  }

  const $scheduleBtn = $("#make-schedule-btn");
  if ($scheduleBtn) $scheduleBtn.disabled = true;

  const places = Array.from(selectedPlaces.values());

  const result = await window.Schedule.create({
    festivalId,
    festivalTitle: currentFestival.title,
    eventStartDate,
    eventEndDate: toIsoDate(currentFestival.eventEndDate),
    places,
  });

  if (!result.ok) {
    window.alert(result.error?.message ?? "일정을 만들지 못했습니다.");
    renderSelectionState(); // 버튼 활성화 상태 복구
    return;
  }

  window.alert("일정이 만들어졌어요!");
  location.href = "schedule.html";
};

const initMakeScheduleButton = () => {
  const $scheduleBtn = $("#make-schedule-btn");
  if (!$scheduleBtn) return;

  $scheduleBtn.addEventListener("click", handleMakeScheduleClick);
};

// ========== 14. 페이지 초기화 ==========
const initNearbyPage = async () => {
  initBackButton();
  initMakeScheduleButton();

  const $placeList = $("#place-list");

  if (!festivalId) {
    showError($placeList, "축제 정보를 찾을 수 없습니다.");
    return;
  }

  showLoading($placeList);

  // 축제 상세 정보(이름/주소/좌표)를 한 번만 불러와 재사용
  currentFestival = await getFestivalDetail(festivalId);

  if (!currentFestival) {
    showError($placeList, "축제 정보를 불러오지 못했습니다.");
    return;
  }

  renderFestivalSummary();
  renderTabs();
  renderSelectionState();
  loadPlaces();
};

document.addEventListener("DOMContentLoaded", initNearbyPage);