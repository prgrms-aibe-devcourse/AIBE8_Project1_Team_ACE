/**
 * ======================================
 * common.js
 * --------------------------------------
 * 공통 헤더 렌더링
 * ======================================
 */


const handleLogoutClick = async () => {
  const signOutResult = await window.Auth.signOut();

  if (!signOutResult.ok) {
    window.alert(signOutResult.error?.message ?? "로그아웃에 실패했습니다.");
    return;
  }

  await renderHeader();
};

const renderHeader = async () => {
  const header = document.querySelector("#site-header");
  const currentUserResult = await window.Auth.getCurrentUser();
  const isLoggedIn =
    currentUserResult.ok && Boolean(currentUserResult.data?.user);
  const rightArea = isLoggedIn // 로그인 시 페이지와 로그아웃 시 페이지
    ? `<button id="schedule-btn" class="icon-btn">${getIcon("schedule")}</button>
      <button id="logout-btn" class="link-btn">로그아웃</button>`
    : `<button id="schedule-btn" class="icon-btn">${getIcon("schedule")}</button>
      <button id="login-btn" class="link-btn">로그인</button>
      <button id="signup-btn" class="btn-primary-small">회원가입</button>`;

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
    logoutBtn.addEventListener("click", handleLogoutClick);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  await renderHeader();
});
