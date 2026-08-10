// ========== 1. 데이터 분류 ==========
const CATEGORY_GROUPS = [
  { key: "food", label: "맛집" },
  { key: "cafe", label: "카페" },
  { key: "lodging", label: "숙소" },
];

// ========== 2. 현재 페이지 상태 ==========
// 현재 선택된 탭을 기억하는 변수입니다.
let currentCategory = "food"; 

// ========== 3. 탭 바 렌더링 ==========
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
    $btn.addEventListener("click",(e) => {
      const category = e.currentTarget.dataset.categoey;
      handlerTabClick(category);
    })
  })
  
};

// ========== 4. 탭 클릭 처리 ==========
const handlerTabClick = (category) => {
  // 이미 클릭된 탭이라면 동작하지 않음
  if(!catogory === currentCategory) return;

  // 1. 다른 탭을 눌렀을 때
  currentCategory = category;
  
  // 새로운 탭 렌더링
  renderTabs();

  // 새로운 데이터를 가져옴
  loacPlaeces();
};

// ========== 5. 장소 목록 불러오기 ==========
const loadPlaces = async () => {
  const $placeList = $("#place-list");
  if(!$placeList) return;

  $placeList.innerHTML = `<div>장소를 불러오는 중...</div>`;
  
  try {
    // 실제 축제 좌표 데이터 연동
    const festival = await getFestivalDetail(festivalId);
    const { mapx: longitude, mapy: latitude} = festival;

    const places = await getNearbyPlaces({
      longitude,
      latitude,
      category: currentCategory,
      radius: 1000,
    });
    
    // 장소 목록 렌더링 표시
    $placeList.innerHTML = places.map( place => { `
      <div class="place-item">
        <h4>${place.place_name}</h4>
        <p>${place.address_name}</p>
        <button class="cart-btn" data-id="${place.id}">장바구니 담기</button>
      </div>
      `}).join("");
  } catch (err) {
    console.err("장소를 찾지 못했습니다.");
    $placeList.innerHTML = "<div>장소 목록을 불러오지 못했습니다.</div>";
  }
};

// ========== 6. 페이지 초기화 ==========
const initNearbyPage = () => {
  // 초기 탭 렌더링
  renderTabs();

  // 초기 데이터 가져오기
  loadPlaces();
};
document.addEventListener("DOMContentLoaded", initNearbyPage);