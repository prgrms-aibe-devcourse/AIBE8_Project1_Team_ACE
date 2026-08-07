(() => {
  const loginForm = document.querySelector("#login-form");
  const loginEmailInput = document.querySelector("#login-email");
  const loginPasswordInput = document.querySelector("#login-pw");

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

  loginForm.addEventListener("submit", handleLoginSubmit);
})();
