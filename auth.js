// Dummy user database
let users = {
  "user@ashmediaboost.com": { password: "123456", wallet: 0, orders: [] }
};

// Login
function login(email, password) {
  if (users[email] && users[email].password === password) {
    return { success: true };
  } else {
    return { error: "Invalid email or password" };
  }
}

// Signup
function signup(email, password) {
  if (users[email]) return { error: "User already exists" };
  users[email] = { password, wallet: 0, orders: [] };
  return { success: true };
}

module.exports = { login, signup };
