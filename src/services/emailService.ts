interface BasicInfoData {
  firstName: string;
  lastName: string;
  cellPhone: string;
  email: string;
  plateNumber: string;
  make: string;
  modelYear: string;
  color: string;
}

export const sendBasicInfoEmail = async (data: BasicInfoData): Promise<void> => {
  const emailSubject = "New Driver Application - Basic Information";
  
  const emailBody = `
New Driver Application - Basic Information

Personal Information:
- First Name: ${data.firstName}
- Last Name: ${data.lastName}
- Cell Phone: ${data.cellPhone}
- Email: ${data.email}

Vehicle Information:
- Plate Number: ${data.plateNumber}
- Make: ${data.make}
- Model Year: ${data.modelYear}
- Color: ${data.color}
  `.trim();

  // Create mailto link
  // Note: This opens the user's email client with pre-filled information
  // For production, consider implementing a backend API endpoint to send emails directly
  const mailtoLink = `mailto:driver.relations@eliteny.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  
  // Open email client
  window.location.href = mailtoLink;
  
  // Return a promise that resolves after a short delay to allow the email client to open
  // In a production environment with a backend API, you would make an actual API call here:
  // const response = await fetch('/api/send-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ to: 'driver.relations@eliteny.com', subject: emailSubject, body: emailBody })
  // });
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 100);
  });
};

