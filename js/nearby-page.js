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
  // 현재 선택된 카테고리와 일치하면 'active' 클래스 추가
  const tabsHTML = CATEGORY_GROUP.map((group) => {
    const isActive = group.key === currentCategory ? "active" : "";
    return `<button class="tab-btn ${isActive}" data-category="${group.key}">${group.label}</button>`;
  }).join("");

  // 2. 컨테이너에 HTML 삽입
  $tabBar.innerHTML = tabsHTML;

  // 3. 렌더링 후 생성된 모든 버튼에 클릭 이벤트 리스너 연결
  // const $tabBtns = $$(".tab-btn");
  // $tabBtns.forEach(($btn) => {
  //   $btn.addEventListener("click", (e) => {
  //     // HTML의 data-category 속성값을 가져옴
  //     const category = e.currentTarget.dataset.category;
  //     handleTabClick(category);
  //   });
  // });
};

// ========== 4. 탭 클릭 처리 ==========
// const handleTabClick = (category) => {
//   // 클릭한 카테고리가 이미 선택된 상태라면 동작하지 않음
//   if (category === currentCategory) return;

//   // 1. 상태 업데이트
//   currentCategory = category;

//   // 2. UI 갱신 (버튼 active 클래스 재설정)
//   renderTabs();

//   // 3. 해당 카테고리의 장소 데이터 불러오기
//   loadPlaces();
// };

// ========== 5. 장소 목록 불러오기 ==========
// const loadPlaces = async () => {
//   const $placeList = $("#place-list");
//   if (!$placeList) return;

//   // 로딩 상태 표시 (사용자 경험 개선)
//   $placeList.innerHTML = "<div>장소를 불러오는 중입니다...</div>";

//   try {
//     // TODO: 실제 축제 좌표 데이터 연동 필요 (예시 좌표 지정)
//     // const festival = await getFestivalDetail(festivalId);
//     // const { mapx: longitude, mapy: latitude } = festival;

//     /*
//     const places = await getNearbyPlaces({
//       longitude,
//       latitude,
//       category: currentCategory,
//       radius: 1000,
//     });
    
//     // 장소 목록 렌더링 예시
//     $placeList.innerHTML = places.map(place => `
//       <div class="place-item">
//         <h4>${place.place_name}</h4>
//         <p>${place.address_name}</p>
//         <button class="cart-btn" data-id="${place.id}">장바구니 담기</button>
//       </div>
//     `).join("");
//     */
//   } catch (error) {
//     console.error("장소목록 조회 실패:", error);
//     $placeList.innerHTML = "<div>장소 목록을 불러오지 못했습니다.</div>";
//   }
// };

// ========== 6. 페이지 초기화 ==========
// const initNearbyPage = () => {
//   // 1. 초기 탭 렌더링
//   renderTabs();

//   // 2. 초기 데이터(기본 선택된 food) 불러오기
//   loadPlaces();
// };

document.addEventListener("DOMContentLoaded", initNearbyPage);