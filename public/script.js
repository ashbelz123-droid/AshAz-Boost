let email = localStorage.getItem("userEmail") || "user@ashmediaboost.com";

document.getElementById("welcomeMsg").innerText =
  "Welcome, " + email.split("@")[0];

let services = [];

/* LOAD SERVICES */
async function loadServices(){
  const r = await fetch("/api/services");
  services = await r.json();
  renderServices();
}
loadServices();

/* RENDER SERVICES */
function renderServices(){
  const tbody = document.querySelector("#servicesTable tbody");
  tbody.innerHTML = "";
  services.forEach(s=>{
    tbody.innerHTML += `
      <tr>
        <td>${s.category}</td>
        <td>${s.name}</td>
        <td>${s.rate}</td>
        <td>${s.min}</td>
        <td>${s.max}</td>
        <td>
          <input id="link${s.id}" placeholder="Link">
          <input type="number" id="qty${s.id}" value="${s.min}">
        </td>
        <td>
          <button onclick="order(${s.id})">Order</button>
        </td>
      </tr>`;
  });
}

/* ORDER */
async function order(serviceId){
  const link = document.getElementById("link"+serviceId).value;
  const qty = document.getElementById("qty"+serviceId).value;

  if(!link){ alert("Enter link"); return; }

  const r = await fetch("/api/order",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ email, service:serviceId, link, quantity:qty })
  });

  const d = await r.json();
  if(d.success){
    alert("Order placed! ID: "+d.orderId);
  }else{
    alert("Order failed");
  }
    }
