(() => {
  class Auth {
    constructor() {
      this.loginInput = document.querySelector("#login");
      this.passwordInput = document.querySelector("#password");
      this.loginButton = document.querySelector("#login-button");
      this.registerButton = document.querySelector("#register-button");
      this.errorTextEl = document.querySelector("#errorToast .toast-body");

      this.errorToast = new bootstrap.Toast(
        document.querySelector("#errorToast")
      );

      this.login.bind(this);
      this.register.bind(this);

      if (this.loginButton) this.loginButton.onclick = this.login;
      if (this.registerButton) this.registerButton.onclick = this.register;
    }

    login = () => {
      const user = {
        name: this.loginInput.value,
        password: this.passwordInput.value,
      };

      fetch("/api/login", {
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify(user),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (res) => {
        const json = await res.json();

        if (json.success !== true) {
          this.errorTextEl.textContent = json.message;
          this.errorToast.show();
          return;
        }

        window.sessionStorage.setItem("token", json.accessToken);
        window.location.href = "/";
      });
    };

    register = () => {
      const user = {
        name: this.loginInput.value,
        password: this.passwordInput.value,
      };

      fetch("/api/register", {
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify(user),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (res) => {
        const json = await res.json();

        if (json.success !== true) {
          this.errorTextEl.textContent = json.message;
          this.errorToast.show();
          return;
        }

        window.sessionStorage.setItem("token", json.accessToken);
        window.location.href = "/";
      });
    };
  }

  const auth = new Auth();
})();
