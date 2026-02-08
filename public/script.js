const email = "user@ashmediaboost.com";
let allServices = [];

/* AUTO LOGIN */
fetch("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email })
});

/* LOAD WALLET */
async function loadWallet() {
  const res = await fetch(`/api/wallet/${email}`);
  const data = await res.json();
  document.getElementById("wallet").innerText =
    "UGX " + data.wallet.toLocaleString();
}

/* LOAD SERVICES */
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
    o.dataset.price = x.priceUGX;
    o.dataset.desc = x.desc;
    s.appendChild(o);
  });
}

function updatePrice() {
  const sel = document.getElementById("service");
  const opt = sel.options[sel.selectedIndex];
  if (!opt || !opt.dataset.price) return;

  document.getElementById("price").innerText = opt.dataset.price;
  document.getElementById("desc").innerText = opt.dataset.desc;
}

/* SEARCH */
function filterServices() {
  const q = document.getElementById("serviceSearch").value.toLowerCase();
  const filtered = allServices.filter(s =>
    (s.name + s.category).toLowerCase().includes(q)
  );
  populateServices(filtered);
}

/* ORDER */
async function placeOrder() {
  const service = document.getElementById("service").value;
  const link = document.getElementById("link").value;
  const quantity = document.getElementById("qty").value;
  const price = document.getElementById("price").innerText;

  if (!service || !link || !quantity) {
    alert("Fill all fields");
    return;
  }

  await fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      service,
      link,
      quantity,
      price
    })
  });

  alert("Order placed successfully");
  loadWallet();
}

/* DEPOSIT */
async function deposit() {
  const amount = document.getElementById("deposit").value;
  if (!amount) return alert("Enter amount");

  await fetch("/api/deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, amount })
  });

  alert("Deposit successful");
  loadWallet();
}

/* INIT */
loadWallet();
loadServices();
