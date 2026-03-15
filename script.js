const tabButtons = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.panel');
const dropDown = document.getElementById('career');
const taxSwitch = document.getElementById('month-tax');
const yearlyIncome = document.getElementById('yearly-income');
const monthlyIncome = document.getElementById('monthly-income');
const netYearlyIncome = document.getElementById('net-yearly-income');
const netMonthlyIncome = document.getElementById('net-monthly-income');
const medicareTax = document.getElementById('medicare-tax');
const socialSecurityTax = document.getElementById('social-security-tax');
const stateTax = document.getElementById('state-tax');
const federalTax = document.getElementById('federal-tax');
const fedRate = document.getElementById('fed-rate');
const totalDeduction = document.getElementById('total-deduction');
const calculator = document.getElementById('budget');
const canvas = document.getElementById('pie');
const students = document.getElementById('student');
const housings = document.getElementById('housing');
const essentials1 = document.getElementById('essentials');
const lifestyles = document.getElementById('lifestyle');
const futures = document.getElementById('future');
const savings1 = document.getElementById('savings');
const transName1 = document.getElementById('name');
const amount = document.getElementById('amount');
const transType1 = document.getElementById('trans-type');
const submit = document.getElementById('submit');
const currentMoney = document.getElementById('current-money');
const confirmBox = document.getElementById('confirm-cont');
const yes = document.getElementById('yes');
const no = document.getElementById('no');
const table = document.getElementById('table');
const inputs = [students, housings, essentials1, lifestyles, futures, savings1];
let cm = 0;
let occupation = '';
let salary = 0;
let currentChart = null;
let prevOccupation = '';
let prevSalary = 0;
let careers = [];
let transactions = [];

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    panels.forEach(panel => panel.style.display = 'none');
    button.classList.add('active');
    const targetTab = button.getAttribute('data-tab');
    document.getElementById(targetTab).style.display = 'flex';
  });
});


function createButtons(careers) {
  careers.forEach((career, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = career.Occupation;
    dropDown.appendChild(option);
  });
  dropDown.addEventListener("change", (event) => {
    prevOccupation = occupation;
    prevSalary = salary;
    const selectedIndex = event.target.value;
    occupation = careers[selectedIndex].Occupation;
    salary = careers[selectedIndex].Salary;
    if(prevOccupation && transactions.length > 0){
      confirmBox.style.display = 'flex'; 
      document.getElementById('overlay').style.display = 'block';
      yes.onclick = function () {
        displayIncome();
        confirmBox.style.display = 'none'; 
        document.getElementById('overlay').style.display = 'none';
        transactions = [];
        while(table.rows.length > 1){table.deleteRow(-1)};
        saveCareer(); 
        return; 
      };
      no.onclick = function(){
        occupation = prevOccupation;
        salary = prevSalary;
        const prevIndex = careers.findIndex(career => career.Occupation === prevOccupation);
        dropDown.value = prevIndex;
        confirmBox.style.display = 'none'; 
        document.getElementById('overlay').style.display = 'none';
        displayIncome();
        return;
      };
      return;
    };
        displayIncome();
        saveCareer(); 
  }); 
}

async function getCareers() {
      const url = "https://eecu-data-server.vercel.app/data";
      try {
          const response = await fetch(url);
          careers = await response.json();
          createButtons(careers);
          loadCareer(careers);
          return careers;
      }
      catch (error) {
          console.error("Error fetching careers data:", error);
          return [];
      }
      
}

function saveCareer() {
  if (occupation && salary) {
    const careerData = { occupation, salary };
    localStorage.setItem('selectedCareer', JSON.stringify(careerData));
    console.log(`Saved Career: ${occupation} with Salary: ${salary}`);
  } else {
    console.log('No career found.');
  }
}

function loadCareer() {
  const savedCareer = localStorage.getItem('selectedCareer');
  if (savedCareer) {
    ({ occupation, salary } = JSON.parse(savedCareer));
    const savedIndex = careers.findIndex(career => career.Occupation === occupation);
    dropDown.value = savedIndex;
    console.log(occupation);
    console.log(salary);
    console.log(`Loaded Career: ${occupation} with Salary: ${salary}`);
    displayIncome();
  }
}

const federalCalculator = () => {
  if (salary <= 12400) {
    fedRate.textContent = "10";
    return salary * 0.10;
  }
  else if (salary <= 50400) {
    fedRate.textContent = "12";
    return 1240 + (salary - 12400) * 0.12;
  }
  else if (salary > 50400) {
    fedRate.textContent = "22";
    return 5800 + (salary - 50400) * 0.22;
  }
} //for federal tax related stuff

function taxes() {
  const state = salary * 0.04;
  const socialSecurity = salary * 0.062;
  const medicare = salary * 0.0145;
  const federal = federalCalculator();
  const totalTaxes = (state + socialSecurity + medicare + federal).toFixed(0);
  return totalTaxes;
}

function displayIncome() {
  const totalTaxes = taxes();
  const federal = federalCalculator(); 
  yearlyIncome.textContent = `${salary}`;
  monthlyIncome.textContent = `${(salary / 12).toFixed(0)}`;
  netYearlyIncome.textContent = `${(salary - totalTaxes).toFixed(0)}`;
  netMonthlyIncome.textContent = `${((salary - totalTaxes) / 12).toFixed(0)}`;
  medicareTax.textContent = `${(salary * 0.0145).toFixed(0)}`;
  socialSecurityTax.textContent = `${(salary * 0.062).toFixed(0)}`;
  stateTax.textContent = `${(salary * 0.04).toFixed(0)}`;
  federalTax.textContent = `${federal.toFixed(0)}`;
  totalDeduction.textContent = `${totalTaxes}`;
  cm = Number(((salary -totalTaxes )/ 12).toFixed(0));
  currentMoney.textContent = cm;
  cmCheck();
}

//calculating totals, saving to local storage, updating chart
function calcSaveChart() {
    const savedExpenses = {};
    let housing = 0;
    let life = 0;
    let essentials = 0;
    let student = 0;
    let future = 0;
    let savings = 0;

    let total = 0;
    inputs.forEach(input => {
        total += Number(input.value.replace(/[^0-9]/g, '')) || 0; //adding total

        savedExpenses[input.id] = Number(input.value.replace(/[^0-9]/g, '')) || 0; //adding expense to array to save
        if (input.classList.contains("housing")) { //checks which category input belongs to & adds only the integers
            housing += Number(input.value.replace(/[^0-9]/g, '')) || 0;
        }
        else if (input.classList.contains("lifestyle")) {
            life += Number(input.value.replace(/[^0-9]/g, '')) || 0;
        }
        else if (input.classList.contains("essentials")) {
            essentials += Number(input.value.replace(/[^0-9]/g, '')) || 0;
        }
        else if (input.classList.contains("student")) {
            student += Number(input.value.replace(/[^0-9]/g, '')) || 0;
        }
        else if (input.classList.contains("future")) {
            future += Number(input.value.replace(/[^0-9]/g, '')) || 0;
        }
        else if (input.classList.contains("savings")) {
            savings += Number(input.value.replace(/[^0-9]/g, '')) || 0;
        }
    });

    localStorage.setItem("savedExpenses", JSON.stringify(savedExpenses)); //saving

    if (currentChart) currentChart.destroy();
    currentChart = new Chart(canvas, //new chart
        {
            type: "pie",
            data: {
                labels: ["Housing (%)", "Student Loans (%)", "Essentials", "Lifestyle", "Future Planning", "Savings"],
                datasets: [{ label: "$", data: [housing, student, essentials, life, future, savings] }]
            },
            options: {
                plugins: {
                    title: { display: true, text: `Expenses by Catagory` }
                }
            }
        }
    )
};

function save() {
    const pullExpenses = JSON.parse(localStorage.getItem("savedExpenses")); //grabbing array
    inputs.forEach(input => { //updating input fields with previous numbers
        if (pullExpenses) {
            if (pullExpenses[input.id]) {
                input.value = pullExpenses[input.id]
            }
        }
        calcSaveChart(); //update page
    })
};

calculator.addEventListener("input", () => { //any input for text box updates totals, storage, and chart
    calcSaveChart();
});

submit.addEventListener("click", function() {
const transName = transName1.value;
const transAmount = Number(amount.value);
const transType = transType1.value;
  if( transName === '' || transAmount <= 0 || transType === 'default'){
    document.getElementById('error-cont').style.display = 'flex'; 
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('close').addEventListener('click', function(){
    document.getElementById('error-cont').style.display = 'none'; 
    document.getElementById('overlay').style.display = 'none';
    });
    return;
  };
  if(transType === 'deposit'){cm += transAmount; };
  if(transType === 'withdraw'){cm -= transAmount; };
  transactions.push({transName, transAmount, transType, cm});
  const newTableRow = document.createElement('tr');
  const newTableD = document.createElement('td');
  const newTableD1 = document.createElement('td');
  const newTableD2 = document.createElement('td');
  const newTableD3 = document.createElement('td');
  currentMoney.textContent = cm;
  newTableD.textContent = transName;
  newTableRow.appendChild(newTableD);
  newTableD1.textContent = transAmount;
  newTableRow.appendChild(newTableD1);
  newTableD2.textContent = transType;
  newTableRow.appendChild(newTableD2);
  newTableD3.textContent = cm;
  newTableRow.appendChild(newTableD3);
  table.appendChild(newTableRow);
  tableStuff();
  localStorage.setItem("transactions", JSON.stringify(transactions));

  //keep at end
  cmCheck();
  revertCheckB();
});
function savedArray(){
  const pullTransactions = JSON.parse(localStorage.getItem("transactions"));
  if(pullTransactions){
    transactions = pullTransactions;
    cm = pullTransactions[pullTransactions.length - 1].cm;
    transactions.forEach(entry => {
    const oldTableRow = document.createElement('tr');
    const oldTableD = document.createElement('td');
    oldTableD.textContent = entry.transName;
    oldTableRow.appendChild(oldTableD);
    const oldTableD1 = document.createElement('td');
    oldTableD1.textContent = entry.transAmount;
    oldTableRow.appendChild(oldTableD1);
    const oldTableD2 = document.createElement('td');
    oldTableD2.textContent = entry.transType;
    oldTableRow.appendChild(oldTableD2);
    const oldTableD3 = document.createElement('td');
    oldTableD3.textContent = entry.cm;
    oldTableRow.appendChild(oldTableD3);
    table.appendChild(oldTableRow);
  });
  }
};
function revertCheckB(){
  transName1.value = '';
  amount.value = '';
  transType1.value = 'default';
};
function cmCheck(){
  if(cm > 0){
    currentMoney.style.color = 'var(--positive)';
  }else if (cm == 0){
    currentMoney.style.color = 'black';
  }else {
    currentMoney.style.color = 'var(--negative)';
  }
  localStorage.setItem("currentMoney", cm);
};
function initalize() {
  getCareers();
  save();
  savedArray();
  console.log("The code is WORKING.");
};  
//sets up the page on boot. keep at bottom to avoid and order of operations errors
initalize();