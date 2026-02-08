let servicesData = {};
let userEmail = null;

// GOOGLE LOGIN
function handleCredentialResponse(response) {
  // Decode JWT to get email & name
  const payload = JSON.parse(atob(response.credential.split('.')[1]));
  const email = payload.email;
  const name = payload.name;

  fetch("/api/login", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ email, name })
  }).then(r=>r.json()).then(d=>{
    if(d.success) { userEmail = email; window.location.href="/dashboard"; }
  });
}

// Logout
function logout(){
  fetch("/api/logout",{method:"POST"}).then(()=>window.location.href="/");
}

// Load dashboard data
async function load(){
  const res = await fetch("/api/data");
  const data = await res.json();
  document.getElementById("wallet").innerText = "UGX "+data.wallet;
  document.getElementById("orders").innerHTML =
    data.orders.map(o=>`<li>${o.service} - ${o.quantity} (${o.status})</li>`).join("");
}

// Load services
async function loadServices(){
  const res = await fetch("/api/services");
  const data = await res.json();
  servicesData = data;
  const sel = document.getElementById("service");
  sel.innerHTML = '<option value="">Select Service</option>';
  for(const id in data){
    const s = data[id];
    sel.innerHTML += `<option value="${s.name}">${s.name} [${s.min}-${s.max}]</option>`;
  }
}

// Update description
function updateDesc(){
  const s = document.getElementById("service").value;
  if(!s){ desc.innerText = ""; return; }
  const srv = Object.values(servicesData).find(x=>x.name===s);
  desc.innerText = srv.description || "High quality • Fast • Reliable SMM service";
}

// Deposit
async function deposit(){
  const amount = Number(document.getElementById("amount").value);
  const res = await fetch("/api/deposit", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ amount })
  });
  const data = await res.json();
  if(data.error) alert(data.error);
  load();
}

// Place order
async function order(){
  const svc = document.getElementById("service").value;
  const qty = Number(document.getElementById("quantity").value);
  const urlValue = document.getElementById("url").value;
  if(!svc || !qty || !urlValue){ alert("Fill all fields"); return; }

  const priceUGX = Math.ceil((Object.values(servicesData).find(s=>s.name===svc)?.price || 0)*3500*1.5);
  document.getElementById("price").innerText = priceUGX;

  const res = await fetch("/api/order", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ service:svc, quantity:qty, url:urlValue })
  });
  const data = await res.json();
  if(data.error) alert(data.error);
  load();
}

// Initialize
load();
loadServices();
