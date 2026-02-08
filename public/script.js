let currentEmail = "user@ashmediaboost.com";
let walletBalance = 0;
let services = [];
let orders = [];

async function updateWallet(){
  const res = await fetch(`/api/wallet/${currentEmail}`);
  const data = await res.json();
  walletBalance = data.wallet;
  document.getElementById("walletBalance").innerText = "UGX " + walletBalance.toLocaleString();
}
updateWallet();

async function deposit(channel){
  const amount = parseInt(document.getElementById("depositAmount").value);
  if(!amount || amount<500){ alert("Minimum deposit is 500 UGX"); return; }
  await fetch("/api/deposit",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ email:currentEmail, amount })
  });
  updateWallet();
  alert("Deposit successful!");
}

async function loadServices(){
  const res = await fetch("/api/services");
  services = await res.json();
  renderServices();
}

function renderServices(){
  const tbody = document.querySelector("#servicesTable tbody");
  tbody.innerHTML = "";
  services.forEach(s=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${getPlatformIcon(s.platform)} ${s.platform}</td>
      <td>${s.name}</td>
      <td>${s.priceUGX.toLocaleString()}</td>
      <td>${s.min}</td>
      <td>${s.max}</td>
      <td>${s.desc}</td>
      <td><input type="number" min="${s.min}" max="${s.max}" value="${s.min}" id="qty_${s.id}"></td>
      <td><button onclick="placeOrder(${s.id}, ${s.priceUGX})">Order</button></td>
    `;
    tbody.appendChild(tr);
  });
}
loadServices();

async function placeOrder(serviceId, priceUGX){
  const qty = parseInt(document.getElementById(`qty_${serviceId}`).value);
  const service = services.find(s => s.id === serviceId);
  const totalPrice = priceUGX * qty / service.min;
  if(totalPrice>walletBalance){ alert("Insufficient balance"); return; }
  const res = await fetch("/api/order",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ email:currentEmail, service:serviceId, link:"", quantity:qty, price:totalPrice })
  });
  const data = await res.json();
  if(data.success){ alert("Order placed!"); updateWallet(); loadOrders(); }
  else{ alert(data.error); }
}

async function loadOrders(){
  const res = await fetch(`/api/orders/${currentEmail}`);
  orders = await res.json();
  const tbody = document.querySelector("#ordersTable tbody");
  tbody.innerHTML = "";
  orders.forEach(o=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${o.id}</td>
      <td>${o.platform}</td>
      <td>${o.service}</td>
      <td>${o.quantity}</td>
      <td>${o.price.toLocaleString()}</td>
      <td>${o.status}</td>
    `;
    tbody.appendChild(tr);
  });
}
loadOrders();

function filterServices(){
  const search = document.getElementById("searchInput").value.toLowerCase();
  const filtered = services.filter(s=>s.name.toLowerCase().includes(search)||s.platform.toLowerCase().includes(search));
  const tbody = document.querySelector("#servicesTable tbody");
  tbody.innerHTML = "";
  filtered.forEach(s=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${getPlatformIcon(s.platform)} ${s.platform}</td>
      <td>${s.name}</td>
      <td>${s.priceUGX.toLocaleString()}</td>
      <td>${s.min}</td>
      <td>${s.max}</td>
      <td>${s.desc}</td>
      <td><input type="number" min="${s.min}" max="${s.max}" value="${s.min}" id="qty_${s.id}"></td>
      <td><button onclick="placeOrder(${s.id}, ${s.priceUGX})">Order</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function getPlatformIcon(name){
  switch(name.toLowerCase()){
    case "instagram": return '<i class="fab fa-instagram"></i>';
    case "facebook": return '<i class="fab fa-facebook"></i>';
    case "twitter": return '<i class="fab fa-twitter"></i>';
    case "youtube": return '<i class="fab fa-youtube"></i>';
    case "telegram": return '<i class="fab fa-telegram"></i>';
    case "tiktok": return '<i class="fab fa-tiktok"></i>';
    case "linkedin": return '<i class="fab fa-linkedin"></i>';
    default: return '<i class="fas fa-globe"></i>';
  }
      }
