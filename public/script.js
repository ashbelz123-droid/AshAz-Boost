let email = "user@test.com";
let services = [];

/* LOGIN AUTO */
fetch("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email })
});

/* LOAD WALLET */
async function loadWallet() {
  const r = await fetch(`/api/wallet/${email}`);
  const d = await r.json();
  document.getElementById("wallet").innerText =
    "UGX " + d.wallet.toLocaleString();
}

/* LOAD SERVICES */
async function loadServices() {
  const r = await fetch("/api/services");
  services = await r.json();
  renderServices(services);
}

function renderServices(list) {
  const sel = document.getElementById("service");
  sel.innerHTML = "";

  list.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.text = `${s.name} (${s.category})`;
    opt.dataset.price = s.priceUGX;
    opt.dataset.desc = s.desc;
    sel.appendChild(opt);
  });

  updatePrice();
}

function updatePrice() {
  const opt = service.selectedOptions[0];
  if (!opt) return;
  document.getElementById("price").innerText = opt.dataset.price;
  document.getElementById("desc").innerText = opt.dataset.desc;
}

service.onchange = updatePrice;

/* SEARCH */
function filterServices() {
  const q = serviceSearch.value.toLowerCase();
  const filtered = services.filter(s =>
    (s.name + s.category).toLowerCase().includes(q)
  );
  renderServices(filtered);
}

/* ORDER */
async function order() {
  const price = parseInt(priceEl());
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
  alert("Order placed");
  loadWallet();
}

function priceEl() {
  return document.getElementById("price").innerText;
}

/* DEPOSIT */
async function deposit() {
  const amt = parseInt(document.getElementById("deposit").value);
  await fetch("/api/deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, amount: amt })
  });
  loadWallet();
}

/* INIT */
loadServices();
loadWallet();
