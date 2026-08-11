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

  // 미리보기가 이미 열려있는 상태라면 선택 변경사항을 바로 반영
  const $preview = $("#schedule-preview");
  if ($preview && $preview.children.length > 0) {
    renderSchedulePreview();
  }
};

// ========== 12. 날짜 포맷 변환 ==========
const toIsoDate = (dateString) => {
  if (!dateString || dateString.length !== 8) return null;
  return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
};

// ========== 13. 일정 미리보기 ==========
const renderSchedulePreview = () => {
  const $preview = $("#schedule-preview");
  if (!$preview) return;

  if (selectedPlaces.size === 0) {
    $preview.innerHTML = "";
    return;
  }

  const places = Array.from(selectedPlaces.values());

  const stepsHTML = places
    .map(
      (place, index) => `
      <div class="schedule-step">
        <span class="step-num">${index + 1}</span>
        <div class="step-info">
          <span class="step-name">${escapeHtml(place.name)}</span>
          <span class="step-category">${escapeHtml(place.categoryName)}</span>
        </div>
        <span class="step-distance">${formatDistance(place.distance)}</span>
      </div>
    `
    )
    .join("");

  $preview.innerHTML = `
    <div class="schedule-preview-card">
      <p class="schedule-preview-title">일정 미리보기</p>
      <div class="schedule-step-list">${stepsHTML}</div>
      <div class="schedule-preview-actions">
        <button class="btn-outline-primary" id="save-schedule-btn">저장</button>
        <button class="btn-outline-gray" id="copy-schedule-btn">일정 공유하기</button>
      </div>
    </div>
  `;

  $("#save-schedule-btn")?.addEventListener("click", handleSaveScheduleClick);
  $("#copy-schedule-btn")?.addEventListener("click", handleCopyScheduleClick);
};

const handleMakeScheduleClick = () => {
  if (selectedPlaces.size === 0) return;
  renderSchedulePreview();
};

// ========== 14. 일정 저장  ==========
const handleSaveScheduleClick = async () => {
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

  const $saveBtn = $("#save-schedule-btn");
  if ($saveBtn) $saveBtn.disabled = true;

  const result = await window.Schedule.create({
    festivalId,
    festivalTitle: currentFestival.title,
    eventStartDate,
    eventEndDate: toIsoDate(currentFestival.eventEndDate),
    places: Array.from(selectedPlaces.values()),
  });

  if (!result.ok) {
    window.alert(result.error?.message ?? "일정을 만들지 못했습니다.");
    if ($saveBtn) $saveBtn.disabled = false;
    return;
  }

  if ($saveBtn) {
    $saveBtn.textContent = "저장됨";
    $saveBtn.classList.add("saved");
  }
  window.alert("내 일정표에 추가됐어요!");
  await renderHeader();
};
// ========== 15. 일정 텍스트 생성 ==========
const createScheduleText = () => {
  const places = Array.from(selectedPlaces.values());
  const routeText = places.map((place) => place.name).join(" → ");

  const addressText = places
    .map((place) => {
      const address = place.address || "주소 정보 없음";
      return `- ${place.name}: ${address}`;
    })
    .join("\n");

  return [
    `우리 이번 "${currentFestival.title}"에서 이런 일정 어때?`,
    "",
    "이동 경로",
    routeText,
    "",
    "상세 주소",
    addressText,
  ].join("\n");
};

// ========== 15.A 일정 텍스트 복사 ==========
const handleCopyScheduleClick = async () => {
  try {
    const scheduleText = createScheduleText();
    await navigator.clipboard.writeText(scheduleText);
    window.alert("일정을 복사했어요!");
  } catch (err) {
    console.error("일정 복사 실패", err);
    window.alert("일정 복사에 실패했습니다.");
  }
};

const initMakeScheduleButton = () => {
  const $scheduleBtn = $("#make-schedule-btn");
  if (!$scheduleBtn) return;

  $scheduleBtn.addEventListener("click", handleMakeScheduleClick);
};

// ========== 16. 페이지 초기화 ==========
const initNearbyPage = async () => {
  initBackButton();
  initMakeScheduleButton();

  const $placeList = $("#place-list");

  if (!festivalId) {
    showError($placeList, "축제 정보를 찾을 수 없습니다.");
    return;
  }

  showLoading($placeList);

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