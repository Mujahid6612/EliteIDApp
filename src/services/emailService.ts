import { addTimestampParam } from "../utils/addTimestampParam";

interface BankInfoData {
  accountName: string;
  phone: string;
  plateNumber: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
}

interface PaymentOptionsData {
  paymentOption: "bank-transfer" | "check-by-mail" | "pickup-check";
  // Bank Transfer fields
  accountName?: string;
  phone?: string;
  plateNumber?: string;
  accountNumber?: string;
  routingNumber?: string;
  bankName?: string;
  // Check by Mail fields
  nameOnCheck?: string;
  streetNumber?: string;
  streetName?: string;
  town?: string;
  state?: string;
  zipCode?: string;
}

export const sendBankInfoEmail = async (data: BankInfoData): Promise<void> => {
  try {
    const response = await fetch(addTimestampParam("/api/send-bank-info-email"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to send email");
    }

    const result = await response.json();
    console.log("Email sent successfully:", result.messageId);
  } catch (error) {
    console.error("Error sending bank info email:", error);
    throw error;
  }
};

export const sendPaymentOptionsEmail = async (
  data: PaymentOptionsData
): Promise<void> => {
  try {
    // Use the existing bank-info-email endpoint which now handles all payment options
    const response = await fetch(addTimestampParam("/api/send-bank-info-email"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to send email");
    }

    const result = await response.json();
    console.log("Email sent successfully:", result.messageId);
  } catch (error) {
    console.error("Error sending payment options email:", error);
    throw error;
  }
};
