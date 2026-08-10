/**
 * ======================================
 * schedule.js
 * --------------------------------------
 * Supabase schedules 테이블 요청 담당
 * ======================================
 */
/* 공용 모듈의 기본 구조 IIFE */
(() => {
  const getSupabaseClient = () => {
    const supabaseClient = window.supabaseClient;

    if (!supabaseClient) {
      throw new Error("Supabase 클라이언트가 초기화되지 않았습니다.");
    }

    return supabaseClient;
  };

  const create = async ({
    festivalId,
    festivalTitle,
    eventStartDate,
    eventEndDate = null,
    places = [],
  }) => {
    try {
      const supabaseClient = getSupabaseClient();
      const schedulePayload = {
        festival_id: festivalId,
        festival_title: festivalTitle,
        event_start_date: eventStartDate,
        event_end_date: eventEndDate,
        places,
      };

      const { data, error } = await supabaseClient
        .from("schedules")
        .insert(schedulePayload)
        .select()
        .single();

      if (error) {
        return { ok: false, error };
      }
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error };
    }
  };

  window.Schedule = {
    create,
  };
})();
