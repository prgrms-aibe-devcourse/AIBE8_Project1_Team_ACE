/* IIFE(즉시 실행 함수 표현식) */
(() => {
  const getSupabaseClient = () => {
    const supabaseClient = window.supabaseClient;
    if (!supabaseClient) {
      throw new Error("Supabase 클라이언트가 초기화되지 않았습니다.");
    }
    return supabaseClient;
  };
  window.Auth = {};
})();
