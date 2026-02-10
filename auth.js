let users = {
  "user@ashmediaboost.com": { password: "123456", wallet: 0, orders: [] }
};

// LOGIN
document.getElementById("loginBtn")?.addEventListener("click", () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  if (users[email] && users[email].password === password) {
    localStorage.setItem("user", email);
    window.location.href = "dashboard.html";
  } else { alert("Invalid email or password"); }
});

// SIGNUP
document.getElementById("signupBtn")?.addEventListener("click", () => {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  if (!email || !password) { alert("Fill all fields"); return; }
  if (users[email]) { alert("User already exists"); return; }
  users[email] = { password, wallet: 0, orders: [] };
  localStorage.setItem("user", email);
  window.location.href = "dashboard.html";
});
                       
