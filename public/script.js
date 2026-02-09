let currentEmail = localStorage.getItem("userEmail") || "user@ashmediaboost.com";
let walletBalance = 0;
let services = [];
let orders = [];

// Show welcome message
document.getElementById("welcomeMsg").innerText = "Welcome, " + currentEmail.split("@")[0] + "!";

// Dummy wallet
async function updateWallet(){
  // Replace with real API later
  walletBalance = parseInt(localStorage.getItem("wallet_"+currentEmail)) || 0;
  document.getElementById("walletBalance").innerText = "Wallet: UGX " + walletBalance.toLocaleString();
}
updateWallet();

// Deposit
async function deposit(channel){
  const amount = parseInt(document.getElementById("depositAmount").value);
  if(!amount || amount < 500){ alert("Minimum deposit is 500 UGX"); return; }
  walletBalance += amount;
  localStorage.setItem("wallet_"+currentEmail, walletBalance);
  updateWallet();
  alert(`Deposit successful via ${channel}!`);
}

// Dummy services
services = [
  {id:1, platform:"Instagram", name:"Followers", priceUGX:1000, min:10, max:10000, desc:"High Quality, Real Accounts"},
  {id:2, platform:"Facebook", name:"Likes", priceUGX:500, min:5, max:5000, desc:"Fast Delivery"},
  {id:3, platform:"Twitter", name:"Retweets", priceUGX:300, min:5, max:1000, desc:"Instant Start"},
  {id:4, platform:"YouTube", name:"Views", priceUGX:200, min:50, max:100000, desc:"High Retention"},
];

// Render services table
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
      <td><button onclick="placeOrder(${s.id})">Order</button></td>
    `;
    tbody.appendChild(tr);
  });
}
renderServices();

// Place order
function placeOrder(serviceId){
  const service = services.find(s=>s.id===serviceId);
  const qty = parseInt(document.getElementById(`qty_${serviceId}`).value);
  const totalPrice = service.priceUGX * qty / service.min;
  if(totalPrice>walletBalance){ alert("Insufficient balance"); return; }
  walletBalance -= totalPrice;
  localStorage.setItem("wallet_"+currentEmail, walletBalance);
  updateWallet();

  // Add to orders
  const order = {id:Date.now(), platform:service.platform, service:service.name, quantity:qty, price:totalPrice, status:"Pending"};
  orders.push(order);
  localStorage.setItem("orders_"+currentEmail, JSON.stringify(orders));
  loadOrders();
  alert("Order placed!");
}

// Load orders
function loadOrders(){
  orders = JSON.parse(localStorage.getItem("orders_"+currentEmail)) || [];
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

// Filter services
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
      <td><button onclick="placeOrder(${s.id})">Order</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Platform icons
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
