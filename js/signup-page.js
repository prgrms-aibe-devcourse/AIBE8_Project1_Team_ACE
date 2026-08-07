(() => {
  const signupForm = $("#signup-form");
  const signupEmailInput = $("#signup-email");
  const signupPasswordInput = $("#signup-pw");
  const signupPasswordConfirmInput = $("#signup-pw-confirm");
  const signupNicknameInput = $("#signup-nick");
  const toLoginButton = $("#to-login");

  const handleSignupSubmit = async (event) => {
    event.preventDefault();

    const email = signupEmailInput.value.trim();
    const password = signupPasswordInput.value;
    const passwordConfirm = signupPasswordConfirmInput.value;
    const nickname = signupNicknameInput.value.trim();

    if (password !== passwordConfirm) {
      window.alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const signUpResult = await window.Auth.signUp({
      email,
      password,
      nickname,
    });

    if (!signUpResult.ok) {
      window.alert(signUpResult.error?.message ?? "회원가입에 실패했습니다.");
      return;
    }

    window.alert("회원가입이 완료되었습니다. 이메일 인증 후 로그인해주세요.");
    window.location.href = "login.html";
  };

  const handleLoginClick = () => {
    window.location.href = "login.html";
  };

  signupForm.addEventListener("submit", handleSignupSubmit);
  toLoginButton.addEventListener("click", handleLoginClick);
})();
