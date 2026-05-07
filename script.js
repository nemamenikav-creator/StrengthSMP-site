let uiLocked = false;

const API_URL = "https://strengthsmp-backend.onrender.com";
const SERVER_IP = "strengthsmp.mc-srv.pro";

let currentUser = null;

/* =========================
   SCREEN SYSTEM
========================= */
function showScreen(id){

  const screens = document.querySelectorAll(".screen");

  screens.forEach(s => {
    s.classList.remove("active");
  });

  const target = document.getElementById(id);

  if(!target) return;

  setTimeout(() => {
    target.classList.add("active");
  }, 25);

  document.body.classList.toggle("store-open", id === "shop");

  if(id === "leaderboard"){
    loadLeaderboard();
  }
}

/* =========================
   INIT
========================= */
window.addEventListener("DOMContentLoaded", async () => {

  showScreen("home");

  const token = localStorage.getItem("token");

  if(token){

    try{

      const res = await fetch(`${API_URL}/me`, {
        headers:{
          "Authorization":token
        }
      });

      const data = await res.json();

      if(!data.error){
        currentUser = data.username;
      } else {
        localStorage.removeItem("token");
      }

    } catch {
      localStorage.removeItem("token");
    }
  }

  updateNav();
  updateServer();
  setInterval(updateServer, 10000);
});

/* =========================
   COPY IP
========================= */
function copyIP(){

  navigator.clipboard.writeText(SERVER_IP);

  const toast = document.getElementById("toast");

  if(!toast) return;

  toast.innerText = "IP copied!";
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

  requestAnimationFrame(() => {
    if(btn){
      btn.innerText = "Copy IP";
    }
  });

/* =========================
   LOGIN
========================= */
async function login(){

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if(!username || !password) return;

  const btn = document.querySelector(".btn-primary");

  uiLocked = true;

  if(btn){
    btn.innerText = "Logging in...";
    btn.disabled = true;
  }

  try{

    const res = await fetch(`${API_URL}/login`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        username,
        password
      })
    });

    const data = await res.json();

    if(data.token){

      localStorage.setItem("token", data.token);

      currentUser = username;

      updateNav();

      showScreen("home");

      const copyBtn = document.getElementById("copy-ip-btn");

      if(copyBtn){
        copyBtn.innerText = "Copy IP";
      }

    } else {
      alert(data.error || "Login failed");
    }

  } catch {
    alert("Server error");
  }

  if(btn){
    btn.innerText = "Login";
    btn.disabled = false;
  }

  uiLocked = false;
}

/* =========================
   REGISTER
========================= */
async function register(){

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if(!username || !password) return;

  const btn = document.querySelectorAll(".btn")[1];

  if(btn){
    btn.innerText = "Creating...";
    btn.disabled = true;
  }

  try{

    const res = await fetch(`${API_URL}/register`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        username,
        password
      })
    });

    const data = await res.json();

    if(data.success){
      alert("Account created! Now login.");
    } else {
      alert(data.error || "Register failed");
    }

  } catch {
    alert("Server error");
  }

  if(btn){
    btn.innerText = "Register";
    btn.disabled = false;
  }
}

/* =========================
   LOGOUT
========================= */
function logout(){

  currentUser = null;

  localStorage.removeItem("token");

  updateNav();
}

/* =========================
   NAV SYSTEM
========================= */
function updateNav(){

  const nav = document.getElementById("nav-links");

  if(!nav) return;

  let loginBtn = document.getElementById("login-btn");

  if(currentUser){

    if(loginBtn){
      loginBtn.remove();
    }

    let user = document.getElementById("user");

    if(!user){

      user = document.createElement("div");

      user.id = "user";

      const name = document.createElement("span");
      name.innerText = currentUser;

      const dropdown = document.createElement("div");

      dropdown.innerText = "Logout";

      dropdown.style.position = "absolute";
      dropdown.style.top = "100%";
      dropdown.style.left = "0";
      dropdown.style.background = "rgba(0,0,0,0.9)";
      dropdown.style.padding = "6px 10px";
      dropdown.style.border = "1px solid red";
      dropdown.style.borderRadius = "6px";
      dropdown.style.opacity = "0";
      dropdown.style.pointerEvents = "none";
      dropdown.style.transition = "0.2s";
      dropdown.style.zIndex = "9999";

      user.appendChild(name);
      user.appendChild(dropdown);

      user.onmouseenter = () => {
        dropdown.style.opacity = "1";
        dropdown.style.pointerEvents = "auto";
      };

      user.onmouseleave = () => {
        dropdown.style.opacity = "0";
        dropdown.style.pointerEvents = "none";
      };

      dropdown.onclick = logout;

      nav.appendChild(user);
    }

  } else {

    const user = document.getElementById("user");

    if(user){
      user.remove();
    }

    if(!loginBtn){

      const a = document.createElement("a");

      a.id = "login-btn";
      a.innerText = "Login";

      a.onclick = () => showScreen("login");

      nav.appendChild(a);
    }
  }
}

/* =========================
   SERVER STATUS
========================= */
async function updateServer(){

  const status = document.getElementById("server-status");
  const players = document.getElementById("player-count");

  if(!status || !players) return;

  try{

    const res = await fetch(`https://api.mcsrvstat.us/2/${SERVER_IP}`);

    const data = await res.json();

    status.classList.remove("online", "offline");

    if(data.online){

      status.innerText = "ONLINE";

      status.classList.add("online");

      players.innerText =
        `${data.players.online}/${data.players.max}`;

    } else {

      status.innerText = "OFFLINE";

      status.classList.add("offline");

      players.innerText = "0/0";
    }

  } catch {

    status.innerText = "ERROR";

    players.innerText = "0/0";
  }
}

/* =========================
   LEADERBOARDS
========================= */
async function loadLeaderboard(){

  try{

    const res = await fetch(`${API_URL}/leaderboard`);
    const data = await res.json();

    document.getElementById("kills-list").innerHTML =
      data.kills.slice(0,5).map((p,i)=>
        `<div>#${i+1} ${p.username} - ${p.kills}</div>`
      ).join("");

    document.getElementById("deaths-list").innerHTML =
      data.deaths.slice(0,5).map((p,i)=>
        `<div>#${i+1} ${p.username} - ${p.deaths}</div>`
      ).join("");

    document.getElementById("money-list").innerHTML =
      data.money.slice(0,5).map((p,i)=>
        `<div>#${i+1} ${p.username} - ${p.money}</div>`
      ).join("");

  } catch {
    console.log("Leaderboard error");
  }
}

setInterval(loadLeaderboard, 5000);

/* =========================
   PARTICLES
========================= */
const canvas = document.getElementById("particles");

const ctx = canvas
  ? canvas.getContext("2d")
  : null;

function resize(){

  if(!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resize();

window.addEventListener("resize", resize);

const PARTICLE_COUNT =
  window.innerWidth < 768 ? 25 : 60;

let particles = [];

if(canvas){

  for(let i = 0; i < PARTICLE_COUNT; i++){

    particles.push({
      x:Math.random() * window.innerWidth,
      y:Math.random() * window.innerHeight,
      r:Math.random() * 2,
      dx:(Math.random() - 0.5),
      dy:(Math.random() - 0.5)
    });
  }
}

function animate(){

  if(!ctx) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  particles.forEach(p => {

    p.x += p.dx;
    p.y += p.dy;

    if(p.x < 0 || p.x > canvas.width){
      p.dx *= -1;
    }

    if(p.y < 0 || p.y > canvas.height){
      p.dy *= -1;
    }

    ctx.beginPath();

    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

    ctx.fillStyle = "white";

    ctx.fill();
  });

  requestAnimationFrame(animate);
}

if(canvas){
  animate();
}

/* =========================
   STORE
========================= */
function buy(){

  window.open(
    "https://www.paypal.com/paypalme/darckfps",
    "_blank"
  );
}

/* =========================
   ESC CLOSE
========================= */
document.addEventListener("keydown", function(e){

  if(e.key === "Escape"){

    const shop = document.getElementById("shop");

    if(shop && shop.classList.contains("active")){
      showScreen("home");
    }
  }
});