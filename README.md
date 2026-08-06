# 축제 어때 — 바닐라 JS 버전

피그마(Figma Make)가 생성해준 React + TypeScript 코드를 팀이 배운 스택(HTML / CSS / Vanilla JS)에 맞게 그대로 새로 짠 버전입니다. 화면 구성과 동작은 원본과 최대한 동일하게 맞췄습니다.

## 실행 방법

빌드 과정이 없는 순수 정적 페이지라 별도 설치 없이 바로 열어볼 수 있습니다.

```bash
# 아무 정적 서버로 실행 (예: VSCode Live Server, 또는)
python3 -m http.server 8000
# 이후 브라우저에서 http://localhost:8000 접속
```

`index.html`을 파일 탐색기에서 더블클릭해서 바로 열어도 대부분 동작하지만, 페이지 간 이동에 쿼리스트링(`?id=1`)을 쓰기 때문에 로컬 서버로 여는 걸 추천합니다.

## 파일 구조

```
index.html        메인 페이지 (축제 목록)
login.html         로그인
signup.html        회원가입
detail.html        축제 상세 (?id=축제ID)
nearby.html        근처 맛집/카페/숙소 (?id=축제ID)
schedule.html       내 일정 (로그인 필요)

css/style.css       전체 스타일 (원본 디자인의 색상 #FF6B2B 등 그대로 반영)

js/data.js          축제 / 장소 목업 데이터 — 나중에 TourAPI, 카카오 로컬 API 응답으로 교체
js/auth.js          로그인 상태 · 저장된 일정 관리 — 나중에 Supabase로 교체
js/icons.js         공통 SVG 아이콘
js/common.js        공통 헤더 렌더링 + 로그인 모달 + 개발용 로그인 토글 버튼
js/main-page.js     index.html 전용 로직
js/login-page.js    login.html 전용 로직
js/signup-page.js   signup.html 전용 로직
js/detail-page.js   detail.html 전용 로직
js/nearby-page.js   nearby.html 전용 로직
js/schedule-page.js schedule.html 전용 로직
```

## Supabase 연동 시 바꿔야 할 부분

지금은 `js/auth.js`가 `localStorage`로 로그인 상태와 저장된 일정을 흉내 내고 있습니다. Supabase를 연결할 때는 아래 함수들의 **내부 구현만** 바꾸면 되고, 다른 페이지 스크립트는 함수 이름을 그대로 가져다 쓰기 때문에 손댈 필요가 거의 없습니다.

| 함수 | 지금 (localStorage) | 나중에 (Supabase) |
| --- | --- | --- |
| `isLoggedIn()` | `localStorage`에 저장된 플래그 확인 | `supabase.auth.getSession()` 결과 확인 |
| `setLoggedIn(true/false)` | 플래그 저장 | `supabase.auth.signInWithPassword(...)` / `signOut()` |
| `getSavedSchedules()` | `localStorage`에서 JSON 파싱 | `supabase.from('schedules').select()` |
| `addSavedSchedule(schedule)` | `localStorage`에 push | `supabase.from('schedules').insert(schedule)` |
| `deleteSavedSchedule(id)` | `localStorage`에서 filter | `supabase.from('schedules').delete().eq('id', id)` |

`js/login-page.js`, `js/signup-page.js`에도 `TODO(Supabase 연동)` 주석으로 정확히 어디를 바꾸면 되는지 표시해뒀습니다.

`js/data.js`의 `FESTIVALS`, `ALL_PLACES`도 같은 방식입니다 — 실제 TourAPI / 카카오 로컬 API 응답을 이 두 변수와 같은 모양(배열 안에 `{ id, name, ... }` 객체)으로 가공해서 채워 넣으면, 화면을 그리는 다른 코드는 그대로 재사용할 수 있습니다.

## 화면 우측 하단의 검정 버튼

"🔐 로그인으로 전환" 버튼은 실제 로그인 기능이 붙기 전까지 로그인/비로그인 상태를 테스트해보기 위한 임시 버튼입니다(`js/common.js`의 `renderDevToggle`). Supabase 로그인이 실제로 연결되면 지워도 됩니다.
