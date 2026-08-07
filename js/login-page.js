(() => {
  const loginForm = $("#login-form");
  const loginEmailInput = $("#login-email");
  const loginPasswordInput = $("#login-pw");
  const toSignupButton = $("#to-signup");

  const getTrimmedEmail = () => {
    const email = loginEmailInput.value.trim();
    loginEmailInput.value = email;
    return email;
  };

  const handleResendEmailClick = async () => {
    const email = getTrimmedEmail();
    if (!loginEmailInput.reportValidity()) {
      return;
    }

    const resendEmailResult = await window.Auth.resendSignUpEmail({ email });

    if (!resendEmailResult.ok) {
      const isEmailRateLimited = resendEmailResult.error?.code === "over_email_send_rate_limit";

      const errorMessage = isEmailRateLimited
        ? "인증 메일 요청이 많습니다. 잠시 후 다시 시도해주세요."
        : (resendEmailResult.error?.message ?? "인증 메일 재전송에 실패했습니다.");
      window.alert(errorMessage);
      return;
    }
    window.alert("인증 메일을 다시 보냈습니다. 이메일을 확인해주세요.");
  };

  const renderEmailGuide = () => {
    if ($("#email-verification-guide")) {
      return;
    }

    loginForm.insertAdjacentHTML(
      "afterend",
      `<p class="auth-footer" id="email-verification-guide">
        이메일 인증이 필요합니다.
        <button type="button" class="auth-footer-link" id="resend-email-btn">
          인증 메일 재전송
        </button>
      </p>
      `,
    );

    const resendEmailButton = $("#resend-email-btn");
    resendEmailButton.addEventListener("click", handleResendEmailClick);
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    const email = getTrimmedEmail();
    const password = loginPasswordInput.value;
    const signInResult = await window.Auth.signIn({
      email,
      password,
    });

    if (!signInResult.ok) {
      if (signInResult.error?.code === "email_not_confirmed") {
        renderEmailGuide();
        window.alert("이메일 인증 후 로그인해주세요.");
        return;
      }

      $("#email-verification-guide")?.remove();

      window.alert(signInResult.error?.message ?? "로그인에 실패했습니다.");
      return;
    }
    window.location.href = "index.html";
  };

  const handleSignupClick = () => {
    window.location.href = "signup.html";
  };

  loginForm.addEventListener("submit", handleLoginSubmit);
  toSignupButton.addEventListener("click", handleSignupClick);
})();
