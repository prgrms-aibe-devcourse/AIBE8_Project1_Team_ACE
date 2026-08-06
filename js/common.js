/**
 * ======================================
 * common.js
 * --------------------------------------
 * 공통 헤더 렌더링
 * ======================================
 */
const isLoggedIn = () => false; // TODO : 로그인 기능 개발 시 지워줄 것

const renderHeader = () => {
  const header = document.querySelector("#site-header");
  const rightArea = isLoggedIn() // 로그인 시 페이지와 로그아웃 시 페이지
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

  const homeBtn = document.querySelector("#home-btn");
  homeBtn.addEventListener("click", () => {
    location.href = "index.html";
  });

  const scheduleBtn = document.querySelector("#schedule-btn");
  scheduleBtn.addEventListener("click", () => {
    location.href = "schedule.html";
  });

  const loginBtn = document.querySelector("#login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      location.href = "login.html";
    });
  }

  const signupBtn = document.querySelector("#signup-btn");
  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      location.href = "signup.html";
    });
  }

  const logoutBtn = document.querySelector("#logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
      location.href = "index.html";
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
});
