// ================= SAFE HELPERS =================
function el(id){
  return document.getElementById(id);
}

// ================= USER =================
let email = localStorage.getItem("userEmail") || "user@ashmediaboost.com";

// ================= WELCOME =================
if (el("welcomeMsg")) {
  el("welcomeMsg").innerText = "Welcome, " + email.split("@")[0];
}

// ================= WALLET =================
let wallet = Number(localStorage.getItem("wallet_" + email)) || 0;

function updateWallet(){
  if (el("walletBalance")) {
    el("walletBalance").innerText = "Wallet: UGX " + wallet.toLocaleString();
  }
}
updateWallet();

// ================= DEPOSIT (TEMP) =================
function deposit(channel){
  if (!el("depositAmount")) return;

  let amt = Number(el("depositAmount").value);
  if (!amt || amt < 500){
    alert("Minimum deposit is 500 UGX");
    return;
  }

  wallet += amt;
  localStorage.setItem("wallet_" + email, wallet);
  updateWallet();
  alert(channel + " deposit successful");
}

// ================= SERVICES =================
let services = [];

async function loadServices(){
  if (!document.querySelector("#servicesTable tbody")) return;

  try{
    const r = await fetch("/api/services");
    services = await r.json();
    renderServices();
  }catch(err){
    console.error("Service load failed");
  }
}

function renderServices(){
  const tbody = document.querySelector("#servicesTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  services.forEach(s=>{
    tbody.innerHTML += `
      <tr>
        <td>${s.category || "General"}</td>
        <td>${s.name}</td>
        <td>${s.rate}</td>
        <td>${s.min}</td>
        <td>${s.max}</td>
        <td>
          <input id="link${s.id}" placeholder="Service link">
          <input type="number" id="qty${s.id}" value="${s.min}">
        </td>
        <td>
          <button onclick="orderService(${s.id})">Order</button>
        </td>
      </tr>
    `;
  });
}

// ================= ORDER =================
async function orderService(serviceId){
  const linkEl = el("link" + serviceId);
  const qtyEl = el("qty" + serviceId);

  if (!linkEl || !qtyEl) return;

  if (!linkEl.value){
    alert("Enter service link");
    return;
  }

  try{
    const r = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({
        email,
        service: serviceId,
        link: linkEl.value,
        quantity: qtyEl.value
      })
    });

    const d = await r.json();
    if (d.success){
      alert("Order placed! ID: " + d.orderId);
    } else {
      alert("Order failed");
    }
  }catch(err){
    alert("Order error");
  }
}

// ================= SEARCH =================
function filterServices(){
  if (!el("searchInput")) return;

  const s = el("searchInput").value.toLowerCase();
  renderServices(
    services.filter(x =>
      x.name.toLowerCase().includes(s) ||
      (x.category || "").toLowerCase().includes(s)
    )
  );
}

// ================= INIT =================
loadServices();
