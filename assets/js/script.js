// Select the button and input group
const subscribeButton = document.querySelector('.button--submit');

subscribeButton.addEventListener('click', function () {
  // Check if the input is not empty (optional validation)
  const emailInput = document.querySelector('#Email');
  if (emailInput.value.trim() === "") {
    alert("Please enter an email address.");
    return;
  }

  // Create a confirmation message
  let confirmationMessage = document.querySelector('.confirmation-message');
  
  if (!confirmationMessage) {
    confirmationMessage = document.createElement('p');
    confirmationMessage.className = 'confirmation-message';
    confirmationMessage.textContent = 'Email Subscribed!';
    
    // Insert the message under the form container
    const inputGroup = document.querySelector('.input-group');
    inputGroup.insertAdjacentElement('afterend', confirmationMessage);
  }
});

