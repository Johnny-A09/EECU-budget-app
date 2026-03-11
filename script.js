const tabButtons = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.panel');
const dropDown = document.getElementById('career');
const yearlyIncome = document.getElementById('yearly-income');
const monthlyIncome = document.getElementById('monthly-income');
const netYearlyIncome = document.getElementById('net-yearly-income');
const netMonthlyIncome = document.getElementById('net-monthly-income');
const medicareTax = document.getElementById('medicare-tax');
const socialSecurityTax = document.getElementById('social-security-tax');
const stateTax = document.getElementById('state-tax');
const federalTax = document.getElementById('federal-tax');
const totalDeduction = document.getElementById('total-deduction');
let occupation = '';
let salary = 0;


tabButtons.forEach(button => {
  button.addEventListener('click', () => {

    // Remove active class from all buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));

    // Hide all panels
    panels.forEach(panel => panel.style.display = 'none');

    // Activate clicked button
    button.classList.add('active');

    // Show the matching panel
    const targetTab = button.getAttribute('data-tab');
    document.getElementById(targetTab).style.display = 'block';
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
    return salary * 0.10;
  }
  else if (salary <= 50400) {
    return 1240 + (salary - 12400) * 0.12;
  }
  else if (salary > 50400) {
    return 5800 + (salary - 50400) * 0.22;
  }
} //for federal tax related stuff

function taxes() {
  const state = salary * 0.04;
  const socialSecurity = salary * 0.062;
  const medicare = salary * 0.0145;
  const federal = federalCalculator();
  const totalTaxes = (state + socialSecurity + medicare + federal).toFixed(2);
  return totalTaxes;
}

function displayIncome() {
  const totalTaxes = taxes();
  const federal = federalCalculator(); 
  yearlyIncome.textContent = `${salary}`;
  monthlyIncome.textContent = `${(salary / 12).toFixed(2)}`;
  netYearlyIncome.textContent = `${(salary - totalTaxes).toFixed(2)}`;
  netMonthlyIncome.textContent = `${((salary - totalTaxes) / 12).toFixed(2)}`;
  medicareTax.textContent = `${(salary * 0.0145).toFixed(2)}`;
  socialSecurityTax.textContent = `${(salary * 0.062).toFixed(2)}`;
  stateTax.textContent = `${(salary * 0.04).toFixed(2)}`;
  federalTax.textContent = `${federal.toFixed(2)}`;
  totalDeduction.textContent = `${totalTaxes}`;
}

function initalize() {
  loadCareer();
  getCareers();
  displayIncome();
  console.log("The code is WORKING.")
};


//sets up the page on boot. keep at bottom to avoid and order of operations errors
initalize();