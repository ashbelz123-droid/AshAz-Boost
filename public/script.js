let servicesData = {};

async function load() {
  // Wallet + orders
  const res = await fetch("/api/data");
  const data = await res.json();
  document.getElementById("wallet").innerText = "UGX " + data.wallet;
  document.getElementById("orders").innerHTML =
    data.orders.map(o=>`<li>${o.service} - ${o.quantity} (${o.status})</li>`).join("");
}

async function loadServices() {
  const res = await fetch("/api/services");
  const data = await res.json();
  servicesData = data;
  const sel = document.getElementById("service");
  sel.innerHTML = '<option value="">Select Service</option>';
  for(const id in data){
    const s = data[id];
    sel.innerHTML += `<option value="${s.name}">${s.name} - $${s.price}</option>`;
  }
}

function updateDesc(){
  const s = service.value;
  if(!s){ desc.innerText = ""; return; }
  desc.innerText = "High quality • Fast • Reliable SMM service";
}

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

async function order(){
  const svc = service.value;
  const qty = Number(quantity.value);
  const urlValue = url.value;
  if(!svc || !qty || !urlValue){ alert("Fill all fields"); return; }

  const priceUSD = Object.values(servicesData).find(s=>s.name===svc)?.price || 0;
  const priceUGX = Math.ceil(priceUSD * 3500 * 1.5); // 50% profit
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
