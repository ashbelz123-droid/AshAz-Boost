let balance = 0;

function deposit() {
  const amount = Number(document.getElementById("amount").value);

  if (amount < 500) {
    alert("Minimum deposit is 500 UGX");
    return;
  }

  balance += amount;
  document.getElementById("balance").innerText = "UGX " + balance;
  alert("Deposit successful");
}

function order() {
  const qty = Number(document.getElementById("qty").value);

  if (!qty || qty <= 0) {
    alert("Enter quantity");
    return;
  }

  alert("Order placed (API coming next)");
}
