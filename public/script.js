const services = {
  instagram: [
    {
      name: "Instagram Followers - Cheapest Market",
      price: 20,
      desc: "⚠️ High quality | No refill | Instant start | Mixed accounts"
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
      desc: "✅ Real users | Fast delivery"
    }
  ],
  youtube: [
    {
      name: "YouTube Views",
      price: 10,
      desc: "✅ Safe | Non-drop"
    }
  ]
};

let selectedService = null;

function loadServices() {
  const category = document.getElementById("category").value;
  const serviceSelect = document.getElementById("service");
  serviceSelect.innerHTML = `<option value="">Select Service</option>`;

  if (!services[category]) return;

  services[category].forEach((s, i) => {
    serviceSelect.innerHTML += `<option value="${i}">${s.name}</option>`;
  });
}

function updateService() {
  const cat = document.getElementById("category").value;
  const index = document.getElementById("service").value;

  if (index === "") return;

  selectedService = services[cat][index];
  document.getElementById("serviceDesc").innerText = selectedService.desc;
  calcPrice();
}

function calcPrice() {
  if (!selectedService) return;
  const qty = document.getElementById("quantity").value;
  document.getElementById("price").value = qty * selectedService.price;
}
