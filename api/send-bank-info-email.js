import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  res.setHeader("Content-Type", "application/json");

  try {
    const { paymentOption } = req.body;

    // Check if this is a new payment options request or legacy bank info request
    const isPaymentOptionsRequest = paymentOption && ["bank-transfer", "check-by-mail", "pickup-check"].includes(paymentOption);

    // Get email configuration from environment variables
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPasskey = process.env.SMTP_PASSKEY;
    const emailFrom = process.env.EMAIL_FROM || "elite-id-app@eliteny.com";
    const emailTo = process.env.EMAIL_TO || "driver.relations@eliteny.com";

    if (!smtpUsername || !smtpPasskey) {
      console.error("SMTP credentials not configured");
      return res.status(500).json({ error: "Email service not configured" });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUsername,
        pass: smtpPasskey,
      },
    });

    let emailSubject = "";
    let emailBody = "";

    // Handle new payment options format
    if (isPaymentOptionsRequest) {
      const { basicInfo } = req.body;
      
      // Build basic info section
      let basicInfoSection = "";
      if (basicInfo) {
        basicInfoSection = `
Personal Information:
- First Name: ${basicInfo.firstName || "N/A"}
- Last Name: ${basicInfo.lastName || "N/A"}
- Cell Phone: ${basicInfo.cellPhone || "N/A"}
- Email: ${basicInfo.email || "N/A"}

Vehicle Information:
- Plate Number: ${basicInfo.plateNumber || "N/A"}
- Make | Model: ${basicInfo.makeModel || basicInfo.make || "N/A"}
- Model Year: ${basicInfo.modelYear || "N/A"}
- Color: ${basicInfo.color || "N/A"}

`;
      }

      if (paymentOption === "bank-transfer") {
        const { accountName, phone, plateNumber, accountNumber, routingNumber, bankName } = req.body;

        // Validate required fields for bank transfer
        if (!accountName || !accountNumber || !routingNumber || !bankName) {
          return res.status(400).json({ error: "Missing required fields for bank transfer" });
        }

        emailSubject = "New Driver Application - Complete Registration";
        emailBody = `
New Driver Application - Payment Option: Bank Transfer

${basicInfoSection}Bank Account Details:
- Account Name: ${accountName}
${phone ? `- Phone: ${phone}` : ""}
${plateNumber ? `- Plate Number: ${plateNumber}` : ""}
- Account Number: ${accountNumber}
- Routing Number: ${routingNumber}
- Bank Name: ${bankName}
        `.trim();
      } else if (paymentOption === "check-by-mail") {
        const { nameOnCheck, streetNumber, streetName, town, state, zipCode } = req.body;

        // Validate required fields for check by mail
        if (!nameOnCheck || !streetNumber || !streetName || !town || !state || !zipCode) {
          return res.status(400).json({ error: "Missing required fields for check by mail" });
        }

        emailSubject = "New Driver Application - Complete Registration";
        emailBody = `
New Driver Application - Payment Option: Check by Mail

${basicInfoSection}Mailing Address:
- Name on Check: ${nameOnCheck}
- Street Number: ${streetNumber}
- Street Name: ${streetName}
- Town: ${town}
- State: ${state}
- Zip Code: ${zipCode}
        `.trim();
      } else if (paymentOption === "pickup-check") {
        emailSubject = "New Driver Application - Complete Registration";
        emailBody = `
New Driver Application - Payment Option: Pickup Check

${basicInfoSection}The driver has selected to pick up their check at:
- Elite Limousine Plus, Inc.
- 32-72 Gale Ave
- Long Island City, NY 11101
- Driver Relations (first floor)
- Phone: 718-472-2300 x237 / x211
- Hours: Mon - Fri 10:00 am - 6:00 pm
        `.trim();
      }
    } else {
      // Legacy bank info format (for backward compatibility)
      const { accountName, phone, plateNumber, accountNumber, routingNumber } = req.body;

      // Validate required fields
      if (!accountName || !phone || !plateNumber || !accountNumber || !routingNumber) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      emailSubject = "Driver provided Bank info";
      emailBody = `
New Driver Application - Bank Information

Bank Account Details:
- Account Name: ${accountName}
- Phone: ${phone}
- Plate Number: ${plateNumber}
- Account Number: ${accountNumber}
- Routing Number: ${routingNumber}
      `.trim();
    }

    // Send email
    const info = await transporter.sendMail({
      from: emailFrom,
      to: emailTo,
      subject: emailSubject,
      text: emailBody,
    });

    console.log("Email sent:", info.messageId);

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Failed to send email", error);
    return res.status(500).json({
      error: error?.message || "Failed to send email",
    });
  }
}
