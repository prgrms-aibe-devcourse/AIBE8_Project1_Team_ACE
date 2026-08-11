/**
 * ======================================
 * schedule-page.js
 * --------------------------------------
 * 내 일정 페이지 UI 및 이벤트 처리 담당
 * ======================================
 */

(() => {
  const scheduleContent = $("#schedule-content");

  const formatScheduleDate = (dateString) => {
    if (!dateString) { return ""; }
    const normalizedDate = dateString.replaceAll("-", "");
    return formatDate(normalizedDate);
  };

  const renderSchedulePlaces = (places) => {
    if (places.length === 0) {
      return "<p>저장된 장소가 없습니다.</p>";
    }

    return places
      .map((place, index) => {
        return `
          <div class="schedule-card-step">
            <span class="step-num-sm">${index + 1}</span>
            <span>${escapeHtml(place?.name ?? "이름 없는 장소")}</span>
          </div>`;
      })
      .join("");
  };

  const renderScheduleCard = (schedule) => {
    const startDate = formatScheduleDate(schedule.event_start_date);
    const endDate = formatScheduleDate(schedule.event_end_date);
    const dateText = endDate ? `${startDate} - ${endDate}` : startDate;
    const places = Array.isArray(schedule.places) ? schedule.places : [];

    return `
      <article class="schedule-card">
        <div class="schedule-card-header">
          <div class="schedule-card-header-info">
            <p class="schedule-card-title">${escapeHtml(schedule.festival_title)}</p>
            <p class="schedule-card-date">${dateText}</p>
            <p class="schedule-card-count">저장한 장소 <strong>${places.length}</strong>곳</p>
          </div>
        </div>
        <div class="schedule-card-body">
          <p class="schedule-card-body-label">저장한 장소</p>
          <div class="schedule-card-steps">${renderSchedulePlaces(places)}</div>
        </div>
      </article>`;
  };

  const renderSchedules = (schedules) => {
    const scheduleCards = schedules.map(renderScheduleCard).join("");
    scheduleContent.innerHTML = `<div class="schedule-list">${scheduleCards}</div>`;
  };

  const loadSchedules = async () => {
    showLoading(scheduleContent);

    const currentUserResult = await window.Auth.getCurrentUser();
    const isSessionMissing = currentUserResult.error?.name === "AuthSessionMissingError";

    if (isSessionMissing) {
      window.location.href = "login.html";
      return;
    }

    if (!currentUserResult.ok) {
      showError(
        scheduleContent,
        currentUserResult.error?.message ?? "로그인 상태를 확인하지 못했습니다.",
      );
      return;
    }

    if (!currentUserResult.data?.user) {
      window.location.href = "login.html";
      return;
    }

    const scheduleResult = await window.Schedule.getAll();
    if (!scheduleResult.ok) {
      showError(
        scheduleContent,
        scheduleResult.error?.message ?? "일정을 불러오지 못했습니다.",
      );
      return;
    }

    const schedules = scheduleResult.data;
    if (schedules.length === 0) {
      showEmpty(scheduleContent, "저장된 일정이 없습니다.");
      return;
    }

    renderSchedules(schedules);
  };

  const handleDOMContentLoaded = async () => { await loadSchedules(); };
  document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);
})();
