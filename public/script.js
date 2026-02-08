let wallet = 0;

const services = {
  1: {
    price: 20,
    desc: "Real & Active Instagram followers. Fast start."
  },
  2: {
    price: 10,
    desc: "High quality Telegram members. No refill."
  }
};

async function loadUser() {
  const res = await fetch("/api/user");
  const data = await res.json();
  wallet = data.wallet;
  document.getElementById("wallet").innerText = "UGX " + wallet;
}
loadUser();

document.getElementById("qty").addEventListener("input", calc);
document.getElementById("service").addEventListener("change", calc);

function calc() {
  const service = document.getElementById("service").value;
  const qty = document.getElementById("qty").value || 0;
  document.getElementById("desc").innerText = services[service].desc;
  document.getElementById("price").innerText =
    qty * services[service].price;
}

async function deposit(amount) {
  await fetch("/api/deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount })
  });
  loadUser();
}

async function order() {
  const service = document.getElementById("service").value;
  const link = document.getElementById("link").value;
  const qty = document.getElementById("qty").value;
  const price = qty * services[service].price;

  await fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service, link, quantity: qty, price })
  });

  loadUser();
}
