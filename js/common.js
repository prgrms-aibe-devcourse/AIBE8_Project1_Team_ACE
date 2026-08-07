/**
 * ======================================
 * common.js
 * --------------------------------------
 * 공통 헤더 렌더링
 * ======================================
 */

// ========== 요소 선택 ==========
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

// TODO: bam090이 Auth.isLoggedIn() 구현 완료하면 이 블록 삭제
if (!window.Auth) window.Auth = {};
if (!Auth.isLoggedIn) {
  Auth.isLoggedIn = async () => false;
}


const renderHeader = async () => {
  const header = $("#site-header");
  const rightArea = (await Auth.isLoggedIn()) // 로그인 시 페이지와 로그아웃 시 페이지
    ? `<button id="schedule-btn" class="icon-btn">${getIcon("schedule")}</button>
      <button id="logout-btn" class="link-btn">로그아웃</button>`
    : `<button id="schedule-btn" class="icon-btn">${getIcon("schedule")}</button>
      <button id="login-btn" class="link-btn">로그인</button>
      <button id="signup-btn" class="btn-primary-small">회원가입</button>`;

  //고정적으로 뿌려져야 하는 로직과 로그인/로그아웃시 뿌려지는 영역 분리
  header.innerHTML = `
    <div class="site-header-inner">
      <button id="home-btn" class="logo-btn">
        ${getIcon("home")}
        <span class="logo-text">축제 어때</span>
      </button>
      <div class="header-right"> 
        ${rightArea}
      </div>
    </div>
      `;

  const homeBtn = $("#home-btn");
  homeBtn.addEventListener("click", () => {
    location.href = "index.html";
  });

  const scheduleBtn = $("#schedule-btn");
  scheduleBtn.addEventListener("click", () => {
    location.href = "schedule.html";
  });

  const loginBtn = $("#login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      location.href = "login.html";
    });
  }

  const signupBtn = $("#signup-btn");
  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      location.href = "signup.html";
    });
  }

  const logoutBtn = $("#logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await window.Auth.signOut();
      location.href = "index.html";
    });
  }
};

const escapeHtml = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

const formatDate = (dateString) => {
  if (
    dateString === null ||
    dateString === undefined ||
    dateString.length !== 8
  )
    return "";
  let yyyy = dateString.slice(0, 4);
  let mm = dateString.slice(4, 6);
  let dd = dateString.slice(6, 8);

  return `${yyyy}.${mm}.${dd}`;
};

const showLoading = (container) => {
  if (!container) return;
  container.innerHTML = `<div class="loading-state">로딩중</div>`;
};

const showEmpty = (container, message) => {
  if (!container) return;
  container.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
};

const showError = (container, message) => {
  if (!container) return;
  container.innerHTML = `<div class="error-state">${escapeHtml(message)}</div>`;
};

const getQueryParam = (name) => {
  return new URLSearchParams(location.search).get(name);
};

document.addEventListener("DOMContentLoaded", async () => {
  await renderHeader();
});

