const supabaseConfig = window.SUPABASE_CONFIG;
const supabaseUrl = supabaseConfig?.url;
const supabasePublishableKey = supabaseConfig?.publishableKey;

if (!window.supabase?.createClient) {
  throw new Error("Supabase JS SDK가 로드되지 않았습니다.");
}
if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Supabase 설정값이 없습니다.");
}
window.supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabasePublishableKey,
);
