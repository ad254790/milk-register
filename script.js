// -------- USERS --------
const users = [
  { username:"admin1", password:"admin123", role:"admin" },
  { username:"manager1", password:"manager123", role:"manager" },
  { username:"staff1", password:"staff123", role:"staff" }
];
let currentUser = null;

// -------- LOGIN --------
function login(){
  const uname = document.getElementById("username").value.trim();
  const pwd = document.getElementById("password").value.trim();
  const role = document.getElementById("roleSelect").value;

  const user = users.find(u=>u.username===uname && u.password===pwd && u.role===role);
  if(!user){ alert("Invalid credentials!"); return; }

  currentUser = user;
  document.getElementById("loginDiv").classList.add("hidden");
  document.getElementById("appDiv").classList.remove("hidden");

  if(currentUser.role==="staff"){
    document.getElementById("newFarmer").disabled=true;
    document.getElementById("newFarmerID").disabled=true;
    document.querySelectorAll("button").forEach(b=>{ if(b.innerText.includes("किसान") || b.innerText.includes("सेव")) b.disabled=true; });
    document.getElementById("rate").disabled=true;
  }

  populateFarmers();
}

// -------- LOGOUT --------
function logout(){
  currentUser=null;
  document.getElementById("loginDiv").classList.remove("hidden");
  document.getElementById("appDiv").classList.add("hidden");
}

// -------- FARMER FUNCTIONS --------
function addFarmer(){
  if(currentUser.role==="staff"){ alert("Staff cannot edit"); return; }
  const name=document.getElementById("newFarmer").value.trim();
  const id=document.getElementById("newFarmerID").value.trim();
  if(!name || !id){ alert("Enter name & ID"); return; }

  let farmers=JSON.parse(localStorage.getItem("farmerList")||"{}");
  if(farmers[id]){ alert("ID already exists"); return; }
  if(Object.values(farmers).some(f=>f.name.toLowerCase()===name.toLowerCase())){ alert("Farmer exists"); return; }

  farmers[id]={name}; 
  localStorage.setItem("farmerList", JSON.stringify(farmers));
  populateFarmers();
  document.getElementById("newFarmer").value=""; document.getElementById("newFarmerID").value="";
}

function removeFarmer(){
  if(currentUser.role==="staff"){ alert("Staff cannot edit"); return; }
  const id=document.getElementById("farmerSelect").value;
  if(!id){ alert("Select farmer"); return; }
  if(!confirm("Confirm remove?")) return;

  let farmers=JSON.parse(localStorage.getItem("farmerList")||"{}");
  delete farmers[id]; localStorage.setItem("farmerList", JSON.stringify(farmers));

  let milkData=JSON.parse(localStorage.getItem("milkData")||"{}");
  Object.keys(milkData).forEach(k=>{ if(k.startsWith(id+"_")) delete milkData[k]; });
  localStorage.setItem("milkData", JSON.stringify(milkData));

  populateFarmers(); clearTable();
}

function populateFarmers(){
  const sel=document.getElementById("farmerSelect");
  sel.innerHTML=`<option value="">--किसान चुनें--</option>`;
  const farmers=JSON.parse(localStorage.getItem("farmerList")||"{}");
  for(let id in farmers){
    const opt=document.createElement("option");
    opt.value=id; opt.textContent=`${farmers[id].name} (${id})`; sel.appendChild(opt);
  }
}

// -------- TABLE --------
function daysInMonth(month,year){ const m={"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11}; return