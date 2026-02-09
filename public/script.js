let selectedService = null;

/* LOAD ALL GODSMM SERVICES */
async function loadServices() {
  const res = await fetch("/api/services");
  const services = await res.json();

  const tbody = document.querySelector("#servicesTable tbody");
  tbody.innerHTML = "";

  services.forEach(s => {
    const price = (parseFloat(s.rate) * 1.8).toFixed(2); // 1.8 PROFIT

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.category}</td>
      <td>${s.name}</td>
      <td>${s.min}</td>
      <td>${s.max}</td>
      <td>${price}</td>
      <td><button onclick="openModal(${s.service})">Order</button></td>
    `;
    tbody.appendChild(tr);
  });
}

/* OPEN ORDER BOX */
function openModal(serviceId) {
  selectedService = serviceId;
  document.getElementById("orderModal").style.display = "flex";
}

/* CLOSE ORDER BOX */
function closeModal() {
  document.getElementById("orderModal").style.display = "none";
}

/* CONFIRM ORDER */
document.getElementById("confirmOrder").onclick = async () => {
  const link = document.getElementById("orderLink").value;
  const quantity = document.getElementById("orderQty").value;

  if (!link || !quantity) {
    alert("Fill all fields!");
    return;
  }

  const res = await fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service: selectedService,
      link,
      quantity
    })
  });

  const data = await res.json();

  if (data.order) {
    alert("✅ Order placed! ID: " + data.order);
  } else {
    alert("❌ Order failed");
  }

  closeModal();
};

/* SEARCH */
document.getElementById("search").addEventListener("keyup", function () {
  const value = this.value.toLowerCase();
  document.querySelectorAll("#servicesTable tbody tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
  });
});

loadServices();
