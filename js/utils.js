/**
 * ======================================
 * utils.js
 * --------------------------------------
 * 공용 유틸 함수 (요소 선택, 포맷팅, 상태 렌더링)
 * ======================================
 */

// ========== 요소 선택 ==========
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

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