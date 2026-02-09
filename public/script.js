let currentEmail = localStorage.getItem("userEmail") || "user@ashmediaboost.com";
let wallet = Number(localStorage.getItem("wallet_"+currentEmail)) || 0;
let orders = JSON.parse(localStorage.getItem("orders_"+currentEmail)) || [];

/* WELCOME */
document.getElementById("welcomeMsg").innerText =
  "Welcome, " + currentEmail.split("@")[0];

/* WALLET */
function updateWallet(){
  document.getElementById("walletBalance").innerText =
    "Wallet: UGX " + wallet.toLocaleString();
}
updateWallet();

/* DEPOSIT (SIMULATED FOR NOW) */
function deposit(channel){
  let amt = Number(document.getElementById("depositAmount").value);
  if(!amt || amt < 500){
    alert("Minimum deposit is 500 UGX");
    return;
  }
  wallet += amt;
  localStorage.setItem("wallet_"+currentEmail, wallet);
  updateWallet();
  alert(channel + " deposit successful!");
}

/* SERVICES */
const services = [
 {id:1,platform:"Instagram",name:"Followers",price:1800,min:10,max:100000,desc:"Real & HQ"},
 {id:2,platform:"Instagram",name:"Likes",price:1200,min:10,max:50000,desc:"Fast"},
 {id:3,platform:"TikTok",name:"Followers",price:1500,min:10,max:100000,desc:"Stable"},
 {id:4,platform:"YouTube",name:"Views",price:900,min:100,max:1000000,desc:"High retention"},
 {id:5,platform:"Telegram",name:"Members",price:1100,min:50,max:100000,desc:"No refill"}
];

function icon(p){
  return `<i class="fab fa-${p.toLowerCase()}"></i>`;
}

function renderServices(list=services){
  let tbody = document.querySelector("#servicesTable tbody");
  tbody.innerHTML="";
  list.forEach(s=>{
    tbody.innerHTML += `
      <tr>
        <td>${icon(s.platform)} ${s.platform}</td>
        <td>${s.name}</td>
        <td>${s.price}</td>
        <td>${s.min}</td>
        <td>${s.max}</td>
        <td>${s.desc}</td>
        <td><input type="number" id="q${s.id}" value="${s.min}" min="${s.min}"></td>
        <td><button onclick="order(${s.id})">Order</button></td>
      </tr>`;
  });
}
renderServices();

/* ORDER */
function order(id){
  let s = services.find(x=>x.id===id);
  let q = Number(document.getElementById("q"+id).value);
  let cost = s.price;
  if(wallet < cost){ alert("Insufficient balance"); return; }
  wallet -= cost;
  orders.push({
    id:Date.now(),
    platform:s.platform,
    service:s.name,
    qty:q,
    price:cost,
    status:"Processing"
  });
  localStorage.setItem("wallet_"+currentEmail, wallet);
  localStorage.setItem("orders_"+currentEmail, JSON.stringify(orders));
  updateWallet();
  loadOrders();
}

/* ORDERS */
function loadOrders(){
  let tbody = document.querySelector("#ordersTable tbody");
  tbody.innerHTML="";
  orders.forEach(o=>{
    tbody.innerHTML += `
      <tr>
        <td>${o.id}</td>
        <td>${o.platform}</td>
        <td>${o.service}</td>
        <td>${o.qty}</td>
        <td>${o.price}</td>
        <td>${o.status}</td>
      </tr>`;
  });
}
loadOrders();

/* SEARCH */
function filterServices(){
  let s=document.getElementById("searchInput").value.toLowerCase();
  renderServices(services.filter(x =>
    x.name.toLowerCase().includes(s) || x.platform.toLowerCase().includes(s)
  ));
   }
