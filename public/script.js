const services = {
  instagram: [
    {
      name: "Instagram Followers - Cheapest Market",
      price: 20,
      desc: "⚠️ High quality | Mixed accounts | No refill | Instant start"
    }
  ],
  telegram: [
    {
      name: "Telegram Members [Max 10M]",
      price: 15,
      desc: "⚠️ High quality | Cancel enabled | No refill"
    }
  ],
  tiktok: [
    {
      name: "TikTok Likes",
      price: 18,
      desc: "✅ Real users | Safe | Fast delivery"
    }
  ],
  youtube: [
    {
      name: "YouTube Views",
      price: 10,
      desc: "✅ Non-drop | Monetization friendly"
    }
  ]
};

let selected = null;

function loadServices() {
  const cat = document.getElementById("category").value;
  const service = document.getElementById("service");
  service.innerHTML = `<option value="">Select Service</option>`;

  if (!services[cat]) return;

  services[cat].forEach((s, i) => {
    service.innerHTML += `<option value="${i}">${s.name}</option>`;
  });
}

function selectService() {
  const cat = document.getElementById("category").value;
  const idx = document.getElementById("service").value;

  if (idx === "") return;

  selected = services[cat][idx];
  document.getElementById("description").innerText = selected.desc;
  calculatePrice();
}

function calculatePrice() {
  if (!selected) return;
  const qty = document.getElementById("quantity").value || 0;
  document.getElementById("price").value = qty * selected.price;
}

function placeOrder() {
  if (!selected) {
    alert("Select service first");
    return;
  }
  alert("Order placed (demo). API will be connected next.");
}
