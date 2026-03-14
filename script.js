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
const inputs = [students, housings, essentials1, lifestyles, futures, savings1];
let currentChart = null;

let occupation = '';
let salary = 0;


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
    dropDown.addEventListener("change", (event) => {
      const selectedIndex = event.target.value;
      occupation = careers[selectedIndex].Occupation;
      salary = careers[selectedIndex].Salary;
      displayIncome();
    }); 
    dropDown.appendChild(option);
  });
}

  async function getCareers() {
      const url = "https://eecu-data-server.vercel.app/data";
      try {
          const response = await fetch(url);
          const jobs = await response.json();
          createButtons(jobs);
          return jobs;
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
    const { occupation, salary } = JSON.parse(savedCareer);
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
            type: "doughnut",
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



function initalize() {
  loadCareer();
  getCareers();
  displayIncome();
  console.log("The code is WORKING.");
};
//sets up the page on boot. keep at bottom to avoid and order of operations errors
initalize();