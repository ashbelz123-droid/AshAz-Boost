let basePrice = 0;

function openOrder(service, price){
  document.getElementById("orderBox").style.display="flex";
  document.getElementById("serviceName").innerText = service;
  basePrice = price;
  calcPrice();
}

function closeOrder(){
  document.getElementById("orderBox").style.display="none";
}

function calcPrice(){
  let qty = document.getElementById("orderQty").value;
  let total = (qty / 100) * basePrice;
  document.getElementById("totalPrice").innerText = total.toFixed(2);
}
