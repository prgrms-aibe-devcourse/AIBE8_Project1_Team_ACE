(() => {
  const loginForm = $("#login-form");
  const loginEmailInput = $("#login-email");
  const loginPasswordInput = $("#login-pw");
  const toSignupButton = $("#to-signup");

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;

    const signInResult = await window.Auth.signIn({
      email,
      password,
    });

    if (!signInResult.ok) {
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
