let email = localStorage.getItem("userEmail");
if(!email) window.location.href="/login";

let allServices=[], filteredPlatform="All";

async function loadWallet(){
  const res=await fetch(`/api/wallet/${email}`);
  const data=await res.json();
  document.getElementById("wallet").innerText = "UGX "+(data.wallet || 0).toLocaleString();
}

async function loadServices(){
  const res=await fetch("/api/services");
  allServices = await res.json();
  populateServices(allServices);
}

function populateServices(list){
  const s=document.getElementById("service");
  s.innerHTML="<option value=''>Select Service</option>";
  list.forEach(x=>{
    if(filteredPlatform!=="All" && x.platform!==filteredPlatform) return;
    const o=document.createElement("option");
    o.value=x.id;
    o.textContent=`${x.name} (${x.category})`;
    o.dataset.price=x.priceUGX;
    o.dataset.desc=x.desc;
    o.dataset.platform=x.platform;
    o.dataset.min=x.min;
    o.dataset.max=x.max;
    s.appendChild(o);
  });
}

function filterByPlatform(platform){
  filteredPlatform=platform;
  document.querySelectorAll(".platform-btn").forEach(btn=>btn.classList.remove("active"));
  event.target.classList.add("active");
  populateServices(allServices);
}

function updatePrice(){
  const sel=document.getElementById("service");
  const opt=sel.options[sel.selectedIndex];
  if(!opt || !opt.dataset.price) return;
  document.getElementById("price").innerText=opt.dataset.price;
  document.getElementById("desc").innerText=opt.dataset.desc;
}

function filterServices(){
  const q=document.getElementById("serviceSearch").value.toLowerCase();
  const filtered = allServices.filter(s=>(s.name+s.category).toLowerCase().includes(q));
  populateServices(filtered);
}

async function placeOrder(){
  const service=document.getElementById("service").value;
  const link=document.getElementById("link").value;
  const qty=parseInt(document.getElementById("qty").value);
  const price=parseInt(document.getElementById("price").innerText);
  if(!service||!link||!qty) return alert("Fill all fields");

  const sel=document.getElementById("service");
  const opt=sel.options[sel.selectedIndex];
  const min=parseInt(opt.dataset.min), max=parseInt(opt.dataset.max);
  if(qty<min || qty>max) return alert(`Quantity must be between ${min} and ${max}`);

  const res=await fetch("/api/order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,service,link,quantity:qty,price})});
  const data=await res.json();
  if(data.error) return alert(data.error);
  alert("Order placed successfully");
  loadWallet();
  loadOrders();
}

async function deposit(){
  const amount=parseInt(document.getElementById("deposit").value);
  if(!amount || amount<500) return alert("Minimum deposit: 500 UGX");
  const res=await fetch("/api/deposit",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,amount}) });
  await res.json();
  loadWallet();
}

async function loadOrders(){
  const res=await fetch(`/api/orders/${email}`);
  const data=await res.json();
  const tbody=document.querySelector("#ordersTable tbody");
  tbody.innerHTML="";
  data.forEach(o=>{
    const tr=document.createElement("tr");
    const platformIcon={
      "Instagram":"<i class='fa-brands fa-instagram'></i>",
      "TikTok":"<i class='fa-brands fa-tiktok'></i>",
      "YouTube":"<i class='fa-brands fa-youtube'></i>",
      "Facebook":"<i class='fa-brands fa-facebook'></i>",
      "X":"<i class='fa-brands fa-x-twitter'></i>",
      "Telegram":"<i class='fa-brands fa-telegram'></i>"
    }[o.platform]||"";
    const statusClass={
      "Pending":"status-pending",
      "Completed":"status-completed",
      "Canceled":"status-canceled",
      "Partial":"status-partial"
    }[o.status]||"";
    tr.innerHTML=`
      <td>${o.id}</td>
      <td>${platformIcon} ${o.platform}</td>
      <td>${o.service}</td>
      <td>${o.link}</td>
      <td>${o.quantity}</td>
      <td>${o.price}</td>
      <td class="status ${statusClass}">${o.status}</td>
    `;
    tbody.appendChild(tr);

    if(o.status=="Canceled" && o.price>0){
      fetch("/api/deposit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,amount:o.price})});
      o.price=0;
    }
  });
}

setInterval(loadOrders,15000);
loadWallet();
loadServices();
loadOrders();
