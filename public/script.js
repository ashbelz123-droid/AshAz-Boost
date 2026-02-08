const email = "user@ashmediaboost.com";
let allServices = [];

// LOAD WALLET
async function loadWallet() {
  const res = await fetch(`/api/wallet/${email}`);
  const data = await res.json();
  document.getElementById("wallet").innerText =
    "UGX " + (data.wallet || 0).toLocaleString();
}

// LOAD SERVICES
async function loadServices() {
  const res = await fetch("/api/services");
  allServices = await res.json();
  populateServices(allServices);
}

function populateServices(list) {
  const s = document.getElementById("service");
  s.innerHTML = "<option value=''>Select Service</option>";
  list.forEach(x => {
    const o = document.createElement("option");
    o.value = x.id;
    o.textContent = `${x.name} (${x.category})`;
    o.dataset.price = Math.round(x.priceUGX * 1.8); // 1.8x profit
    o.dataset.desc = x.desc;
    s.appendChild(o);
  });
}

// UPDATE PRICE
function updatePrice() {
  const sel = document.getElementById("service");
  const opt = sel.options[sel.selectedIndex];
  if (!opt || !opt.dataset.price) return;
  document.getElementById("price").innerText = opt.dataset.price;
  document.getElementById("desc").innerText = opt.dataset.desc;
}

// SEARCH SERVICES
function filterServices() {
  const q = document.getElementById("serviceSearch").value.toLowerCase();
  const filtered = allServices.filter(s =>
    (s.name + s.category).toLowerCase().includes(q)
  );
  populateServices(filtered);
}

// PLACE ORDER
async function placeOrder() {
  const service = document.getElementById("service").value;
  const link = document.getElementById("link").value;
  const qty = document.getElementById("qty").value;
  const price = parseInt(document.getElementById("price").innerText);

  if (!service || !link || !qty) return alert("Fill all fields");

  const res = await fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, service, link, quantity: qty, price })
  });
  const data = await res.json();

  if (data.error) return alert(data.error);
  alert("Order placed successfully");
  loadWallet();
  loadOrders();
}

// DEPOSIT
async function deposit() {
  const amount = parseInt(document.getElementById("deposit").value);
  if (!amount || amount < 500) return alert("Minimum deposit: 500 UGX");

  const res = await fetch("/api/deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, amount })
  });
  const data = await res.json();
  alert("Deposit successful");
  loadWallet();
}

// LOAD & DISPLAY ORDERS
async function loadOrders() {
  const res = await fetch(`/api/orders/${email}`);
  const data = await res.json();

  const tbody = document.querySelector("#ordersTable tbody");
  tbody.innerHTML = "";

  data.forEach(o => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${o.id}</td>
      <td>${o.service}</td>
      <td>${o.link}</td>
      <td>${o.quantity}</td>
      <td>${o.price}</td>
      <td>${o.status}</td>
    `;
    tbody.appendChild(tr);
  });
}

// AUTO-REFRESH ORDERS EVERY 15s
setInterval(loadOrders, 15000);

// INITIAL LOAD
loadWallet();
loadServices();
loadOrders();
