async function load() {
  const res = await fetch("/api/data");
  const data = await res.json();
  document.getElementById("wallet").innerText = "UGX " + data.wallet;
  document.getElementById("orders").innerHTML =
    data.orders.map(o => `<li>${o.service} - ${o.quantity} (${o.status})</li>`).join("");
}
load();

function updateDesc() {
  const s = service.value;
  const d = {
    "Instagram Followers": "High quality • No refill • Fast",
    "Telegram Members": "Max 10M • Cancel enabled ⚠️",
    "TikTok Views": "Fast start • Realistic views",
    "YouTube Subs": "Slow & safe delivery"
  };
  desc.innerText = d[s] || "";
}

async function deposit() {
  const amount = Number(document.getElementById("amount").value);
  const res = await fetch("/api/deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount })
  });
  const data = await res.json();
  if (data.error) alert(data.error);
  load();
}

async function order() {
  const qty = Number(quantity.value);
  const price = qty * 5; // example price
  document.getElementById("price").innerText = price;

  const res = await fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service: service.value,
      quantity: qty,
      price
    })
  });
  const data = await res.json();
  if (data.error) alert(data.error);
  load();
}
