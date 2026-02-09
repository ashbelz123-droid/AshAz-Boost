let selectedService = null;
let wallet = 0;
const USD_TO_UGX = 3700;
const PROFIT_MULTIPLIER = 1.8;

const userEmail = localStorage.getItem("user") || "Guest";
document.getElementById("welcomeUser").innerText = `Welcome, ${userEmail}!`;

async function loadServices() {
  const res = await fetch("/api/services");
  const services = await res.json();
  const tbody = document.querySelector("#servicesTable tbody");
  tbody.innerHTML = "";

  services.forEach(s => {
    const ourPriceUGX = Math.round(parseFloat(s.rate) * PROFIT_MULTIPLIER * USD_TO_UGX);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.Category}</td>
      <td>${s.name}</td>
      <td>${s.min}</td>
      <td>${s.max}</td>
      <td>${ourPriceUGX}</td>
      <td><button onclick="openModal('${s.service || s.id}')">Order</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function openModal(serviceId) {
  selectedService = serviceId;
  document.getElementById("orderModal").style.display = "flex";
}
function closeModal() { document.getElementById("orderModal").style.display = "none"; }

document.getElementById("confirmOrder").onclick = () => {
  const link = document.getElementById("orderLink").value;
  const quantity = parseInt(document.getElementById("orderQty").value);
  if (!link || !quantity) { alert("Fill all fields!"); return; }
  const costUGX = quantity * USD_TO_UGX * PROFIT_MULTIPLIER;
  if (wallet < costUGX) { alert("Insufficient wallet balance!"); return; }
  wallet -= costUGX;
  updateWallet();
  alert(`✅ Order placed! UGX ${costUGX} deducted`);
  closeModal();
};

function updateWallet() { document.getElementById("walletBalance").innerText = wallet; }
function openDeposit() { document.getElementById("depositModal").style.display = "flex"; }
function closeDeposit() { document.getElementById("depositModal").style.display = "none"; }

function deposit(method) {
  const amount = parseFloat(document.getElementById("depositAmount").value);
  if (!amount || amount < 500) { alert("Minimum deposit is 500 UGX!"); return; }

  if (method === "Pesapal") {
    fetch("/api/pesapal", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ amount })
    })
    .then(res => res.json())
    .then(data => {
      if(data.payment_url){ window.open(data.payment_url,"_blank"); }
      else alert("Pesapal error. Try again.");
    });
  } else {
    wallet += amount;
    updateWallet();
    alert(`✅ ${method} deposit successful! Wallet updated`);
    closeDeposit();
  }
}

document.getElementById("search").addEventListener("keyup", function() {
  const value = this.value.toLowerCase();
  document.querySelectorAll("#servicesTable tbody tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
  });
});

updateWallet();
loadServices();
