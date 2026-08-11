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
    image: resolveFestivalImage(item),
    overview: item.overview ?? "",
    lclsSystm3: item.lclsSystm3 ?? "",
    
  };
};

// ========== TourAPI 응답 Supabase 캐싱 ==========
// TourAPI는 호출 횟수 제한이 있어서, 같은 데이터를 계속 새로 받아오지 않고
// Supabase festivals/cache_meta 테이블에 잠깐(TTL) 저장해두고 재사용한다.
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6시간

// 마지막 동기화 시각이 TTL 이내인지 확인
const isCacheFresh = (syncedAt) => {
  if (!syncedAt) return false;
  const syncedTime = new Date(syncedAt).getTime();
  if (Number.isNaN(syncedTime)) return false;
  return Date.now() - syncedTime < CACHE_TTL_MS;
};

// festivals 테이블 행 -> 우리 축제 객체 모양으로 변환
const mapCacheRowToFestival = (row) => {
  return {
    id: row.content_id,
    title: row.title ?? "",
    eventStartDate: row.event_start_date ?? "",
    eventEndDate: row.event_end_date ?? "",
    address: row.address ?? "",
    longitude: row.longitude,
    latitude: row.latitude,
    image: row.image ?? "",
    overview: row.overview ?? "",
    lclsSystm3: row.lcls_systm3 ?? "",
  };
};

// 축제 목록/상세 결과를 festivals 테이블에 upsert (캐시 갱신)
const upsertFestivalsCache = async (festivals) => {
  if (!window.supabaseClient || festivals.length === 0) return;

  const rows = festivals.map((festival) => {
    const row = {
      content_id: festival.id,
      title: festival.title,
      event_start_date: festival.eventStartDate,
      event_end_date: festival.eventEndDate,
      address: festival.address,
      longitude: festival.longitude,
      latitude: festival.latitude,
      image: festival.image,
      lcls_systm3: festival.lclsSystm3,
      synced_at: new Date().toISOString(),
    };

    if (festival.overview) row.overview = festival.overview;
    return row;
  });

  const { error } = await window.supabaseClient.from("festivals").upsert(rows);
  if (error) console.log("festivals 캐시 저장 실패", error);
};

// cache_meta에 "festival_list" 동기화 시각 기록 (목록 전체를 언제 새로 받았는지)
const markFestivalListSynced = async () => {
  if (!window.supabaseClient) return;

  const { error } = await window.supabaseClient
    .from("cache_meta")
    .upsert({ cache_key: "festival_list", synced_at: new Date().toISOString() });

  if (error) console.log("cache_meta 갱신 실패", error);
};

// 캐시된 축제 목록 조회 - "festival_list" 동기화가 TTL 이내일 때만 사용
const getCachedFestivalList = async () => {
  if (!window.supabaseClient) return null;

  const { data: metaRow, error: metaError } = await window.supabaseClient
    .from("cache_meta")
    .select("synced_at")
    .eq("cache_key", "festival_list")
    .maybeSingle();

  if (metaError || !metaRow || !isCacheFresh(metaRow.synced_at)) return null;

  const { data: rows, error } = await window.supabaseClient
    .from("festivals")
    .select()
    .order("event_start_date", { ascending: true });

  if (error || !rows || rows.length === 0) return null;

  return rows.map(mapCacheRowToFestival);
};

// 캐시된 축제 상세 조회 - 해당 축제 행의 synced_at이 TTL 이내일 때만 사용
const getCachedFestivalDetail = async (festivalId) => {
  if (!window.supabaseClient) return null;

  const { data: row, error } = await window.supabaseClient
    .from("festivals")
    .select()
    .eq("content_id", festivalId)
    .maybeSingle();

  // overview가 없으면(목록 캐시로만 채워진 행이면) 신선해도 상세 캐시로 인정하지 않는다.
  if (error || !row || !row.overview || !isCacheFresh(row.synced_at)) return null;

  return mapCacheRowToFestival(row);
};

// 축제 목록 요청
const getFestivals = async (filters) => {
  const cached = await getCachedFestivalList();
  if (cached) return cached;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const eventStartDate = `${year}${month}${day}`;

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
    const items = parseTourApiResponse(data);
    const festivals = items.map(mapToFestival);

    await upsertFestivalsCache(festivals);
    await markFestivalListSynced();

    return festivals;
  } catch (err) {
    console.log("에러발생", err);
    return [];
  }
};

// 축제 상세 요청
const getFestivalDetail = async (festivalId) => {
  const cached = await getCachedFestivalDetail(festivalId);
  if (cached) return cached;

  try {
    const commonParams = {
      MobileOS: "ETC",
      MobileApp: "FestivalOtte",
      _type: "json",
      contentId: festivalId,
    };
    const commonQuery = Object.entries(commonParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    const commonUrl = `https://apis.data.go.kr/B551011/KorService2/detailCommon2?serviceKey=${API_CONFIG.TOUR_API_KEY}&${commonQuery}`;

    const introParams = {
      MobileOS: "ETC",
      MobileApp: "FestivalOtte",
      _type: "json",
      contentId: festivalId,
      contentTypeId: 15,
    };
    const introQuery = Object.entries(introParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    const introUrl = `https://apis.data.go.kr/B551011/KorService2/detailIntro2?serviceKey=${API_CONFIG.TOUR_API_KEY}&${introQuery}`;

    const [commonRes, introRes] = await Promise.all([fetch(commonUrl), fetch(introUrl)]);
    const commonData = await commonRes.json();
    const introData = await introRes.json();

    const commonItems = parseTourApiResponse(commonData);
    if (commonItems.length === 0) return null;
    const commonItem = commonItems[0];

    const introItems = parseTourApiResponse(introData);
    const introItem = introItems[0] || {};

    const merged = {
      ...commonItem,
      eventstartdate: introItem.eventstartdate,
      eventenddate: introItem.eventenddate,
    };

    const festival = mapToFestival(merged);

    await upsertFestivalsCache([festival]);

    return festival;
  } catch (err) {
    console.log("에러발생", err);
    return null;
  }
};

// 이미지/주소/좌표 없는 데이터 처리
const resolveFestivalImage = (item) => {
  return item.firstimage || item.firstimage2 || "";
};

// Kakao 카테고리 키 <-> 그룹 코드
const CATEGORY_GROUP_MAP = {
  food: "FD6",
  cafe: "CE7",
  lodging: "AD5",
};

// Kakao Local API 요청
const fetchKakaoCategory = async ({ groupCode, category, longitude, latitude, radius }) => {
  const params = {
    category_group_code: groupCode,
    x: longitude,
    y: latitude,
    radius,
    sort: "distance",
    size: 15,
  };
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  const url = `https://dapi.kakao.com/v2/local/search/category.json?${query}`;

  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${API_CONFIG.KAKAO_REST_API_KEY}` },
  });

  if (!res.ok) {
    await handleKakaoError(res);
    return [];
  }

  const json = await res.json();
  return (json.documents || []).map((doc) => mapToPlace(doc, category));
};

// 주변 음식점/카페/숙박 조회 (공개 함수)
const getNearbyPlaces = async ({ longitude, latitude, category, radius = 5000 }) => {
  const categories = category ? [category] : Object.keys(CATEGORY_GROUP_MAP);

  const results = await Promise.all(
    categories.map((key) =>
      fetchKakaoCategory({
        groupCode: CATEGORY_GROUP_MAP[key],
        category: key,
        longitude,
        latitude,
        radius,
      })
    )
  );

  return results.flat().sort((a, b) => a.distance - b.distance);
};

// Kakao 응답 변환
const mapToPlace = (doc, category) => {
  return {
    id: doc.id,
    name: doc.place_name,
    category,
    address: doc.road_address_name || doc.address_name || "",
    longitude: Number(doc.x),
    latitude: Number(doc.y),
    distance: Number(doc.distance),
  };
};

// TourAPI 오류/빈 응답 처리
const parseTourApiResponse = (json) => {
  const header = json?.response?.header;
  if (!header || header.resultCode !== "0000") {
    console.log("TourAPI 오류", header);
    return [];
  }

  const body = json.response.body;
  if (!body || body.totalCount === 0) return [];

  const rawItem = body.items?.item;
  if (!rawItem) return [];

  return Array.isArray(rawItem) ? rawItem : [rawItem];
};

// Kakao 오류 처리
const handleKakaoError = async (response) => {
  const text = await response.text();
  if (response.status === 401 || response.status === 403) {
    console.log("Kakao 키 오류 또는 플랫폼 도메인 미등록", response.status, text);
  } else if (response.status === 429) {
    console.log("Kakao 호출 한도 초과", response.status, text);
  } else {
    console.log("Kakao 알 수 없는 오류", response.status, text);
  }
};