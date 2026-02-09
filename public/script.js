document.querySelector(".confirm").onclick = async () => {
  const link = document.getElementById("orderLink").value;
  const qty = document.getElementById("orderQty").value;

  if(!link || !qty){
    alert("Fill all fields!");
    return;
  }

  const res = await fetch("/api/order", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      service: 1, // ⚠️ replace with REAL service ID from GodSMM
      link: link,
      quantity: qty
    })
  });

  const data = await res.json();

  if(data.order){
    alert("✅ Order placed! ID: " + data.order);
  } else {
    alert("❌ Order failed");
  }
};
