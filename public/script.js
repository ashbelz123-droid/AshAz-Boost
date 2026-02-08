let email = "user@test.com";
let services = [];

function login() {
  fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  }).then(() => location.href = "/dashboard");
}

async function loadServices() {
  const res = await fetch("/api/services");
  services = await res.json();

  const sel = document.getElementById("service");
  services.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.text = s.name;
    opt.dataset.price = s.rateUGX;
    opt.dataset.desc = s.desc;
    sel.appendChild(opt);
  });

  sel.onchange = updatePrice;
  updatePrice();
}

function updatePrice() {
  const sel = document.getElementById("service");
  const opt = sel.selectedOptions[0];
  document.getElementById("desc").innerText = opt.dataset.desc;
  document.getElementById("price").innerText = opt.dataset.price;
}

async function order() {
  const price = parseInt(document.getElementById("price").innerText);
  await fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      service: service.value,
      link: link.value,
      quantity: qty.value,
      price
    })
  });
  alert("Order sent");
}

async function deposit() {
  const amt = parseInt(document.getElementById("deposit").value);
  await fetch("/api/deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, amount: amt })
  });
  loadWallet();
}

async function loadWallet() {
  const r = await fetch(`/api/wallet/${email}`);
  const d = await r.json();
  document.getElementById("wallet").innerText =
    "UGX " + d.wallet.toLocaleString();
}

if (location.pathname.includes("dashboard")) {
  loadServices();
  loadWallet();
    }
