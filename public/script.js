let wallet = 0;

const services = [
  { id: 1, name: "Instagram Followers - Cheapest Market", rate: 0.00028, desc: "⚡ Instant start | 🔒 No password | 👤 Mixed quality | ❌ No refill" },
  { id: 2, name: "Instagram Likes - Real & Fast", rate: 0.00018, desc: "❤️ Fast delivery | 🤖 Mixed accounts | ❌ No refill" },
  { id: 3, name: "Telegram Members [ Max 10M ]", rate: 0.00012, desc: "🚀 Instant start | ❌ No refill | ⚠️ Cancel enabled" },
  { id: 4, name: "YouTube Views HQ", rate: 0.00004, desc: "👁️ High retention | 🔥 Trending boost" },
  { id: 5, name: "TikTok Followers", rate: 0.00035, desc: "🎵 Fast start | 🤖 Mixed users" },
  { id: 6, name: "Facebook Page Likes", rate: 0.0004, desc: "👍 Page growth | ⚠️ No refill" },
  { id: 7, name: "Twitter Followers", rate: 0.0005, desc: "🐦 Fast delivery | 👤 Mixed quality" },
  { id: 8, name: "LinkedIn Followers", rate: 0.0012, desc: "💼 Professional profiles | ⚠️ Slow start" }
];

function loadUser() {
  fetch("/api/user").then(res => res.json()).then(u => {
    wallet = u.wallet;
    document.getElementById("wallet").innerText = "UGX " + wallet.toLocaleString();
  });
}

loadUser();

// populate services dropdown
const select = document.getElementById("serviceSelect");
services.forEach(s => {
  const option = document.createElement("option");
  option.value = s.id;
  option.innerText = s.name;
  select.appendChild(option);
});

select.addEventListener("change", updatePrice);
document.getElementById("qty").addEventListener("input", updatePrice);

function updatePrice() {
  const serviceId = parseInt(select.value);
  const qty = parseInt(document.getElementById("qty").value) || 0;
  const service = services.find(s => s.id === serviceId);
  if (!service) return;
  document.getElementById("desc").innerText = service.desc;
  document.getElementById("price").innerText = Math.round(service.rate * qty * 3500); // UGX conversion
}

// deposit
function deposit(amount, channel) {
  fetch("/api/deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount })
  }).then(() => loadUser());
}

// place order
function order() {
  const serviceId = parseInt(select.value);
  const qty = parseInt(document.getElementById("qty").value);
  const price = Math.round(services.find(s => s.id === serviceId).rate * qty * 3500);
  const link = document.getElementById("link").value;

  fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service: serviceId, quantity: qty, price, link })
  }).then(() => loadUser());
}
