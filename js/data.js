// TourAPI 원본 데이터 -> 우리 축제 객체 모양으로 변환
const mapToFestival = (item) => {
  return {
    id: String(item.contentid),
    title: item.title ?? "",
    eventStartDate: item.eventstartdate ?? "",
    eventEndDate: item.eventenddate ?? "",
    address: [item.addr1, item.addr2].filter(Boolean).join(" "),
    longitude: item.mapx ? Number(item.mapx) : null,
    latitude: item.mapy ? Number(item.mapy) : null,
    image: item.firstimage || item.firstimage2 || "",
    overview: item.overview ?? "",
  };
};

// 축제 목록 요청
const getFestivals = async (filters) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const eventStartDate = `${year}${month}${day}`;

  // serviceKey는 이미 인코딩된 값이라 별도로 앞에 붙이고,
  // 나머지 파라미터만 객체로 만들어서 이어붙인다.
  const params = {
    MobileOS: "ETC",
    MobileApp: "FestivalOtte",
    _type: "json",
    numOfRows: 20,
    pageNo: 1,
    eventStartDate,
    arrange: "A",
  };

  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const url = `https://apis.data.go.kr/B551011/KorService2/searchFestival2?serviceKey=${API_CONFIG.TOUR_API_KEY}&${query}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const header = data?.response?.header;
    if (!header || header.resultCode !== "0000") {
      console.log("TourAPI 오류", header);
      return [];
    }

    const body = data.response.body;
    if (!body || body.totalCount === 0) return [];

    const rawItem = body.items?.item;
    if (!rawItem) return [];

    const items = Array.isArray(rawItem) ? rawItem : [rawItem];

    return items.map(mapToFestival);
  } catch (err) {
    console.log("에러발생", err);
    return [];
  }
}
// 축제 상세 요청
const getFestivalDetail = (festivalId) => {
  
}

// 이미지/주소/좌표 없는 데이터 처리
const resolveFestivalImage= (item) => {

}

// Kakao Local API 요쳥
const fetchKakaoCategory = ( {groupCode, longitude, latitude, radius} ) => {

}

// 주변 음식점/카페/숙박 조회 (공개 함수)
const getNearbyPlaces = ({ longitude, latitude, category, radius }) => {

}

// Kakao 응답 변환
const mapToPlace = (doc, category) => {
  return {
    id: String(doc.contentid),
    title: doc.title ?? "",
    eventStartDate: doc.eventstartdate ?? "",
    eventEndDate: doc.eventenddate ?? "",
    address: [doc.addr1, item.addr2].filter(Boolean).join(" "),
    longitude: doc.mapx ? Number(doc.mapx) : null,
    latitude: doc.mapy ? Number(doc.mapy) : null,
    image: doc.firstimage || doc.firstimage2 || "",
    overview: doc.overview ?? "",
  };
}

// TourAPI 오류/빈 응답 처리
const parseTourApiResponse = (json) => {

}
// Kakao 오류 처리
const handleKakaoError = (response) => {
  
}