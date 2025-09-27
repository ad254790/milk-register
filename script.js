// ---------------- USERS ----------------
const users = [
  { username:"admin1", password:"admin123", role:"admin" },
  { username:"manager1", password:"manager123", role:"manager" },
  { username:"staff1", password:"staff123", role:"staff" }
];

let currentUser = null;

// ---------------- LOGIN ----------------
function login(){
  const uname = document.getElementById("username").value.trim();
  const pwd = document.getElementById("password").value.trim();
  const role = document.getElementById("roleSelect").value;

  const user = users.find(u=>u.username===uname && u.password===pwd && u.role===role);
  if(!user){ alert("Invalid credentials!"); return; }

  currentUser = user;
  document.getElementById("loginDiv").classList.add("hidden");
  document.getElementById("appDiv").classList.remove("hidden");

  alert(`Welcome ${currentUser.role.toUpperCase()} ${currentUser.username}`);

  if(currentUser.role==="staff"){
    document.getElementById("newFarmer").disabled = true;
    document.getElementById("newFarmerID").disabled = true;
    document.querySelectorAll("button").forEach(btn=>{
      if(btn.innerText.includes("किसान") || btn.innerText.includes("सेव")) btn.disabled = true;
    });
    document.getElementById("rate").disabled = true;
  }

  populateFarmers();
}

// ---------------- LOGOUT ----------------
function logout(){
  currentUser=null;
  document.getElementById("loginDiv").classList.remove("hidden");
  document.getElementById("appDiv").classList.add("hidden");
}

// ---------------- FARMER FUNCTIONS ----------------
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
  document.getElementById("newFarmer").value="";
  document.getElementById("newFarmerID").value="";
  alert("Farmer added!");
}

function removeFarmer(){
  if(currentUser.role==="staff"){ alert("Staff cannot edit"); return; }
  const id=document.getElementById("farmerSelect").value;
  if(!id){ alert("Select farmer"); return; }
  if(!confirm("Confirm remove?")) return;

  let farmers=JSON.parse(localStorage.getItem("farmerList")||"{}");
  delete farmers[id]; 
  localStorage.setItem("farmerList", JSON.stringify(farmers));

  let milkData=JSON.parse(localStorage.getItem("milkData")||"{}");
  Object.keys(milkData).forEach(k=>{ if(k.startsWith(id+"_")) delete milkData[k]; });
  localStorage.setItem("milkData", JSON.stringify(milkData));

  populateFarmers(); 
  clearTable();
  alert("Farmer removed with all data!");
}

function populateFarmers(){
  const sel=document.getElementById("farmerSelect");
  sel.innerHTML=`<option value="">--किसान चुनें--</option>`;
  const farmers=JSON.parse(localStorage.getItem("farmerList")||"{}");
  for(let id in farmers){
    const opt=document.createElement("option");
    opt.value=id; 
    opt.textContent=`${farmers[id].name} (${id})`; 
    sel.appendChild(opt);
  }
}

// ---------------- TABLE ----------------
function daysInMonth(month,year){
  const m={"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
  return new Date(year, m[month]+1, 0).getDate();
}

function generateTable(){
  const month=document.getElementById("monthSelect").value;
  const year=document.getElementById("yearInput").value;
  if(!month || !year) return;

  const totalDays=daysInMonth(month,year);
  const table=document.getElementById("milkTable");
  table.innerHTML="";

  for(let i=1;i<=totalDays;i+=2){
    let row="<tr>";
    row += `<td>${i}</td><td><input type="number" id="m${i}" class="qty" value="0" min="0"></td><td><input type="number" id="e${i}" class="qty" value="0" min="0"></td>`;
    if(i+1<=totalDays){
      row += `<td>${i+1}</td><td><input type="number" id="m${i+1}" class="qty" value="0" min="0"></td><td><input type="number" id="e${i+1}" class="qty" value="0" min="0"></td>`;
    } else {
      row += "<td></td><td></td><td></td>";
    }
    row += "</tr>";
    table.innerHTML+=row;
  }

  document.querySelectorAll(".qty").forEach(q=>{
    q.addEventListener("input", calculateTotal);
    if(currentUser?.role==="staff") q.disabled=true;
  });
  calculateTotal();
}

function clearTable(){
  document.querySelectorAll(".qty").forEach(q=>q.value=0);
  calculateTotal();
}

// ---------------- DATA SAVE/LOAD ----------------
function saveData(){
  if(currentUser.role==="staff"){ alert("Staff cannot edit data"); return; }

  const farmerID=document.getElementById("farmerSelect").value;
  const month=document.getElementById("monthSelect").value;
  const year=document.getElementById("yearInput").value.trim();
  if(!farmerID || !month || !year){ alert("कृपया किसान, महीना और साल दर्ज करें।"); return; }

  let milkData=JSON.parse(localStorage.getItem("milkData")||"{}");
  const key=farmerID+"_"+month+"_"+year;
  milkData[key]={};

  const totalDays=daysInMonth(month,year);
  for(let d=1;d<=totalDays;d++){
    milkData[key][d]={
      morning:Number(document.getElementById("m"+d)?.value)||0,
      evening:Number(document.getElementById("e"+d)?.value)||0
    };
  }
  localStorage.setItem("milkData", JSON.stringify(milkData));
  alert("डेटा सेव हो गया!");
}

function loadData(){
  const farmerID=document.getElementById("farmerSelect").value;
  const month=document.getElementById("monthSelect").value;
  const year=document.getElementById("yearInput").value.trim();
  if(!farmerID || !month || !year){ alert("कृपया किसान, महीना और साल select करें।"); return; }

  generateTable();
  const key=farmerID+"_"+month+"_"+year;
  const milkData=JSON.parse(localStorage.getItem("milkData")||"{}");
  if(!milkData[key]) return;

  const totalDays=daysInMonth(month,year);
  for(let d=1;d<=totalDays;d++){
    document.getElementById("m"+d).value = milkData[key][d]?.morning || 0;
    document.getElementById("e"+d).value = milkData[key][d]?.evening || 0;
  }
  calculateTotal();
}

// ---------------- CALCULATION ----------------
function calculateTotal(){
  let total=0;
  document.querySelectorAll(".qty").forEach(q=> total+=Number(q.value)||0 );
  document.getElementById("totalQty").innerText=total;
  const rate=Number(document.getElementById("rate").value)||0;
  document.getElementById("totalAmount").innerText=rate*total;
}

// ---------------- EXPORT TO EXCEL ----------------
function exportToExcel(){
  const farmerID=document.getElementById("farmerSelect").value;
  const month=document.getElementById("monthSelect").value;
  const year=document.getElementById("yearInput").value.trim();
  if(!farmerID || !month || !year){ alert("कृपया किसान, महीना और साल select करें।"); return; }

  const farmers=JSON.parse(localStorage.getItem("farmerList")||"{}");
  const farmerName=farmers[farmerID]?.name || "Farmer";

  const totalDays=daysInMonth(month,year);
  let dataArr=[["Day","Morning","Evening","Day","Morning","Evening"]];

  for(let i=1;i<=totalDays;i+=2){
    let row=[];
    row.push(i, Number(document.getElementById("m"+i).value)||0, Number(document.getElementById("e"+i).value)||0);
    if(i+1<=totalDays){
      row.push(i+1, Number(document.getElementById("m"+(i+1)).value)||0, Number(document.getElementById("e"+(i+1)).value)||0);
    } else { row.push("","",""); }
    dataArr.push(row);
  }

  const ws=XLSX.utils.aoa_to_sheet(dataArr);
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Milk Data");
  XLSX.writeFile(wb, `${farmerName}_${farmerID}_${month}_${year}_MilkData.xlsx`);
}