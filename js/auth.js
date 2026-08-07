/* IIFE(즉시 실행 함수 표현식) */
(() => {
  const getSupabaseClient = () => {
    const supabaseClient = window.supabaseClient;

    if (!supabaseClient) {
      throw new Error("Supabase 클라이언트가 초기화되지 않았습니다.");
    }
    return supabaseClient;
  };

  const signUp = async ({ email, password, nickname }) => {
    try {
      const supabaseClient = getSupabaseClient();
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname,
          },
        },
      });

      if (error) {
        return { ok: false, error };
      }
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error };
    }
  };

  const resendSignUpEmail = async ({ email }) => {
    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        return { ok: false, error };
      }
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      const supabaseClient = getSupabaseClient();
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { ok: false, error };
      }
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error };
    }
  };

  const signOut = async () => {
    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient.auth.signOut({
        scope: "local",
      });

      if (error) {
        return { ok: false, error };
      }
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  };

  const getCurrentUser = async () => {
    try {
      const supabaseClient = getSupabaseClient();
      const { data, error } = await supabaseClient.auth.getUser();

      if (error) {
        return { ok: false, error };
      }
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error };
    }
  };

  window.Auth = {
    signUp,
    resendSignUpEmail,
    signIn,
    signOut,
    getCurrentUser,
  };
})();
