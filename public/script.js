/* ========= GLOBAL ========= */
const API = "";

/* ========= LOGIN ========= */
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const r = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await r.json();

  if (data.success) {
    localStorage.setItem("user", email);
    window.location.href = "/dashboard";
  } else {
    alert(data.error || "Login failed");
  }
}

/* ========= SIGNUP ========= */
async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const r = await fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await r.json();

  if (data.success) {
    alert("Account created. Login now.");
    window.location.href = "/login";
  } else {
    alert(data.error);
  }
}

/* ========= LOAD SERVICES ========= */
async function loadServices() {
  const r = await fetch("/api/services");
  const services = await r.json();

  const table = document.getElementById("services");
  if (!table) return;

  table.innerHTML = "";

  services.forEach(s => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.category}</td>
      <td>${s.name}</td>
      <td>${s.min}</td>
      <td>${s.max}</td>
      <td>$${s.rate}</td>
      <td><button onclick="selectService(${s.id})">Order</button></td>
    `;
    table.appendChild(row);
  });
}

let selectedService = null;

function selectService(id) {
  selectedService = id;
  document.getElementById("orderBox").style.display = "block";
}

/* ========= PLACE ORDER ========= */
async function placeOrder() {
  const link = document.getElementById("link").value;
  const quantity = document.getElementById("quantity").value;
  const email = localStorage.getItem("user");

  const r = await fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      service: selectedService,
      link,
      quantity
    })
  });

  const data = await r.json();

  if (data.success) {
    alert("Order placed! ID: " + data.orderId);
  } else {
    alert(data.error);
  }
}

/* ========= AUTO LOAD ========= */
document.addEventListener("DOMContentLoaded", loadServices);
