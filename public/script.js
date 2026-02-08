let wallet = 0;
let services = [];
let orders = [];

// LOAD USER WALLET
function loadUser() {
  fetch("/api/user")
    .then(res => res.json())
    .then(u => {
      wallet = u.wallet;
      document.getElementById("wallet").innerText = "UGX " + wallet.toLocaleString();
    });
}

// LOAD SERVICES FROM SOCIALSPHARE
function loadServices() {
  fetch("/api/services")
    .then(res => res.json())
    .then(data => {
      services = data;

      // Populate select
      const select = document.getElementById("serviceSelect");
      select.innerHTML = "";
      services.forEach(s => {
        const option = document.createElement("option");
        option.value = s.id;
        option.innerText = s.name;
        select.appendChild(option);
      });

      // Populate table
      const table = document.getElementById("servicesTable");
      table.innerHTML = "";
      services.forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${s.category}</td>
          <td>${s.name}</td>
          <td>${Math.round(s.rate*3500)}</td>
          <td>${s.quality || "High"}</td>
          <td>${s.max || "Unlimited"}</td>
          <td>${s.refill ? "Yes" : "No"}</td>
        `;
        table.appendChild(tr);
      });

      updatePrice();
    });
}

// LOAD ORDERS
function loadOrders() {
  fetch("/api/orders")
    .then(res => res.json())
    .then(data => {
      orders = data;
      const tbody = document.getElementById("ordersList");
      tbody.innerHTML = "";
      orders.forEach(o => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${o._id}</td>
          <td>${o.service}</td>
          <td>${o.quantity}</td>
          <td>UGX ${o.price.toLocaleString()}</td>
          <td>${o.status}</td>
        `;
        tbody.appendChild(tr);
      });
    });
}

// UPDATE PRICE ON CHANGE
const select = document.getElementById("serviceSelect");
const qtyInput = document.getElementById("qty");
select.addEventListener("change", updatePrice);
qtyInput.addEventListener("input", updatePrice);

function updatePrice() {
  const serviceId = parseInt(select.value);
  const qty = parseInt(qtyInput.value) || 0;
  const service = services.find(s => s.id === serviceId);
  if (!service) return;
  document.getElementById("desc").innerText = service.desc || "High quality service, instant start, no refill";
  document.getElementById("price").innerText = Math.round((service.rate || 0) * qty * 3500);
}

// DEPOSIT
function depositMTN() {
  const amt = parseInt(document.getElementById("depositAmount").value);
  if(amt < 2000) return alert("Minimum deposit is 2000 UGX");
  fetch("/api/deposit", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({amount: amt}) })
  .then(()=> loadUser());
}

function depositAirtel() {
  const amt = parseInt(document.getElementById("depositAmount").value);
  if(amt < 2000) return alert("Minimum deposit is 2000 UGX");
  fetch("/api/deposit", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({amount: amt}) })
  .then(()=> loadUser());
}

// PLACE ORDER
function placeOrder() {
  const serviceId = parseInt(select.value);
  const qty = parseInt(qtyInput.value);
  const service = services.find(s => s.id === serviceId);
  const price = Math.round((service.rate || 0) * qty * 3500);
  const link = document.getElementById("link").value;

  if(wallet < price) return alert("Insufficient balance");

  fetch("/api/order", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({service: serviceId, quantity: qty, price, link})
  }).then(res=>res.json())
    .then(res=>{
      if(res.error) alert(res.error);
      loadUser();
      loadOrders();
    });
}

// INITIAL LOAD
loadUser();
loadServices();
loadOrders();
