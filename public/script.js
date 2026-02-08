const email = "user@ashmediaboost.com";
let allServices = [];

// Wallet Load + Animate
async function loadWallet() {
  const res = await fetch(`/api/wallet/${email}`);
  const data = await res.json();
  const walletEl = document.getElementById("wallet");
  const current = parseInt(walletEl.innerText.replace(/[^0-9]/g,'')) || 0;
  const target = parseInt(data.wallet || 0);

  // Animate change
  let start = current, end = target;
  const step = Math.max(Math.abs(end-start)/50,1);
  const interval = setInterval(()=>{
    if(start < end){ start += step; if(start>end) start=end; }
    else{ start -= step; if(start<end) start=end; }
    walletEl.innerText = "UGX " + Math.round(start).toLocaleString();
    if(start===end) clearInterval(interval);
  },10);
}

// Load services
async function loadServices() {
  const res = await fetch("/api/services");
  allServices = await res.json();
  populateServices(allServices);
}

function populateServices(list){
  const s = document.getElementById("service");
  s.innerHTML = "<option value=''>Select Service</option>";
  list.forEach(x=>{
    const o = document.createElement("option");
    o.value=x.id;
    o.textContent=`${x.name} (${x.category})`;
    o.dataset.price=Math.round(x.priceUGX*1.8);
    o.dataset.desc=x.desc;
    o.dataset.platform=x.platform;
    s.appendChild(o);
  });
}

// Update price & description
function updatePrice(){
  const sel = document.getElementById("service");
  const opt = sel.options[sel.selectedIndex];
  if(!opt || !opt.dataset.price) return;
  document.getElementById("price").innerText=opt.dataset.price;
  document.getElementById("desc").innerText=opt.dataset.desc;
}

// Filter services
function filterServices(){
  const q=document.getElementById("serviceSearch").value.toLowerCase();
  const filtered = allServices.filter(s=>(s.name+s.category).toLowerCase().includes(q));
  populateServices(filtered);
}

// Place order
async function placeOrder(){
  const service=document.getElementById("service").value;
  const link=document.getElementById("link").value;
  const qty=document.getElementById("qty").value;
  const price=parseInt(document.getElementById("price").innerText);
  if(!service||!link||!qty) return alert("Fill all fields");

  const res=await fetch("/api/order",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({email,service,link,quantity:qty,price})
  });
  const data=await res.json();
  if(data.error) return alert(data.error);
  alert("Order placed successfully");
  loadWallet();
  loadOrders();
}

// Deposit
async function deposit(){
  const amount=parseInt(document.getElementById("deposit").value);
  if(!amount || amount<500) return alert("Minimum deposit: 500 UGX");

  const res=await fetch("/api/deposit",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({email,amount})
  });
  const data=await res.json();
  alert("Deposit successful");
  loadWallet();
}

// Load Orders + Color Status + Platform Badge
async function loadOrders(){
  const res=await fetch(`/api/orders/${email}`);
  const data=await res.json();
  const tbody=document.querySelector("#ordersTable tbody");
  tbody.innerHTML="";

  data.forEach(o=>{
    const tr=document.createElement("tr");

    const statusClass={
      "Pending":"status-pending",
      "Completed":"status-completed",
      "Canceled":"status-canceled",
      "Partial":"status-partial"
    }[o.status]||"";

    const platformIcon={
      "Instagram":"<i class='fa-brands fa-instagram'></i>",
      "TikTok":"<i class='fa-brands fa-tiktok'></i>",
      "YouTube":"<i class='fa-brands fa-youtube'></i>",
      "Facebook":"<i class='fa-brands fa-facebook'></i>",
      "X":"<i class='fa-brands fa-x-twitter'></i>",
      "Telegram":"<i class='fa-brands fa-telegram'></i>"
    }[o.platform]||"";

    tr.innerHTML=`
      <td>${o.id}</td>
      <td class="platform-badge">${platformIcon} ${o.platform}</td>
      <td>${o.service}</td>
      <td>${o.link}</td>
      <td>${o.quantity}</td>
      <td>${o.price}</td>
      <td class="status ${statusClass}">${o.status}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Auto-refresh orders every 15s
setInterval(loadOrders,15000);

// Initial load
loadWallet();
loadServices();
loadOrders();
