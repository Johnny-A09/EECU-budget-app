const tabButtons = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.panel');

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
