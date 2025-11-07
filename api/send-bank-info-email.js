import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  res.setHeader("Content-Type", "application/json");

  try {
    const { accountName, accountNumber, routingNumber, bankName } = req.body;

    // Validate required fields
    if (!accountName || !accountNumber || !routingNumber || !bankName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

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

    // Email content
    const emailSubject = "New Driver Application - Bank Information";
    const emailBody = `
New Driver Application - Bank Information

Bank Account Details:
- Account Name: ${accountName}
- Account Number: ${accountNumber}
- Routing Number: ${routingNumber}
- Bank Name: ${bankName}
    `.trim();

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
