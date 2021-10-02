const loginBtn = $("#login");

loginBtn.on("click", () => {
  const username = $("#username").val();
  const password = $("#password").val();

  if (username !== "" && password !== "") {
    window.api.loginRequest(username, password);
  }
});

window.api.onLoginResponse((event, args) => {
  if (args[0].success) {
    new Notification("Login Success", {
      body: `welcome dear ${args[0].username}`,
    });
  } else {
    new Notification("Login failed", { body: args[0].err });
  }
});
