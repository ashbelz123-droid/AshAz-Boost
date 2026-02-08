let wallet = 0;
let services = [];

function loadUser() {
  fetch("/api/user")
    .then(res => res.json())
    .then(u => {
      wallet = u.wallet;
      document.getElementById("wallet").innerText = "UGX " + wallet.toLocaleString();
    });
}

function loadServices() {
  fetch("/api/services")
    .then(res => res.json())
    .then(data => {
      services = data;
      const select = document.getElementById("serviceSelect");
      select.innerHTML = "";
      services.forEach(s => {
        const option = document.createElement("option");
        option.value = s.id;
        option.innerText = s.name;
        select.appendChild(option);
      });
      updatePrice();
    });
}

loadUser();
loadServices();

const select = document.getElementById("serviceSelect");
const qtyInput = document.getElementById("qty");
select.addEventListener("change", updatePrice);
qtyInput.addEventListener("input", updatePrice);

function updatePrice() {
  const serviceId = parseInt(select.value);
  const qty = parseInt(qtyInput.value) || 0;
  const service = services.find(s => s.id === serviceId);
  if (!service) return;
  document.getElementById("desc").innerText = service.desc || "No description";
  document.getElementById("price").innerText = Math.round((service.rate || 0) * qty * 3500);
}

function deposit(amount, channel) {
  fetch("/api/deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount })
  }).then(() => loadUser());
}

function order() {
  const serviceId = parseInt(select.value);
  const qty = parseInt(qtyInput.value);
  const service = services.find(s => s.id === serviceId);
  const price = Math.round((service.rate || 0) * qty * 3500);
  const link = document.getElementById("link").value;

  fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service: serviceId, quantity: qty, price, link })
  }).then(res => res.json())
    .then(res => {
      if (res.error) alert(res.error);
      loadUser();
    });
}
