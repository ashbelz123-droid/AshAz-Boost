/* =========================
   SIMPLE FRONTEND AUTH
   ========================= */

function login(){
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  if(!email || !password){
    msg.innerText = "Fill all fields!";
    return;
  }

  // TEMP login (frontend only)
  if(password.length < 4){
    msg.innerText = "Wrong email or password";
    return;
  }

  // Save session
  localStorage.setItem("user", email);

  // Redirect to dashboard
  window.location.href = "/dashboard.html";
}

/* =========================
   DASHBOARD LOAD
   ========================= */

async function loadServices(){
  const table = document.getElementById("services");
  if(!table) return;

  table.innerHTML = `
    <tr>
      <td>Instagram</td>
      <td>Followers</td>
      <td>100</td>
      <td>10000</td>
      <td>1.80</td>
      <td><button onclick="openOrder()">Order</button></td>
    </tr>
  `;
}

function openOrder(){
  document.getElementById("orderBox").style.display = "block";
}

function placeOrder(){
  alert("Order placed (demo mode)");
}

document.addEventListener("DOMContentLoaded", loadServices);
